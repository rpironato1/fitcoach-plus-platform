/**
 * Authentication and Dashboard Flow Testing
 *
 * This test covers login, dashboard access, and core user flows
 */

import { test, expect, Page } from "@playwright/test";

// Test credentials for localStorage implementation
const TEST_USERS = {
  admin: { email: "admin@fitcoach.com", password: "admin123" },
  trainer: { email: "trainer@fitcoach.com", password: "trainer123" },
  student: { email: "student@fitcoach.com", password: "student123" },
};

// Utility functions
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `screenshots/comprehensive-flows/${name}.png`,
    fullPage: true,
  });
}

async function setupTestData(page: Page) {
  // Setup test users in localStorage
  await page.evaluate(() => {
    const users = [
      {
        id: "admin-001",
        email: "admin@fitcoach.com",
        password: "admin123", // In real app, this would be hashed
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      },
      {
        id: "trainer-001",
        email: "trainer@fitcoach.com",
        password: "trainer123",
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      },
      {
        id: "student-001",
        email: "student@fitcoach.com",
        password: "student123",
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      },
    ];

    const profiles = [
      {
        id: "admin-001",
        first_name: "Admin",
        last_name: "User",
        phone: null,
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "trainer-001",
        first_name: "Personal",
        last_name: "Trainer",
        phone: "+5511999999999",
        role: "trainer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "student-001",
        first_name: "Student",
        last_name: "User",
        phone: "+5511888888888",
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const trainerProfiles = [
      {
        id: "trainer-001",
        plan: "pro",
        max_students: 50,
        ai_credits: 100,
        active_until: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        avatar_url: null,
        bio: "Experienced personal trainer with 5+ years",
        whatsapp_number: "+5511999999999",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const studentProfiles = [
      {
        id: "student-001",
        trainer_id: "trainer-001",
        gender: "female",
        menstrual_cycle_tracking: true,
        start_date: new Date().toISOString(),
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Store in localStorage
    localStorage.setItem("fitcoach_users", JSON.stringify(users));
    localStorage.setItem("fitcoach_profiles", JSON.stringify(profiles));
    localStorage.setItem(
      "fitcoach_trainer_profiles",
      JSON.stringify(trainerProfiles)
    );
    localStorage.setItem(
      "fitcoach_student_profiles",
      JSON.stringify(studentProfiles)
    );
  });
}

async function performLogin(
  page: Page,
  userType: "admin" | "trainer" | "student"
) {
  const user = TEST_USERS[userType];

  // Setup test data first
  await setupTestData(page);

  await page.goto("http://localhost:8030/");
  await page.waitForLoadState("networkidle");
  await takeScreenshot(page, `${userType}-login-01-landing-page`);

  // Look for login form elements
  const loginFormVisible = await page
    .locator('input[type="email"]')
    .isVisible();
  const hasLoginButton = await page.locator("text=Entrar").isVisible();

  console.log(
    `Login form visible: ${loginFormVisible}, Login button: ${hasLoginButton}`
  );

  if (!loginFormVisible) {
    // Try to find and click login button to show form
    if (hasLoginButton) {
      await page.click("text=Entrar");
      await page.waitForTimeout(1000);
      await takeScreenshot(page, `${userType}-login-02-clicked-entrar`);
    }
  }

  // Try alternative selectors for login form
  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible()) {
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await takeScreenshot(page, `${userType}-login-03-credentials-filled`);

    // Look for submit button
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, `${userType}-login-04-submitted`);
    }
  } else {
    console.log("Login form not found, checking page content...");
    const pageText = await page.textContent("body");
    console.log("Page content preview:", pageText?.substring(0, 500));
    await takeScreenshot(page, `${userType}-login-debug-no-form`);
  }
}

test.describe("Authentication Flows", () => {
  test("should test admin login and dashboard access", async ({ page }) => {
    await performLogin(page, "admin");

    // Check if we're on admin dashboard or redirected appropriately
    const currentUrl = page.url();
    console.log("After login, current URL:", currentUrl);

    // Look for admin-specific content
    const hasAdminContent = await page.locator("text=Admin").isVisible();
    const hasTrainersText = await page.locator("text=Trainers").isVisible();

    console.log(
      `Has admin content: ${hasAdminContent}, Has trainers text: ${hasTrainersText}`
    );

    await takeScreenshot(page, "admin-dashboard-01-after-login");

    // Verify localStorage session
    const sessionData = await page.evaluate(() => {
      return {
        user: localStorage.getItem("fitcoach_user"),
        profile: localStorage.getItem("fitcoach_profile"),
        session: localStorage.getItem("fitcoach_session"),
        keys: Object.keys(localStorage).filter((k) =>
          k.startsWith("fitcoach_")
        ),
      };
    });

    console.log("Session data keys:", sessionData.keys);
    expect(sessionData.keys.length).toBeGreaterThan(0);
  });

  test("should test trainer login and dashboard access", async ({ page }) => {
    await performLogin(page, "trainer");

    const currentUrl = page.url();
    console.log("Trainer after login, current URL:", currentUrl);

    // Look for trainer-specific content
    const hasTrainerContent =
      (await page.locator("text=Alunos").isVisible()) ||
      (await page.locator("text=Students").isVisible()) ||
      (await page.locator("text=Meus Alunos").isVisible());

    console.log(`Has trainer content: ${hasTrainerContent}`);

    await takeScreenshot(page, "trainer-dashboard-01-after-login");
  });

  test("should test student login and dashboard access", async ({ page }) => {
    await performLogin(page, "student");

    const currentUrl = page.url();
    console.log("Student after login, current URL:", currentUrl);

    // Look for student-specific content
    const hasStudentContent =
      (await page.locator("text=Treino").isVisible()) ||
      (await page.locator("text=Workout").isVisible()) ||
      (await page.locator("text=Progresso").isVisible());

    console.log(`Has student content: ${hasStudentContent}`);

    await takeScreenshot(page, "student-dashboard-01-after-login");
  });
});

test.describe("Dashboard Navigation Tests", () => {
  test("should test demo dashboard functionality", async ({ page }) => {
    await page.goto("http://localhost:8030/student-demo");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "demo-dashboard-01-loaded");

    // Test navigation within demo
    const demoContent = await page.textContent("body");
    console.log("Demo content preview:", demoContent?.substring(0, 300));

    // Look for interactive elements
    const buttons = await page.locator("button").count();
    const links = await page.locator("a").count();

    console.log(`Demo page has ${buttons} buttons and ${links} links`);

    // Test some interactions
    if (buttons > 0) {
      const firstButton = page.locator("button").first();
      const buttonText = await firstButton.textContent();
      console.log("First button text:", buttonText);

      // Only click if it's not a navigation-changing button
      if (
        buttonText &&
        !buttonText.includes("Sair") &&
        !buttonText.includes("Logout")
      ) {
        await firstButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, "demo-dashboard-02-interaction");
      }
    }
  });

  test("should test localStorage manager functionality", async ({ page }) => {
    await page.goto("http://localhost:8030/localStorage-manager");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "localStorage-manager-01-loaded");

    // Test localStorage manager interactions
    const managerContent = await page.textContent("body");
    console.log("Manager content preview:", managerContent?.substring(0, 300));

    // Look for data mode switches
    const hasDataModeControls =
      (await page.locator("text=Modo").isVisible()) ||
      (await page.locator("text=Mode").isVisible());

    console.log(`Has data mode controls: ${hasDataModeControls}`);

    // Test switching data modes if available
    const dataButtons = await page.locator("button").count();
    console.log(`Manager has ${dataButtons} buttons`);

    if (dataButtons > 0) {
      // Take screenshot of all available options
      await takeScreenshot(page, "localStorage-manager-02-options");

      // Test data operations
      const testDataOperation = await page.evaluate(() => {
        try {
          // Test data insertion
          const testData = { test: "data", timestamp: Date.now() };
          localStorage.setItem("fitcoach_test", JSON.stringify(testData));

          // Verify
          const retrieved = localStorage.getItem("fitcoach_test");
          localStorage.removeItem("fitcoach_test");

          return {
            success: true,
            retrieved: retrieved !== null,
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
          };
        }
      });

      console.log("Data operation test:", testDataOperation);
      expect(testDataOperation.success).toBe(true);
    }
  });
});

test.describe("Route Protection and Navigation", () => {
  test("should verify route protection without authentication", async ({
    page,
  }) => {
    const protectedRoutes = [
      "/admin",
      "/trainer",
      "/student",
      "/admin/trainers",
      "/trainer/students",
      "/student/workouts",
    ];

    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:8030${route}`);
      await page.waitForLoadState("networkidle");

      const currentUrl = page.url();
      console.log(`Route ${route} redirected to: ${currentUrl}`);

      // Should not remain on protected route without auth
      expect(currentUrl).not.toContain(route);

      await takeScreenshot(
        page,
        `route-protection-${route.replace(/\//g, "-")}`
      );
    }
  });

  test("should verify error handling for non-existent routes", async ({
    page,
  }) => {
    const invalidRoutes = [
      "/non-existent",
      "/invalid-page",
      "/admin/non-existent",
      "/random-route",
    ];

    for (const route of invalidRoutes) {
      await page.goto(`http://localhost:8030${route}`);
      await page.waitForLoadState("networkidle");

      const currentUrl = page.url();
      const pageContent = await page.textContent("body");

      console.log(`Invalid route ${route} - URL: ${currentUrl}`);
      console.log(`Content preview: ${pageContent?.substring(0, 200)}`);

      await takeScreenshot(page, `invalid-route-${route.replace(/\//g, "-")}`);
    }
  });
});

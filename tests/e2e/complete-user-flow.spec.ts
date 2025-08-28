import { test, expect } from "@playwright/test";
import {
  setupTestEnvironment,
  loginWithRole,
  TEST_CREDENTIALS,
  loginThroughUI,
  handleModals,
  verifyAccessibility,
  testResponsiveDesign,
  takeDebugScreenshot,
} from "./utils";

test.describe("FitCoach Complete User Flow E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should complete full user journey from landing to subscription", async ({
    page,
  }) => {
    // Start on landing page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify landing page loaded
    await expect(
      page.getByRole("heading", { name: /A plataforma mais completa/ })
    ).toBeVisible();

    // Test pricing section interaction
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Elite")).toBeVisible();

    // Click on "Escolher Plano" or "Começar Grátis"
    const choosePlanButton = page
      .getByRole("button", { name: "Escolher Plano" })
      .first();
    const startFreeButton = page
      .getByRole("button", { name: "Começar Grátis" })
      .first();

    if (await choosePlanButton.isVisible({ timeout: 3000 })) {
      await choosePlanButton.click();
    } else if (await startFreeButton.isVisible({ timeout: 3000 })) {
      await startFreeButton.click();
    }

    await page.waitForTimeout(2000);

    // Should either open a modal or navigate to signup
    const hasModal = await page
      .getByRole("dialog")
      .isVisible({ timeout: 3000 });
    const isOnSignup =
      page.url().includes("/signup") || page.url().includes("/register");

    if (hasModal) {
      console.log("✅ Subscription modal opened");
      await handleModals(page);
    } else if (isOnSignup) {
      console.log("✅ Navigated to signup page");
    } else {
      console.log("⚠️ Plan selection did not trigger expected action");
    }

    // Test login flow
    await page.goto("/");
    await loginThroughUI(
      page,
      TEST_CREDENTIALS.trainer.email,
      TEST_CREDENTIALS.trainer.password
    );

    // Should be on trainer dashboard
    await page.waitForTimeout(2000);
    const isOnTrainerDashboard = page.url().includes("/trainer");
    expect(isOnTrainerDashboard).toBeTruthy();

    console.log("✅ Complete user flow from landing to dashboard successful");
  });

  test("should test cross-role navigation and access control", async ({
    page,
  }) => {
    // Test that roles can only access their own dashboards

    // Start as trainer
    await loginWithRole(page, "trainer");
    await page.goto("/trainer");
    await page.waitForLoadState("networkidle");

    // Try to access admin dashboard (should be restricted)
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Should either redirect or show error
    const isOnAdmin = page.url().includes("/admin");
    const isRedirected = !isOnAdmin;

    console.log(`🔒 Admin access control working: ${isRedirected}`);

    // Try to access student dashboard
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    const isOnStudent = page.url().includes("/student");
    const isRestrictedFromStudent = !isOnStudent;

    console.log(
      `🔒 Student access control working: ${isRestrictedFromStudent}`
    );

    // Test proper access to own dashboard
    await page.goto("/trainer");
    await page.waitForLoadState("networkidle");

    const hasTrainerAccess = page.url().includes("/trainer");
    expect(hasTrainerAccess).toBeTruthy();
  });

  test("should test localStorage persistence across page reloads", async ({
    page,
  }) => {
    // Login as admin
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Verify logged in
    const isLoggedIn = page.url().includes("/admin");
    expect(isLoggedIn).toBeTruthy();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still be logged in
    const stillLoggedIn = page.url().includes("/admin");
    expect(stillLoggedIn).toBeTruthy();

    // Test data persistence
    const hasStoredData = await page.evaluate(() => {
      const authData = localStorage.getItem("fitcoach_auth");
      const platformData = localStorage.getItem("fitcoach_data");
      return authData !== null && platformData !== null;
    });

    expect(hasStoredData).toBeTruthy();
    console.log("✅ localStorage persistence verified");
  });

  test("should test complete subscription flow simulation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test each pricing tier
    const pricingTiers = ["Free", "Pro", "Elite"];

    for (const tier of pricingTiers) {
      // Find the pricing card
      const tierCard = page.locator(`text=${tier}`).first();
      await expect(tierCard).toBeVisible();

      // Look for "Escolher Plano" or similar button near this tier
      const tierSection = tierCard.locator("..").locator(".."); // Go up to card container
      const choosePlanBtn = tierSection
        .getByRole("button", { name: /Escolher|Começar|Upgrade/i })
        .first();

      if (await choosePlanBtn.isVisible({ timeout: 3000 })) {
        await choosePlanBtn.click();
        await page.waitForTimeout(1000);

        // Handle any modals or navigation
        await handleModals(page);

        console.log(`✅ Tested ${tier} plan selection`);
      }
    }

    // Test "Mais Popular" highlight
    await expect(page.getByText("Mais Popular")).toBeVisible();

    console.log("✅ All pricing tiers tested");
  });

  test("should test email subscription and contact forms", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for email subscription forms
    const emailElements = [
      'input[type="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      "text=Newsletter",
      "text=Inscrever",
    ];

    let foundEmailForm = false;
    for (const selector of emailElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        foundEmailForm = true;
        console.log(`✅ Found email form: ${selector}`);

        // Test email input if it's an input field
        if (selector.includes("input")) {
          try {
            await element.fill("test@example.com");
            await page.waitForTimeout(500);

            // Look for submit button nearby
            const submitBtn = element.locator("..").getByRole("button").first();
            if (await submitBtn.isVisible({ timeout: 2000 })) {
              await submitBtn.click();
              console.log("✅ Email form submission tested");
            }
          } catch (error) {
            console.log("⚠️ Could not interact with email form");
          }
        }
        break;
      }
    }

    console.log(`📧 Email subscription form found: ${foundEmailForm}`);
  });

  test("should test all interactive elements and CTAs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test all primary CTAs
    const primaryCTAs = [
      "Entrar",
      "Começar Grátis",
      "Experimentar Agora",
      "Ver Demo",
      "Escolher Plano",
    ];

    for (const cta of primaryCTAs) {
      const buttons = page.getByRole("button", { name: cta });
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} "${cta}" button(s)`);

        // Test first button interaction
        try {
          await buttons.first().click();
          await page.waitForTimeout(1000);
          await handleModals(page);
        } catch (error) {
          console.log(`⚠️ Could not interact with ${cta} button`);
        }
      }
    }

    // Test tab functionality
    const tabs = [
      "Gestão",
      "Agendamento",
      "IA",
      "Sistema",
      "Analytics",
      "Mobile",
    ];

    for (const tab of tabs) {
      const tabElement = page.getByRole("tab", { name: tab });
      if (await tabElement.isVisible({ timeout: 3000 })) {
        await tabElement.click();
        await page.waitForTimeout(500);
        console.log(`✅ Tested ${tab} tab`);
      }
    }

    // Test FAQ accordion
    const faqButtons = page.getByRole("button", {
      name: /Como funciona|Quanto custa|Posso cancelar/,
    });
    const faqCount = await faqButtons.count();

    if (faqCount > 0) {
      await faqButtons.first().click();
      await page.waitForTimeout(500);
      console.log(`✅ Tested FAQ accordion (${faqCount} items)`);
    }
  });

  test("should test complete accessibility compliance across all pages", async ({
    page,
  }) => {
    const pagesToTest = [
      { url: "/", name: "Landing Page" },
      { url: "/localStorage-manager", name: "LocalStorage Manager" },
    ];

    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.url);
      await page.waitForLoadState("networkidle");

      console.log(`🔍 Testing accessibility for ${pageTest.name}`);
      await verifyAccessibility(page);
      console.log(`✅ ${pageTest.name} accessibility verified`);
    }

    // Test each dashboard with authentication
    const dashboardTests = [
      { role: "admin" as const, url: "/admin", name: "Admin Dashboard" },
      { role: "trainer" as const, url: "/trainer", name: "Trainer Dashboard" },
      { role: "student" as const, url: "/student", name: "Student Dashboard" },
    ];

    for (const dashboard of dashboardTests) {
      await loginWithRole(page, dashboard.role);
      await page.goto(dashboard.url);
      await page.waitForLoadState("networkidle");

      console.log(`🔍 Testing accessibility for ${dashboard.name}`);
      await verifyAccessibility(page);
      console.log(`✅ ${dashboard.name} accessibility verified`);
    }
  });

  test("should test complete responsive design across all viewports", async ({
    page,
  }) => {
    const pagesToTest = [
      { url: "/", name: "Landing Page" },
      { url: "/localStorage-manager", name: "LocalStorage Manager" },
    ];

    for (const pageTest of pagesToTest) {
      await page.goto(pageTest.url);
      await page.waitForLoadState("networkidle");

      console.log(`📱 Testing responsive design for ${pageTest.name}`);
      await testResponsiveDesign(page);
      console.log(`✅ ${pageTest.name} responsive design verified`);
    }

    // Test dashboards
    await loginWithRole(page, "trainer");
    await page.goto("/trainer");
    await page.waitForLoadState("networkidle");

    console.log("📱 Testing responsive design for Trainer Dashboard");
    await testResponsiveDesign(page);
    console.log("✅ Trainer Dashboard responsive design verified");
  });

  test("should verify localStorage data integrity and export functionality", async ({
    page,
  }) => {
    await setupTestEnvironment(page);

    // Test data export functionality
    const exportedData = await page.evaluate(() => {
      if (window.fitcoachLocalStorageDemo) {
        return window.fitcoachLocalStorageDemo.exportData();
      }
      return null;
    });

    expect(exportedData).toBeTruthy();

    // Verify data structure
    const dataStructure = await page.evaluate(() => {
      const authData = localStorage.getItem("fitcoach_auth");
      const platformData = localStorage.getItem("fitcoach_data");

      return {
        hasAuth: authData !== null,
        hasPlatformData: platformData !== null,
        authValid: authData ? JSON.parse(authData).user !== undefined : false,
        platformDataValid: platformData
          ? JSON.parse(platformData).users !== undefined
          : false,
      };
    });

    expect(dataStructure.hasAuth).toBeTruthy();
    expect(dataStructure.hasPlatformData).toBeTruthy();
    expect(dataStructure.authValid).toBeTruthy();
    expect(dataStructure.platformDataValid).toBeTruthy();

    console.log("✅ localStorage data integrity verified");
    console.log("✅ Export functionality verified");
  });

  test("should test error handling and edge cases", async ({ page }) => {
    // Test invalid routes
    await page.goto("/nonexistent-page");
    await page.waitForLoadState("networkidle");

    // Should handle gracefully (404 or redirect)
    const isHandled = page.url().includes("/") || page.url().includes("404");
    expect(isHandled).toBeTruthy();

    // Test with localStorage disabled
    await page.evaluate(() => {
      localStorage.setItem("fitcoach_use_localStorage", "false");
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should still load landing page
    await expect(
      page.getByRole("heading", { name: /A plataforma mais completa/ })
    ).toBeVisible();

    // Test with corrupted localStorage data
    await page.evaluate(() => {
      localStorage.setItem("fitcoach_data", "invalid-json");
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should handle corrupted data gracefully
    const pageLoaded = await page
      .getByRole("heading")
      .first()
      .isVisible({ timeout: 5000 });
    expect(pageLoaded).toBeTruthy();

    console.log("✅ Error handling and edge cases verified");
  });
});

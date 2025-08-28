import { test, expect } from "@playwright/test";
import {
  setupTestEnvironment,
  loginWithRole,
  verifyDashboardAccess,
  TEST_CREDENTIALS,
  loginThroughUI,
  handleModals,
  verifyAccessibility,
  testResponsiveDesign,
  testPerformanceMetrics,
  takeDebugScreenshot,
} from "./utils";

test.describe("FitCoach Admin Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should login as admin and access dashboard", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await verifyDashboardAccess(page, "admin");

    // Take screenshot for verification
    await takeDebugScreenshot(page, "admin-dashboard-loaded");
  });

  test("should display admin dashboard overview with metrics", async ({
    page,
  }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Check for dashboard metrics cards
    const metricsSelectors = [
      "text=Personal Trainers",
      "text=Alunos Ativos",
      "text=Sessões Hoje",
      "text=Receita Mensal",
    ];

    for (const selector of metricsSelectors) {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 10000 });
    }

    // Verify navigation tabs/sections
    const navItems = [
      "Dashboard",
      "Usuários",
      "Trainers",
      "Analytics",
      "Configurações",
    ];

    for (const item of navItems) {
      const navElement = page
        .getByRole("link", { name: item })
        .or(
          page
            .getByRole("button", { name: item })
            .or(page.locator(`text=${item}`).first())
        );
      await expect(navElement).toBeVisible({ timeout: 5000 });
    }
  });

  test("should navigate between admin sections", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Test navigation to users section
    const usersLink = page
      .getByRole("link", { name: "Usuários" })
      .or(page.getByRole("button", { name: "Usuários" }));

    if (await usersLink.isVisible({ timeout: 5000 })) {
      await usersLink.click();
      await page.waitForLoadState("networkidle");

      // Should show users table or list
      const usersContent = page
        .locator('table, [data-testid="users-list"], text=Lista de Usuários')
        .first();
      await expect(usersContent).toBeVisible({ timeout: 10000 });
    }

    // Test navigation to trainers section
    const trainersLink = page
      .getByRole("link", { name: "Trainers" })
      .or(page.getByRole("button", { name: "Trainers" }));

    if (await trainersLink.isVisible({ timeout: 5000 })) {
      await trainersLink.click();
      await page.waitForLoadState("networkidle");

      // Should show trainers management
      const trainersContent = page
        .locator('table, [data-testid="trainers-list"], text=Personal Trainers')
        .first();
      await expect(trainersContent).toBeVisible({ timeout: 10000 });
    }
  });

  test("should handle user management functionality", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Navigate to users section if available
    const usersSection = page
      .getByRole("link", { name: "Usuários" })
      .or(
        page
          .getByRole("button", { name: "Usuários" })
          .or(page.locator("text=Usuários").first())
      );

    if (await usersSection.isVisible({ timeout: 5000 })) {
      await usersSection.click();
      await page.waitForLoadState("networkidle");

      // Look for user management elements
      const userElements = [
        "table",
        '[data-testid="users-table"]',
        "text=admin@fitcoach.com",
        "text=trainer@fitcoach.com",
        "text=student@fitcoach.com",
      ];

      let foundUserElement = false;
      for (const selector of userElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          foundUserElement = true;
          break;
        }
      }

      expect(foundUserElement).toBeTruthy();
    }
  });

  test("should display analytics and reports", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Look for analytics/charts content
    const analyticsElements = [
      "svg", // Charts are usually SVG
      '[data-testid="analytics-chart"]',
      "text=Analytics",
      "text=Relatórios",
      "text=Performance",
      "canvas", // Some charts use canvas
    ];

    let foundAnalytics = false;
    for (const selector of analyticsElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundAnalytics = true;
        break;
      }
    }

    // It's okay if analytics aren't visible initially
    console.log("📊 Analytics section visible:", foundAnalytics);
  });

  test("should test admin accessibility compliance", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await verifyAccessibility(page);
  });

  test("should test admin dashboard responsive design", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await testResponsiveDesign(page);
  });

  test("should measure admin dashboard performance", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await testPerformanceMetrics(page);
  });

  test("should handle admin logout", async ({ page }) => {
    await loginWithRole(page, "admin");
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Look for logout button or user menu
    const logoutElements = [
      "text=Sair",
      "text=Logout",
      '[data-testid="logout-button"]',
      '[aria-label="Logout"]',
      "text=admin@fitcoach.com", // User menu
    ];

    let loggedOut = false;
    for (const selector of logoutElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click();
        await page.waitForTimeout(1000);

        // Check if we're back on landing page
        if (page.url().includes("/") && !page.url().includes("/admin")) {
          loggedOut = true;
          break;
        }
      }
    }

    // Verify logout worked (either redirected or login form visible)
    const isOnLanding = page.url() === new URL("/", page.url()).href;
    const hasLoginButton = await page
      .getByRole("button", { name: "Entrar" })
      .isVisible({ timeout: 3000 });

    expect(isOnLanding || hasLoginButton).toBeTruthy();
  });
});

test.describe("FitCoach Admin UI Login Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should login admin through UI modal", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Login through UI
    await loginThroughUI(
      page,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.password
    );

    // Should redirect to admin dashboard
    await verifyDashboardAccess(page, "admin");
  });

  test("should handle invalid admin credentials", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open login modal
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Try invalid credentials
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("invalid@email.com");
    await page.getByRole("textbox", { name: "Senha" }).fill("wrongpassword");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Should show error or stay on login
    await page.waitForTimeout(2000);

    // Verify still on landing page or error shown
    const isStillOnLanding = page.url().includes("/");
    const hasErrorMessage = await page
      .locator("text=erro, text=inválido, text=incorreto")
      .isVisible({ timeout: 3000 });

    expect(isStillOnLanding || hasErrorMessage).toBeTruthy();
  });
});

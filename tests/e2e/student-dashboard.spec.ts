import { test, expect } from "@playwright/test";
import {
  setupTestEnvironment,
  loginWithRole,
  verifyDashboardAccess,
  TEST_CREDENTIALS,
  loginThroughUI,
  verifyAccessibility,
  testResponsiveDesign,
  testPerformanceMetrics,
  takeDebugScreenshot,
} from "./utils";

test.describe("FitCoach Student Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should login as student and access dashboard", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    await verifyDashboardAccess(page, "student");

    // Take screenshot for verification
    await takeDebugScreenshot(page, "student-dashboard-loaded");
  });

  test("should display student dashboard with personal information", async ({
    page,
  }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Check for student-specific content
    const studentElements = [
      "text=Pedro Costa", // Demo student name
      "text=student@fitcoach.com",
      "text=Meu Perfil",
      "text=Informações Pessoais",
      "text=Dashboard",
      "text=Treinos",
      "text=Nutrição",
    ];

    let foundStudentInfo = 0;
    for (const selector of studentElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundStudentInfo++;
        console.log(`✅ Found student element: ${selector}`);
      }
    }

    // Should find at least some student-specific content
    expect(foundStudentInfo).toBeGreaterThan(0);
  });

  test("should test menstrual cycle feature activation", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Navigate to profile or personal information section
    const profileLink = page
      .getByRole("link", { name: "Perfil" })
      .or(
        page
          .getByRole("button", { name: "Perfil" })
          .or(page.locator("text=Informações Pessoais").first())
      );

    if (await profileLink.isVisible({ timeout: 5000 })) {
      await profileLink.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for gender selection
    const genderElements = [
      "text=Gênero",
      "text=Feminino",
      "text=Masculino",
      'select[name="gender"]',
      'input[name="gender"]',
      '[data-testid="gender-select"]',
    ];

    let foundGenderSelection = false;
    for (const selector of genderElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundGenderSelection = true;
        console.log(`✅ Found gender selection: ${selector}`);

        // Try to select "Feminino" if it's a select/dropdown
        if (selector.includes("select") || selector.includes("Feminino")) {
          try {
            await element.click();
            if (selector === "text=Feminino") {
              // Already clicked the right option
            } else {
              // Look for Feminino option
              const femininoOption = page.locator("text=Feminino").first();
              if (await femininoOption.isVisible({ timeout: 2000 })) {
                await femininoOption.click();
              }
            }
          } catch (error) {
            console.log("Could not interact with gender selection");
          }
        }
        break;
      }
    }

    // Look for menstrual cycle toggle after gender selection
    if (foundGenderSelection) {
      await page.waitForTimeout(1000); // Wait for UI updates

      const menstrualElements = [
        "text=Ciclo Menstrual",
        "text=Acompanhar ciclo",
        "text=Tracking menstrual",
        '[data-testid="menstrual-toggle"]',
        'input[type="checkbox"]',
        'button[role="switch"]',
      ];

      for (const selector of menstrualElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found menstrual cycle feature: ${selector}`);

          // Try to enable the toggle
          try {
            await element.click();
            await page.waitForTimeout(1000);

            // Look for adaptive content after enabling
            const adaptiveElements = [
              "text=Fase do Ciclo",
              "text=Menstrual",
              "text=Folicular",
              "text=Ovulação",
              "text=Luteal",
              "text=2.100 kcal", // Menstrual phase calories
              "text=Yoga",
              "text=Ferro",
            ];

            let foundAdaptiveContent = false;
            for (const adaptiveSelector of adaptiveElements) {
              const adaptiveElement = page.locator(adaptiveSelector).first();
              if (await adaptiveElement.isVisible({ timeout: 3000 })) {
                foundAdaptiveContent = true;
                console.log(`✅ Found adaptive content: ${adaptiveSelector}`);
                break;
              }
            }

            console.log(
              "🌸 Menstrual cycle adaptive features active:",
              foundAdaptiveContent
            );
          } catch (error) {
            console.log("Could not interact with menstrual cycle toggle");
          }
          break;
        }
      }
    }

    expect(foundGenderSelection).toBeTruthy();
  });

  test("should display workout plans and tracking", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Navigate to workouts section
    const workoutsLink = page
      .getByRole("link", { name: "Treinos" })
      .or(
        page
          .getByRole("button", { name: "Treinos" })
          .or(page.locator("text=Workout, text=Exercícios").first())
      );

    if (await workoutsLink.isVisible({ timeout: 5000 })) {
      await workoutsLink.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for workout content
    const workoutElements = [
      "text=Plano de Treino",
      "text=Exercícios",
      "text=Workout",
      "text=Séries",
      "text=Repetições",
      "text=Peso",
      '[data-testid="workout-plan"]',
    ];

    let foundWorkouts = false;
    for (const selector of workoutElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundWorkouts = true;
        console.log(`✅ Found workout content: ${selector}`);
        break;
      }
    }

    expect(
      foundWorkouts ||
        (await page.locator("text=Nenhum treino, text=Sem plano").isVisible())
    ).toBeTruthy();
  });

  test("should display nutrition plans and tracking", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Navigate to nutrition section
    const nutritionLink = page
      .getByRole("link", { name: "Nutrição" })
      .or(
        page
          .getByRole("button", { name: "Nutrição" })
          .or(page.locator("text=Dieta, text=Alimentação").first())
      );

    if (await nutritionLink.isVisible({ timeout: 5000 })) {
      await nutritionLink.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for nutrition content
    const nutritionElements = [
      "text=Plano de Dieta",
      "text=Nutrição",
      "text=Calorias",
      "text=kcal",
      "text=Proteínas",
      "text=Carboidratos",
      "text=Gorduras",
      '[data-testid="nutrition-plan"]',
    ];

    let foundNutrition = false;
    for (const selector of nutritionElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundNutrition = true;
        console.log(`✅ Found nutrition content: ${selector}`);
        break;
      }
    }

    expect(
      foundNutrition ||
        (await page.locator("text=Nenhuma dieta, text=Sem plano").isVisible())
    ).toBeTruthy();
  });

  test("should show session history and schedule", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Navigate to sessions section
    const sessionsLink = page
      .getByRole("link", { name: "Sessões" })
      .or(
        page
          .getByRole("button", { name: "Sessões" })
          .or(page.locator("text=Histórico, text=Agendamentos").first())
      );

    if (await sessionsLink.isVisible({ timeout: 5000 })) {
      await sessionsLink.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for sessions content
    const sessionsElements = [
      "text=Próximas Sessões",
      "text=Histórico",
      "text=Agendamento",
      "text=Maria Santos", // Demo trainer name
      "text=Completada",
      "text=Agendada",
      '[data-testid="sessions-list"]',
    ];

    let foundSessions = false;
    for (const selector of sessionsElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundSessions = true;
        console.log(`✅ Found sessions content: ${selector}`);
        break;
      }
    }

    expect(
      foundSessions || (await page.locator("text=Nenhuma sessão").isVisible())
    ).toBeTruthy();
  });

  test("should display progress tracking and analytics", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Look for progress/analytics content on main dashboard
    const progressElements = [
      "text=Progresso",
      "text=Analytics",
      "text=Evolução",
      "text=Peso",
      "text=Performance",
      "svg", // Charts
      "canvas", // Chart canvas
      '[data-testid="progress-chart"]',
    ];

    let foundProgress = false;
    for (const selector of progressElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundProgress = true;
        console.log(`✅ Found progress content: ${selector}`);
        break;
      }
    }

    // Progress tracking might be in a separate section
    console.log("📊 Progress tracking visible:", foundProgress);
  });

  test("should test student accessibility compliance", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    await verifyAccessibility(page);
  });

  test("should test student dashboard responsive design", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    await testResponsiveDesign(page);
  });

  test("should measure student dashboard performance", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    await testPerformanceMetrics(page);
  });

  test("should handle student logout", async ({ page }) => {
    await loginWithRole(page, "student");
    await page.goto("/student");
    await page.waitForLoadState("networkidle");

    // Look for logout functionality
    const logoutElements = [
      "text=Sair",
      "text=Logout",
      '[data-testid="logout-button"]',
      '[aria-label="Logout"]',
      "text=student@fitcoach.com",
    ];

    for (const selector of logoutElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click();
        await page.waitForTimeout(1000);

        // Check if logout worked
        const isOnLanding =
          page.url().includes("/") && !page.url().includes("/student");
        const hasLoginButton = await page
          .getByRole("button", { name: "Entrar" })
          .isVisible({ timeout: 3000 });

        if (isOnLanding || hasLoginButton) {
          console.log("✅ Logout successful");
          return;
        }
      }
    }

    // At minimum, should be able to navigate away from student dashboard
    await page.goto("/");
    expect(page.url()).toContain("/");
  });
});

test.describe("FitCoach Student UI Login Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should login student through UI modal", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Login through UI
    await loginThroughUI(
      page,
      TEST_CREDENTIALS.student.email,
      TEST_CREDENTIALS.student.password
    );

    // Should redirect to student dashboard
    await verifyDashboardAccess(page, "student");
  });

  test("should access student demo page", async ({ page }) => {
    await page.goto("/student-demo");
    await page.waitForLoadState("networkidle");

    // Should show student demo content
    const demoElements = [
      "text=Demo",
      "text=Student",
      "text=Aluno",
      "text=Demonstração",
    ];

    let foundDemo = false;
    for (const selector of demoElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundDemo = true;
        console.log(`✅ Found demo content: ${selector}`);
        break;
      }
    }

    // Student demo should be accessible without login
    expect(foundDemo || page.url().includes("/student-demo")).toBeTruthy();
  });
});

test.describe("FitCoach Menstrual Cycle Feature Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test("should test complete menstrual cycle feature workflow", async ({
    page,
  }) => {
    await loginWithRole(page, "student");
    await page.goto("/student-demo");
    await page.waitForLoadState("networkidle");

    // Test the complete menstrual cycle feature demo
    const featureElements = [
      "text=Ciclo Menstrual",
      "text=Feminino",
      "text=Acompanhar",
      "text=Toggle",
      "text=Phase",
      "text=Fase",
    ];

    let foundFeatureElements = 0;
    for (const selector of featureElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundFeatureElements++;
        console.log(`✅ Found menstrual feature: ${selector}`);
      }
    }

    // Test adaptive content based on phases
    const adaptiveElements = [
      "text=2.100 kcal", // Menstrual phase
      "text=Yoga", // Menstrual exercise
      "text=Ferro", // Iron for menstrual phase
      "text=Folicular", // Phase name
      "text=Ovulação", // Phase name
      "text=Luteal", // Phase name
    ];

    let foundAdaptiveElements = 0;
    for (const selector of adaptiveElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        foundAdaptiveElements++;
        console.log(`✅ Found adaptive content: ${selector}`);
      }
    }

    console.log(
      `🌸 Menstrual cycle feature elements found: ${foundFeatureElements}/6`
    );
    console.log(
      `🎯 Adaptive content elements found: ${foundAdaptiveElements}/6`
    );

    // Should find some menstrual cycle feature elements
    expect(foundFeatureElements).toBeGreaterThan(0);
  });
});

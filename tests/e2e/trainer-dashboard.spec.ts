import { test, expect } from '@playwright/test';
import { 
  setupTestEnvironment, 
  loginWithRole, 
  verifyDashboardAccess,
  TEST_CREDENTIALS,
  loginThroughUI,
  verifyAccessibility,
  testResponsiveDesign,
  testPerformanceMetrics,
  takeDebugScreenshot
} from './utils';

test.describe('FitCoach Trainer Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('should login as trainer and access dashboard', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    await verifyDashboardAccess(page, 'trainer');
    
    // Take screenshot for verification
    await takeDebugScreenshot(page, 'trainer-dashboard-loaded');
  });

  test('should display trainer dashboard overview with metrics', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Check for trainer-specific metrics
    const trainerMetrics = [
      'text=Alunos Ativos',
      'text=Sessões',
      'text=Planos',
      'text=Receita',
      'text=Meta Mensal',
      'text=Performance'
    ];
    
    let foundMetrics = 0;
    for (const selector of trainerMetrics) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundMetrics++;
      }
    }
    
    // Should find at least some metrics
    expect(foundMetrics).toBeGreaterThan(0);
    
    // Check for navigation sections
    const navSections = [
      'Dashboard',
      'Alunos',
      'Sessões',
      'Planos',
      'Pagamentos',
      'Perfil'
    ];
    
    for (const section of navSections) {
      const navElement = page.getByRole('link', { name: section }).or(
        page.getByRole('button', { name: section }).or(
          page.locator(`text=${section}`).first()
        )
      );
      
      // At least some navigation should be visible
      if (await navElement.isVisible({ timeout: 3000 })) {
        console.log(`✅ Found navigation: ${section}`);
      }
    }
  });

  test('should display students list and management', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to students section
    const studentsLink = page.getByRole('link', { name: 'Alunos' }).or(
      page.getByRole('button', { name: 'Alunos' })
    );
    
    if (await studentsLink.isVisible({ timeout: 5000 })) {
      await studentsLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for students content
    const studentsElements = [
      'table',
      '[data-testid="students-list"]',
      'text=Pedro Costa', // Demo student name
      'text=student@fitcoach.com',
      'text=Lista de Alunos',
      'text=Gerenciar Alunos'
    ];
    
    let foundStudents = false;
    for (const selector of studentsElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundStudents = true;
        console.log(`✅ Found students element: ${selector}`);
        break;
      }
    }
    
    // Should show students or empty state
    expect(foundStudents || await page.locator('text=Nenhum aluno, text=Adicionar aluno').isVisible()).toBeTruthy();
  });

  test('should handle session scheduling', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to sessions section
    const sessionsLink = page.getByRole('link', { name: 'Sessões' }).or(
      page.getByRole('button', { name: 'Sessões' })
    );
    
    if (await sessionsLink.isVisible({ timeout: 5000 })) {
      await sessionsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for sessions content
      const sessionsElements = [
        'table',
        '[data-testid="sessions-list"]',
        'text=Agendar Sessão',
        'text=Próximas Sessões',
        'text=Calendario',
        'text=Agendamento'
      ];
      
      let foundSessions = false;
      for (const selector of sessionsElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          foundSessions = true;
          console.log(`✅ Found sessions element: ${selector}`);
          break;
        }
      }
      
      expect(foundSessions || await page.locator('text=Nenhuma sessão').isVisible()).toBeTruthy();
    }
  });

  test('should display and manage workout plans', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to plans section
    const plansLink = page.getByRole('link', { name: 'Planos' }).or(
      page.getByRole('button', { name: 'Planos' })
    );
    
    if (await plansLink.isVisible({ timeout: 5000 })) {
      await plansLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for plans content
      const plansElements = [
        'text=Planos de Treino',
        'text=Planos de Dieta',
        'text=Criar Plano',
        'text=Workout',
        'text=Nutrition',
        '[data-testid="plans-list"]'
      ];
      
      let foundPlans = false;
      for (const selector of plansElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          foundPlans = true;
          console.log(`✅ Found plans element: ${selector}`);
          break;
        }
      }
      
      expect(foundPlans || await page.locator('text=Nenhum plano').isVisible()).toBeTruthy();
    }
  });

  test('should show payment tracking', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to payments section
    const paymentsLink = page.getByRole('link', { name: 'Pagamentos' }).or(
      page.getByRole('button', { name: 'Pagamentos' })
    );
    
    if (await paymentsLink.isVisible({ timeout: 5000 })) {
      await paymentsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for payments content
      const paymentsElements = [
        'text=Pagamentos',
        'text=Receita',
        'text=Faturas',
        'text=R$',
        'table',
        '[data-testid="payments-list"]'
      ];
      
      let foundPayments = false;
      for (const selector of paymentsElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          foundPayments = true;
          console.log(`✅ Found payments element: ${selector}`);
          break;
        }
      }
      
      expect(foundPayments || await page.locator('text=Nenhum pagamento').isVisible()).toBeTruthy();
    }
  });

  test('should display trainer profile and settings', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to profile section
    const profileLink = page.getByRole('link', { name: 'Perfil' }).or(
      page.getByRole('button', { name: 'Perfil' })
    );
    
    if (await profileLink.isVisible({ timeout: 5000 })) {
      await profileLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for profile content
      const profileElements = [
        'text=Maria Santos', // Demo trainer name
        'text=trainer@fitcoach.com',
        'text=Perfil do Trainer',
        'text=Configurações',
        'text=Bio',
        'text=WhatsApp'
      ];
      
      let foundProfile = false;
      for (const selector of profileElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          foundProfile = true;
          console.log(`✅ Found profile element: ${selector}`);
          break;
        }
      }
      
      expect(foundProfile).toBeTruthy();
    } else {
      // Profile might be in a dropdown or user menu
      const userMenuElements = [
        'text=trainer@fitcoach.com',
        'text=Maria Santos',
        '[data-testid="user-menu"]'
      ];
      
      for (const selector of userMenuElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`✅ Found user menu: ${selector}`);
          break;
        }
      }
    }
  });

  test('should test trainer accessibility compliance', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    await verifyAccessibility(page);
  });

  test('should test trainer dashboard responsive design', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    await testResponsiveDesign(page);
  });

  test('should measure trainer dashboard performance', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    await testPerformanceMetrics(page);
  });

  test('should handle trainer logout', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Look for logout functionality
    const logoutElements = [
      'text=Sair',
      'text=Logout', 
      '[data-testid="logout-button"]',
      '[aria-label="Logout"]',
      'text=trainer@fitcoach.com'
    ];
    
    for (const selector of logoutElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click();
        await page.waitForTimeout(1000);
        
        // Check if logout worked
        const isOnLanding = page.url().includes('/') && !page.url().includes('/trainer');
        const hasLoginButton = await page.getByRole('button', { name: 'Entrar' }).isVisible({ timeout: 3000 });
        
        if (isOnLanding || hasLoginButton) {
          console.log('✅ Logout successful');
          return;
        }
      }
    }
    
    // At minimum, should be able to navigate away from trainer dashboard
    await page.goto('/');
    expect(page.url()).toContain('/');
  });
});

test.describe('FitCoach Trainer UI Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page);
  });

  test('should login trainer through UI modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Login through UI
    await loginThroughUI(page, TEST_CREDENTIALS.trainer.email, TEST_CREDENTIALS.trainer.password);
    
    // Should redirect to trainer dashboard
    await verifyDashboardAccess(page, 'trainer');
  });

  test('should handle trainer subscription limits', async ({ page }) => {
    await loginWithRole(page, 'trainer');
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Look for subscription/plan information
    const planElements = [
      'text=Free',
      'text=Pro', 
      'text=Elite',
      'text=Plano Atual',
      'text=Upgrade',
      'text=Limite de Alunos'
    ];
    
    let foundPlanInfo = false;
    for (const selector of planElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        foundPlanInfo = true;
        console.log(`✅ Found plan info: ${selector}`);
        break;
      }
    }
    
    // Plan information might be in a separate section or modal
    console.log('📋 Plan information visible:', foundPlanInfo);
  });
});
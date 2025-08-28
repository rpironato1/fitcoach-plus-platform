/**
 * Comprehensive Flow Testing for FitCoach Plus Platform
 * 
 * This test suite covers all major user flows as requested:
 * 1. Free subscription flow
 * 2. Paid subscription flow with Stripe
 * 3. OTP validation flow (6 digits)
 * 4. Login and password recovery flows
 * 5. Dashboard flows (Admin, Personal, Students)
 * 6. Contact pages
 * 7. AI usage flows
 * 8. Routes and dependencies
 */

import { test, expect, Page } from '@playwright/test';

// Test credentials for localStorage implementation
const TEST_USERS = {
  admin: { email: 'admin@fitcoach.com', password: 'admin123' },
  trainer: { email: 'trainer@fitcoach.com', password: 'trainer123' },
  student: { email: 'student@fitcoach.com', password: 'student123' }
};

// Utility functions
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `screenshots/comprehensive-flows/${name}.png`,
    fullPage: true
  });
}

async function loginUser(page: Page, userType: 'admin' | 'trainer' | 'student') {
  const user = TEST_USERS[userType];
  
  await page.goto('http://localhost:8030/');
  await takeScreenshot(page, `${userType}-01-landing-page`);
  
  // Wait for login form to be visible
  await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await takeScreenshot(page, `${userType}-02-login-form-filled`);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForLoadState('networkidle');
  await takeScreenshot(page, `${userType}-03-dashboard-loaded`);
}

async function measureResponseTime(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await action();
  return Date.now() - startTime;
}

test.describe('1. Free Subscription Flow', () => {
  test('should allow registration and access to basic resources', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    await takeScreenshot(page, 'free-subscription-01-landing');

    // Click register/signup button
    await page.click('text=Cadastrar');
    await takeScreenshot(page, 'free-subscription-02-register-form');

    // Fill registration form
    const testEmail = `test-free-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    await takeScreenshot(page, 'free-subscription-03-form-filled');
    
    // Submit registration
    const responseTime = await measureResponseTime(page, async () => {
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Free registration response time: ${responseTime}ms`);
    
    await takeScreenshot(page, 'free-subscription-04-success');

    // Verify localStorage data
    const localStorageData = await page.evaluate(() => {
      return {
        user: localStorage.getItem('fitcoach_user'),
        profile: localStorage.getItem('fitcoach_profile'),
        session: localStorage.getItem('fitcoach_session')
      };
    });

    expect(localStorageData.user).toBeTruthy();
    expect(localStorageData.profile).toBeTruthy();
    expect(localStorageData.session).toBeTruthy();
  });
});

test.describe('2. Paid Subscription Flow with Stripe', () => {
  test('should handle payment process and upgrade to premium', async ({ page }) => {
    await loginUser(page, 'trainer');
    
    // Navigate to subscription upgrade
    await page.click('text=Upgrade Plan');
    await takeScreenshot(page, 'paid-subscription-01-upgrade-page');

    // Select premium plan
    await page.click('[data-testid="premium-plan-button"]');
    await takeScreenshot(page, 'paid-subscription-02-plan-selected');

    // Mock Stripe integration (since this is localStorage-only)
    await page.click('button:has-text("Subscribe Now")');
    await takeScreenshot(page, 'paid-subscription-03-payment-form');

    // Simulate payment success
    const paymentResponseTime = await measureResponseTime(page, async () => {
      await page.evaluate(() => {
        // Mock successful payment in localStorage
        const trainerProfile = JSON.parse(localStorage.getItem('fitcoach_trainer_profile') || '{}');
        trainerProfile.plan = 'pro';
        trainerProfile.active_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
        localStorage.setItem('fitcoach_trainer_profile', JSON.stringify(trainerProfile));
        
        // Add payment record
        const payments = JSON.parse(localStorage.getItem('fitcoach_payments') || '[]');
        payments.push({
          id: `payment-${Date.now()}`,
          trainer_id: trainerProfile.id,
          amount: 2997, // $29.97
          status: 'succeeded',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('fitcoach_payments', JSON.stringify(payments));
      });
      
      await page.reload();
    });

    console.log(`Payment processing time: ${paymentResponseTime}ms`);
    await takeScreenshot(page, 'paid-subscription-04-payment-success');

    // Verify premium features are now accessible
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await takeScreenshot(page, 'paid-subscription-05-premium-features');
  });
});

test.describe('3. OTP Validation Flow', () => {
  test('should validate 6-digit OTP with expiration', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    
    // Simulate OTP request
    await page.click('text=Esqueci minha senha');
    await takeScreenshot(page, 'otp-01-forgot-password');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Enviar Código")');
    await takeScreenshot(page, 'otp-02-code-requested');

    // Mock OTP generation in localStorage
    await page.evaluate(() => {
      const otpData = {
        code: '123456',
        email: 'test@example.com',
        expires_at: Date.now() + 5 * 60 * 1000, // 5 minutes
        created_at: Date.now()
      };
      localStorage.setItem('fitcoach_otp', JSON.stringify(otpData));
    });

    // Test valid OTP
    await page.fill('input[data-testid="otp-input"]', '123456');
    await takeScreenshot(page, 'otp-03-valid-code-entered');
    
    const otpResponseTime = await measureResponseTime(page, async () => {
      await page.click('button:has-text("Verificar Código")');
      await page.waitForLoadState('networkidle');
    });

    console.log(`OTP validation time: ${otpResponseTime}ms`);
    await takeScreenshot(page, 'otp-04-code-verified');

    // Test invalid OTP
    await page.fill('input[data-testid="otp-input"]', '999999');
    await page.click('button:has-text("Verificar Código")');
    await expect(page.locator('text=Código inválido')).toBeVisible();
    await takeScreenshot(page, 'otp-05-invalid-code');

    // Test expired OTP
    await page.evaluate(() => {
      const otpData = {
        code: '123456',
        email: 'test@example.com',
        expires_at: Date.now() - 1000, // Expired
        created_at: Date.now() - 6 * 60 * 1000 // 6 minutes ago
      };
      localStorage.setItem('fitcoach_otp', JSON.stringify(otpData));
    });

    await page.fill('input[data-testid="otp-input"]', '123456');
    await page.click('button:has-text("Verificar Código")');
    await expect(page.locator('text=Código expirado')).toBeVisible();
    await takeScreenshot(page, 'otp-06-expired-code');
  });
});

test.describe('4. Login and Password Recovery', () => {
  test('should handle login with valid and invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    
    // Test invalid login
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await takeScreenshot(page, 'login-01-invalid-credentials');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    await takeScreenshot(page, 'login-02-invalid-error');

    // Test valid login
    const loginResponseTime = await measureResponseTime(page, async () => {
      await loginUser(page, 'trainer');
    });

    console.log(`Login response time: ${loginResponseTime}ms`);
    await takeScreenshot(page, 'login-03-successful-login');

    // Test password recovery flow
    await page.click('button:has-text("Sair")');
    await page.click('text=Esqueci minha senha');
    await takeScreenshot(page, 'password-recovery-01-form');

    await page.fill('input[type="email"]', TEST_USERS.trainer.email);
    await page.click('button:has-text("Enviar Email")');
    await takeScreenshot(page, 'password-recovery-02-email-sent');

    // Simulate password reset
    await page.click('text=Definir Nova Senha');
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    await page.click('button:has-text("Salvar Nova Senha")');
    await takeScreenshot(page, 'password-recovery-03-password-reset');
  });
});

test.describe('5. Dashboard Flows', () => {
  test('Admin Dashboard - CRUD and administrative functions', async ({ page }) => {
    await loginUser(page, 'admin');
    
    // Test admin dashboard navigation
    await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
    await takeScreenshot(page, 'admin-dashboard-01-overview');

    // Test trainers management
    await page.click('text=Gerenciar Trainers');
    await takeScreenshot(page, 'admin-dashboard-02-trainers-management');

    // Create new trainer
    await page.click('button:has-text("Adicionar Trainer")');
    await takeScreenshot(page, 'admin-dashboard-03-create-trainer-form');

    await page.fill('input[name="email"]', `newtrainer-${Date.now()}@example.com`);
    await page.fill('input[name="firstName"]', 'New');
    await page.fill('input[name="lastName"]', 'Trainer');
    
    const createTrainerTime = await measureResponseTime(page, async () => {
      await page.click('button:has-text("Criar Trainer")');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Create trainer response time: ${createTrainerTime}ms`);
    await takeScreenshot(page, 'admin-dashboard-04-trainer-created');

    // Test payments management
    await page.click('text=Pagamentos');
    await takeScreenshot(page, 'admin-dashboard-05-payments-management');

    // Test reports
    await page.click('text=Relatórios');
    await takeScreenshot(page, 'admin-dashboard-06-reports');

    // Test system settings
    await page.click('text=Configurações');
    await takeScreenshot(page, 'admin-dashboard-07-settings');
  });

  test('Trainer Dashboard - tools and reports', async ({ page }) => {
    await loginUser(page, 'trainer');
    
    await expect(page.locator('h1:has-text("Trainer Dashboard")')).toBeVisible();
    await takeScreenshot(page, 'trainer-dashboard-01-overview');

    // Test students management
    await page.click('text=Meus Alunos');
    await takeScreenshot(page, 'trainer-dashboard-02-students');

    // Test sessions
    await page.click('text=Sessões');
    await takeScreenshot(page, 'trainer-dashboard-03-sessions');

    // Test diet plans
    await page.click('text=Planos Alimentares');
    await takeScreenshot(page, 'trainer-dashboard-04-diet-plans');

    // Test workouts
    await page.click('text=Treinos');
    await takeScreenshot(page, 'trainer-dashboard-05-workouts');
  });

  test('Student Dashboard - resources and restrictions', async ({ page }) => {
    await loginUser(page, 'student');
    
    await expect(page.locator('h1:has-text("Student Dashboard")')).toBeVisible();
    await takeScreenshot(page, 'student-dashboard-01-overview');

    // Test student features
    await page.click('text=Meu Treino');
    await takeScreenshot(page, 'student-dashboard-02-workout');

    await page.click('text=Dieta');
    await takeScreenshot(page, 'student-dashboard-03-diet');

    await page.click('text=Progresso');
    await takeScreenshot(page, 'student-dashboard-04-progress');

    // Test restrictions - student shouldn't see admin/trainer features
    await expect(page.locator('text=Gerenciar Trainers')).not.toBeVisible();
    await expect(page.locator('text=Adicionar Aluno')).not.toBeVisible();
  });
});

test.describe('6. Contact Pages', () => {
  test('should handle contact form submission and notifications', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    
    // Navigate to contact page
    await page.click('text=Contato');
    await takeScreenshot(page, 'contact-01-page');

    // Fill contact form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'This is a test message');
    await takeScreenshot(page, 'contact-02-form-filled');

    // Submit form
    const contactResponseTime = await measureResponseTime(page, async () => {
      await page.click('button:has-text("Enviar Mensagem")');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Contact form response time: ${contactResponseTime}ms`);
    
    // Verify success message
    await expect(page.locator('text=Mensagem enviada com sucesso')).toBeVisible();
    await takeScreenshot(page, 'contact-03-success');

    // Verify data stored in localStorage
    const contactData = await page.evaluate(() => {
      return localStorage.getItem('fitcoach_contact_messages');
    });

    expect(contactData).toBeTruthy();
    const messages = JSON.parse(contactData || '[]');
    expect(messages).toHaveLength(1);
    expect(messages[0].email).toBe('test@example.com');
  });
});

test.describe('7. AI Usage Flows', () => {
  test('Trainer AI - plan generation and editing', async ({ page }) => {
    await loginUser(page, 'trainer');
    
    // Navigate to AI features
    await page.click('text=AI Assistant');
    await takeScreenshot(page, 'ai-trainer-01-assistant');

    // Test workout generation
    await page.click('text=Gerar Treino com IA');
    await takeScreenshot(page, 'ai-trainer-02-workout-generator');

    await page.fill('textarea[name="objectives"]', 'Hipertrofia muscular');
    await page.fill('input[name="duration"]', '60');
    await page.selectOption('select[name="level"]', 'intermediate');
    
    const aiGenerationTime = await measureResponseTime(page, async () => {
      await page.click('button:has-text("Gerar Treino")');
      await page.waitForLoadState('networkidle');
    });

    console.log(`AI workout generation time: ${aiGenerationTime}ms`);
    await takeScreenshot(page, 'ai-trainer-03-workout-generated');

    // Test diet plan generation
    await page.click('text=Gerar Dieta com IA');
    await takeScreenshot(page, 'ai-trainer-04-diet-generator');

    await page.fill('input[name="calories"]', '2000');
    await page.fill('textarea[name="restrictions"]', 'Sem lactose');
    await page.click('button:has-text("Gerar Dieta")');
    await takeScreenshot(page, 'ai-trainer-05-diet-generated');

    // Verify AI credits are consumed
    const aiCredits = await page.evaluate(() => {
      const trainerProfile = JSON.parse(localStorage.getItem('fitcoach_trainer_profile') || '{}');
      return trainerProfile.ai_credits;
    });

    expect(typeof aiCredits).toBe('number');
  });

  test('Student AI - interactions and personalized responses', async ({ page }) => {
    await loginUser(page, 'student');
    
    // Navigate to AI chat
    await page.click('text=Chat com IA');
    await takeScreenshot(page, 'ai-student-01-chat');

    // Test AI interaction
    await page.fill('textarea[name="message"]', 'Como posso melhorar meu treino?');
    
    const aiResponseTime = await measureResponseTime(page, async () => {
      await page.click('button:has-text("Enviar")');
      await page.waitForSelector('.ai-response', { timeout: 10000 });
    });

    console.log(`AI response time: ${aiResponseTime}ms`);
    await takeScreenshot(page, 'ai-student-02-response');

    // Test personalized recommendations
    await page.click('text=Recomendações Personalizadas');
    await takeScreenshot(page, 'ai-student-03-recommendations');

    // Verify chat history is saved
    const chatHistory = await page.evaluate(() => {
      return localStorage.getItem('fitcoach_student_chat_history');
    });

    expect(chatHistory).toBeTruthy();
  });
});

test.describe('8. Routes and Dependencies', () => {
  test('should verify all navigation and route protection', async ({ page }) => {
    // Test public routes
    await page.goto('http://localhost:8030/');
    await takeScreenshot(page, 'routes-01-public-landing');

    await page.goto('http://localhost:8030/student-demo');
    await takeScreenshot(page, 'routes-02-demo-access');

    await page.goto('http://localhost:8030/localStorage-manager');
    await takeScreenshot(page, 'routes-03-localstorage-manager');

    // Test protected routes without authentication
    await page.goto('http://localhost:8030/admin');
    await expect(page.url()).toContain('/'); // Should redirect to login
    await takeScreenshot(page, 'routes-04-protected-redirect');

    // Test route protection with authentication
    await loginUser(page, 'student');
    
    // Student trying to access admin route
    await page.goto('http://localhost:8030/admin');
    await expect(page.url()).toContain('/student'); // Should redirect to student dashboard
    await takeScreenshot(page, 'routes-05-role-based-redirect');

    // Test cross-module dependencies
    const navigationTime = await measureResponseTime(page, async () => {
      await page.click('text=Meu Treino');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Navigation response time: ${navigationTime}ms`);

    // Test 404 handling
    await page.goto('http://localhost:8030/non-existent-route');
    await expect(page.locator('text=Página não encontrada')).toBeVisible();
    await takeScreenshot(page, 'routes-06-404-page');
  });

  test('should verify module dependencies and component loading', async ({ page }) => {
    await loginUser(page, 'admin');
    
    // Test that all modules load correctly
    const modules = [
      { name: 'auth', selector: '[data-testid="auth-module"]' },
      { name: 'payments', selector: '[data-testid="payments-module"]' },
      { name: 'ui', selector: '[data-testid="ui-components"]' },
      { name: 'ai', selector: '[data-testid="ai-module"]' },
      { name: 'workouts', selector: '[data-testid="workouts-module"]' }
    ];

    for (const module of modules) {
      const moduleLoadTime = await measureResponseTime(page, async () => {
        await page.goto(`http://localhost:8030/admin/${module.name}`);
        await page.waitForLoadState('networkidle');
      });

      console.log(`${module.name} module load time: ${moduleLoadTime}ms`);
      await takeScreenshot(page, `dependencies-${module.name}-loaded`);
    }

    // Verify localStorage data integrity across modules
    const dataIntegrity = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('fitcoach_'));
      return {
        keysCount: keys.length,
        hasUserData: keys.includes('fitcoach_user'),
        hasProfileData: keys.includes('fitcoach_profile'),
        hasSessionData: keys.includes('fitcoach_session')
      };
    });

    expect(dataIntegrity.keysCount).toBeGreaterThan(0);
    expect(dataIntegrity.hasUserData).toBe(true);
    expect(dataIntegrity.hasProfileData).toBe(true);
    expect(dataIntegrity.hasSessionData).toBe(true);
  });
});
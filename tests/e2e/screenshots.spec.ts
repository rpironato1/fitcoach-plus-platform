import { test, expect } from '@playwright/test';

// Comprehensive page mapping for all modules
const pageRoutes = [
  // Landing and public pages
  { name: 'landing-page', path: '/', requiresAuth: false },
  { name: 'student-demo', path: '/student-demo', requiresAuth: false },
  { name: 'localstorage-manager', path: '/localStorage-manager', requiresAuth: false },
  
  // Admin dashboard pages
  { name: 'admin-dashboard', path: '/admin', requiresAuth: true, role: 'admin' },
  { name: 'admin-trainers', path: '/admin/trainers', requiresAuth: true, role: 'admin' },
  { name: 'admin-payments', path: '/admin/payments', requiresAuth: true, role: 'admin' },
  { name: 'admin-reports', path: '/admin/reports', requiresAuth: true, role: 'admin' },
  { name: 'admin-settings', path: '/admin/settings', requiresAuth: true, role: 'admin' },
  { name: 'admin-localstorage', path: '/admin/localStorage', requiresAuth: true, role: 'admin' },
  
  // Trainer dashboard pages
  { name: 'trainer-dashboard', path: '/trainer', requiresAuth: true, role: 'trainer' },
  { name: 'trainer-students', path: '/trainer/students', requiresAuth: true, role: 'trainer' },
  { name: 'trainer-sessions', path: '/trainer/sessions', requiresAuth: true, role: 'trainer' },
  { name: 'trainer-diet-plans', path: '/trainer/diet-plans', requiresAuth: true, role: 'trainer' },
  { name: 'trainer-workouts', path: '/trainer/workouts', requiresAuth: true, role: 'trainer' },
  
  // Student dashboard pages  
  { name: 'student-dashboard', path: '/student', requiresAuth: true, role: 'student' },
];

// Viewport configurations
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

// Test credentials
const credentials = {
  admin: { email: 'admin@fitcoach.com', password: 'admin123' },
  trainer: { email: 'trainer@fitcoach.com', password: 'trainer123' },
  student: { email: 'student@fitcoach.com', password: 'student123' },
};

async function loginAs(page, role) {
  const creds = credentials[role];
  
  // Navigate to landing page first
  await page.goto('http://localhost:8030/');
  await page.waitForLoadState('networkidle');
  
  // Click login button if exists
  try {
    const loginButton = page.locator('button:has-text("Entrar")').first();
    if (await loginButton.isVisible({ timeout: 5000 })) {
      await loginButton.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Login button not found, trying direct form');
  }
  
  // Fill login form
  try {
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Wait for redirect to dashboard
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log(`❌ Failed to login as ${role}:`, e.message);
  }
}

// Generate tests for each page and viewport combination
// Only run screenshot tests in chromium to avoid duplication
for (const viewport of viewports) {
  for (const route of pageRoutes) {
    test(`Screenshot: ${route.name} - ${viewport.name}`, { 
      tag: '@screenshot' 
    }, async ({ page, browserName }) => {
      // Skip screenshots for non-chromium browsers in CI
      if (process.env.CI && browserName !== 'chromium') {
        test.skip();
      }
      
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Handle authentication if required
      if (route.requiresAuth && route.role) {
        await loginAs(page, route.role);
      }
      
      // Navigate to the route
      await page.goto(`http://localhost:8030${route.path}`, { 
        timeout: 15000,
        waitUntil: 'networkidle' 
      });
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotPath = `screenshots/${viewport.name}/${route.name}-${viewport.name}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        animations: 'disabled',
        timeout: 10000
      });
      
      console.log(`✅ Captured: ${route.name}-${viewport.name}.png`);
    });
  }
}
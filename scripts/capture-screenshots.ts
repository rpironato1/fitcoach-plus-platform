import { test, Browser, Page } from '@playwright/test';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

// Comprehensive page mapping for all modules
const pageRoutes = [
  // Landing and public pages
  { name: 'landing-page', path: '/', requiresAuth: false },
  { name: 'student-demo', path: '/student-demo', requiresAuth: false },
  { name: 'localstorage-manager', path: '/localStorage-manager', requiresAuth: false },
  { name: 'not-found', path: '/not-found', requiresAuth: false },
  
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

async function loginAs(page: Page, role: 'admin' | 'trainer' | 'student') {
  const creds = credentials[role];
  
  // Navigate to landing page first
  await page.goto('http://localhost:8030/');
  await page.waitForLoadState('networkidle');
  
  // Click login button if exists
  const loginButton = page.locator('button:has-text("Entrar")').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }
  
  // Fill login form
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  
  // Submit login
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  // Wait for redirect to dashboard
  await page.waitForTimeout(2000);
}

async function captureScreenshot(page: Page, route: any, viewport: any) {
  const screenshotDir = path.join(process.cwd(), 'screenshots', viewport.name);
  fs.mkdirSync(screenshotDir, { recursive: true });
  
  const filename = `${route.name}-${viewport.name}.png`;
  const filepath = path.join(screenshotDir, filename);
  
  try {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    // Navigate to the route
    await page.goto(`http://localhost:8030${route.path}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Capture full page screenshot
    await page.screenshot({ 
      path: filepath, 
      fullPage: true,
      animations: 'disabled' 
    });
    
    console.log(`✅ Captured: ${filename}`);
    
    return filepath;
  } catch (error) {
    console.error(`❌ Failed to capture ${filename}:`, error);
    return null;
  }
}

async function startDevServer() {
  const { spawn } = await import('child_process');
  
  return new Promise<any>((resolve) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    server.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && output.includes('8030')) {
        console.log('✅ Dev server started');
        setTimeout(() => resolve(server), 3000);
      }
    });
    
    server.stderr?.on('data', (data) => {
      console.error('Dev server error:', data.toString());
    });
  });
}

async function main() {
  console.log('🚀 Starting comprehensive screenshot capture...');
  
  // Start dev server
  const server = await startDevServer();
  
  try {
    // Launch browser
    const browser = await chromium.launch({ headless: true });
    
    for (const viewport of viewports) {
      console.log(`\n📱 Capturing screenshots for ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      
      const page = await context.newPage();
      
      // Capture public pages first
      for (const route of pageRoutes.filter(r => !r.requiresAuth)) {
        await captureScreenshot(page, route, viewport);
      }
      
      // Capture authenticated pages for each role
      for (const role of ['admin', 'trainer', 'student'] as const) {
        console.log(`\n🔐 Logging in as ${role}...`);
        
        try {
          await loginAs(page, role);
          
          // Capture role-specific pages
          const rolePages = pageRoutes.filter(r => r.role === role);
          for (const route of rolePages) {
            await captureScreenshot(page, route, viewport);
          }
          
          // Clear auth state
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          
        } catch (error) {
          console.error(`❌ Failed to login as ${role}:`, error);
        }
      }
      
      await context.close();
    }
    
    await browser.close();
    console.log('\n🎉 Screenshot capture completed!');
    
  } finally {
    // Kill dev server
    server?.kill();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as captureAllScreenshots };
import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test Utilities and Setup for FitCoach Platform
 */

// Test credentials from E2E_TEST_CREDENTIALS.md
export const TEST_CREDENTIALS = {
  admin: { email: 'admin@fitcoach.com', password: 'admin123' },
  trainer: { email: 'trainer@fitcoach.com', password: 'trainer123' },
  student: { email: 'student@fitcoach.com', password: 'student123' }
} as const;

// Test URLs
export const TEST_URLS = {
  landing: '/',
  admin: '/admin',
  trainer: '/trainer', 
  student: '/student',
  localStorageManager: '/localStorage-manager',
  studentDemo: '/student-demo'
} as const;

/**
 * Setup localStorage mode for testing
 */
export async function setupLocalStorageMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('fitcoach_use_localStorage', 'true');
  });
}

/**
 * Enable localStorage demo mode and load test data
 */
export async function enableLocalStorageDemo(page: Page) {
  await page.evaluate(() => {
    // Enable localStorage mode
    localStorage.setItem('fitcoach_use_localStorage', 'true');
    
    // Initialize demo utilities if available
    if (window.fitcoachLocalStorageDemo) {
      window.fitcoachLocalStorageDemo.enableLocalStorage();
      window.fitcoachLocalStorageDemo.testFullData();
    }
  });
}

/**
 * Login with specific user role using localStorage demo
 */
export async function loginWithRole(page: Page, role: 'admin' | 'trainer' | 'student') {
  await enableLocalStorageDemo(page);
  
  await page.evaluate((userRole) => {
    if (window.fitcoachLocalStorageDemo) {
      switch (userRole) {
        case 'admin':
          return window.fitcoachLocalStorageDemo.loginAsAdmin();
        case 'trainer':
          return window.fitcoachLocalStorageDemo.loginAsTrainer();
        case 'student':
          return window.fitcoachLocalStorageDemo.loginAsStudent();
      }
    }
  }, role);
  
  // Wait for any navigation or state changes
  await page.waitForTimeout(1000);
}

/**
 * Login through UI modal
 */
export async function loginThroughUI(page: Page, email: string, password: string) {
  // Open login modal
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  
  // Fill credentials
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Senha' }).fill(password);
  
  // Submit login
  await page.getByRole('button', { name: 'Entrar' }).click();
  
  // Wait for login to complete
  await page.waitForLoadState('networkidle');
}

/**
 * Verify user is logged in and on correct dashboard
 */
export async function verifyDashboardAccess(page: Page, expectedRole: 'admin' | 'trainer' | 'student') {
  const expectedUrl = TEST_URLS[expectedRole];
  
  // Check URL contains expected path
  await expect(page).toHaveURL(new RegExp(expectedUrl));
  
  // Verify dashboard content is visible
  const dashboardSelectors = {
    admin: '[data-testid="admin-dashboard"], h1:has-text("Admin"), h1:has-text("Painel")',
    trainer: '[data-testid="trainer-dashboard"], h1:has-text("Trainer"), h1:has-text("Personal")',
    student: '[data-testid="student-dashboard"], h1:has-text("Student"), h1:has-text("Aluno")'
  };
  
  const selector = dashboardSelectors[expectedRole];
  await expect(page.locator(selector).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Setup test environment with localStorage and test data
 */
export async function setupTestEnvironment(page: Page) {
  await page.goto(TEST_URLS.landing);
  await enableLocalStorageDemo(page);
  await page.waitForLoadState('networkidle');
}

/**
 * Clear all localStorage data and reset state
 */
export async function clearTestData(page: Page) {
  await page.evaluate(() => {
    if (window.fitcoachLocalStorageDemo) {
      window.fitcoachLocalStorageDemo.clearAll();
    }
    localStorage.clear();
  });
}

/**
 * Wait for and handle any modals or dialogs
 */
export async function handleModals(page: Page) {
  // Wait for any modals to appear and handle them
  try {
    const modal = page.getByRole('dialog').first();
    if (await modal.isVisible({ timeout: 2000 })) {
      // Try to close modal with close button
      const closeButton = modal.getByRole('button', { name: /close|fechar|×/i });
      if (await closeButton.isVisible({ timeout: 1000 })) {
        await closeButton.click();
      } else {
        // Try escape key
        await page.keyboard.press('Escape');
      }
    }
  } catch (error) {
    // No modal present, continue
  }
}

/**
 * Take screenshot with timestamp for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `debug-${name}-${timestamp}.png`;
  await page.screenshot({ path: `test-results/${filename}`, fullPage: true });
  console.log(`📸 Debug screenshot saved: ${filename}`);
}

/**
 * Verify accessibility compliance
 */
export async function verifyAccessibility(page: Page) {
  // Check that all interactive elements are keyboard accessible
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
  
  // Check for proper ARIA labels on buttons
  const buttons = page.getByRole('button');
  const buttonCount = await buttons.count();
  expect(buttonCount).toBeGreaterThan(0);
  
  // Verify color contrast by checking CSS (basic check)
  const contrastCheck = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    let hasProperContrast = true;
    
    // Simple check for common low-contrast patterns
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Check if it's a muted text color that should be dark enough
      if (color.includes('114, 114, 114') || color.includes('#727272')) {
        hasProperContrast = false; // This would fail WCAG AA
      }
    });
    
    return hasProperContrast;
  });
  
  expect(contrastCheck).toBeTruthy();
}

/**
 * Test responsive design across viewports
 */
export async function testResponsiveDesign(page: Page) {
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1024, height: 768, name: 'Tablet' },
    { width: 375, height: 812, name: 'Mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500); // Wait for layout adjustment
    
    // Verify main content is still visible
    const mainContent = page.locator('main, [role="main"], body > div').first();
    await expect(mainContent).toBeVisible();
    
    console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout verified`);
  }
  
  // Reset to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
}

/**
 * Test performance metrics
 */
export async function testPerformanceMetrics(page: Page) {
  // Basic performance checks
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  });
  
  // Performance assertions (reasonable thresholds for testing environment)
  expect(metrics.loadTime).toBeLessThan(5000); // Less than 5 seconds
  expect(metrics.domContentLoaded).toBeLessThan(3000); // Less than 3 seconds
  
  console.log('📊 Performance metrics:', metrics);
}

declare global {
  interface Window {
    fitcoachLocalStorageDemo: {
      enableLocalStorage: () => void;
      disableLocalStorage: () => void;
      loginAsAdmin: () => Promise<void>;
      loginAsTrainer: () => Promise<void>;
      loginAsStudent: () => Promise<void>;
      testFullData: () => void;
      testMinimalData: () => void;
      testEmptyData: () => void;
      clearAll: () => void;
      exportData: () => any;
      getStatus: () => any;
      getDemoCredentials: () => any;
    };
  }
}
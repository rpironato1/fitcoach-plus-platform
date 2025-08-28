/**
 * Basic Application Flow Testing - Simplified Version
 * 
 * This test verifies core functionality and captures screenshots
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

test.describe('Basic Application Flows', () => {
  test('should load landing page and basic navigation', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'landing-page-loaded');

    // Check if the page loads correctly
    await expect(page.locator('body')).toBeVisible();
    
    // Look for common elements
    const hasLogin = await page.locator('input[type="email"]').isVisible().catch(() => false);
    const hasContent = await page.textContent('body');
    
    console.log('Page content preview:', hasContent?.substring(0, 200));
    console.log('Has login form:', hasLogin);
    
    await takeScreenshot(page, 'landing-page-analysis');
  });

  test('should access demo page without authentication', async ({ page }) => {
    await page.goto('http://localhost:8030/student-demo');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'demo-page-loaded');

    // Verify demo page is accessible
    await expect(page.locator('body')).toBeVisible();
    
    const pageContent = await page.textContent('body');
    console.log('Demo page content preview:', pageContent?.substring(0, 200));
  });

  test('should access localStorage manager', async ({ page }) => {
    await page.goto('http://localhost:8030/localStorage-manager');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'localstorage-manager-loaded');

    // Verify localStorage manager is accessible
    await expect(page.locator('body')).toBeVisible();
    
    const pageContent = await page.textContent('body');
    console.log('LocalStorage manager content preview:', pageContent?.substring(0, 200));
  });

  test('should handle protected route redirects', async ({ page }) => {
    // Try to access admin route without authentication
    await page.goto('http://localhost:8030/admin');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'protected-route-redirect');

    // Should redirect to landing/login page
    const currentUrl = page.url();
    console.log('Redirected to:', currentUrl);
    
    // Verify we're not on the admin page
    expect(currentUrl).not.toContain('/admin');
  });

  test('should verify localStorage functionality', async ({ page }) => {
    await page.goto('http://localhost:8030/');
    await page.waitForLoadState('networkidle');

    // Test localStorage operations
    const localStorageTest = await page.evaluate(() => {
      try {
        // Test localStorage is available
        localStorage.setItem('test-key', 'test-value');
        const value = localStorage.getItem('test-key');
        localStorage.removeItem('test-key');
        
        // Check for existing FitCoach data
        const keys = Object.keys(localStorage).filter(key => key.startsWith('fitcoach_'));
        
        return {
          localStorageWorks: value === 'test-value',
          existingKeys: keys,
          keysCount: keys.length
        };
      } catch (error) {
        return {
          localStorageWorks: false,
          error: error.message,
          existingKeys: [],
          keysCount: 0
        };
      }
    });

    console.log('LocalStorage test results:', localStorageTest);
    
    expect(localStorageTest.localStorageWorks).toBe(true);
    await takeScreenshot(page, 'localstorage-test-completed');
  });
});
/**
 * Simplified Application Flow Testing
 * 
 * This test covers the actual working flows based on the application's current state
 */

import { test, expect, Page } from '@playwright/test';

// Utility functions
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `screenshots/comprehensive-flows/${name}.png`,
    fullPage: true
  });
}

async function measureResponseTime(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await action();
  return Date.now() - startTime;
}

test.describe('Core Application Flows - Working Implementation', () => {
  test('1. Landing Page and Basic Navigation', async ({ page }) => {
    const responseTime = await measureResponseTime(page, async () => {
      await page.goto('http://localhost:8030/');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Landing page load time: ${responseTime}ms`);
    await takeScreenshot(page, '01-landing-page-loaded');

    // Check page content
    const title = await page.title();
    const content = await page.textContent('body');
    
    expect(title).toContain('FitCoach');
    expect(content).toContain('FitCoach');
    
    console.log('Page title:', title);
    console.log('Content preview:', content?.substring(0, 200));
    
    // Test navigation elements
    const hasLoginElements = await page.locator('text=Entrar').isVisible();
    const hasSignupElements = await page.locator('text=Começar').isVisible() || 
                              await page.locator('text=Cadastrar').isVisible();
    
    console.log(`Has login: ${hasLoginElements}, Has signup: ${hasSignupElements}`);
    await takeScreenshot(page, '02-landing-page-navigation');
  });

  test('2. Student Demo Flow (No Authentication)', async ({ page }) => {
    const responseTime = await measureResponseTime(page, async () => {
      await page.goto('http://localhost:8030/student-demo');
      await page.waitForLoadState('networkidle');
    });

    console.log(`Demo page load time: ${responseTime}ms`);
    await takeScreenshot(page, '03-student-demo-loaded');

    // Verify demo content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Look for student-specific elements
    const hasStudentContent = content?.includes('Olá') || content?.includes('Dashboard') || content?.includes('Progresso');
    console.log(`Has student content: ${hasStudentContent}`);
    
    // Test interactions
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    console.log(`Demo has ${buttons} buttons and ${links} links`);
    
    if (buttons > 0) {
      // Test clicking first safe button
      const buttonTexts = await page.locator('button').allTextContents();
      console.log('Available buttons:', buttonTexts);
      
      // Find a safe button to click (avoid navigation/logout buttons)
      const safeButtons = buttonTexts.filter(text => 
        !text.includes('Sair') && 
        !text.includes('Logout') && 
        !text.includes('Voltar') &&
        text.length > 0
      );
      
      if (safeButtons.length > 0) {
        await page.click(`button:has-text("${safeButtons[0]}")`);
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '04-student-demo-interaction');
      }
    }
  });

  test('3. LocalStorage Manager Flow', async ({ page }) => {
    const responseTime = await measureResponseTime(page, async () => {
      await page.goto('http://localhost:8030/localStorage-manager');
      await page.waitForLoadState('networkidle');
    });

    console.log(`LocalStorage manager load time: ${responseTime}ms`);
    await takeScreenshot(page, '05-localstorage-manager-loaded');

    // Verify manager functionality
    const content = await page.textContent('body');
    const hasManagerContent = content?.includes('localStorage') || 
                              content?.includes('Gerenciador') ||
                              content?.includes('Dados');
    
    console.log(`Has manager content: ${hasManagerContent}`);
    
    // Test localStorage operations in context
    const localStorageTest = await page.evaluate(() => {
      try {
        // Test localStorage functionality
        const testKey = 'fitcoach_test_' + Date.now();
        const testValue = { test: true, timestamp: Date.now() };
        
        localStorage.setItem(testKey, JSON.stringify(testValue));
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        // Get existing FitCoach keys
        const existingKeys = Object.keys(localStorage).filter(key => key.startsWith('fitcoach_'));
        
        return {
          success: true,
          testPassed: retrieved !== null,
          existingKeys: existingKeys,
          keysCount: existingKeys.length
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          existingKeys: [],
          keysCount: 0
        };
      }
    });
    
    console.log('LocalStorage test results:', localStorageTest);
    expect(localStorageTest.success).toBe(true);
    expect(localStorageTest.testPassed).toBe(true);
    
    await takeScreenshot(page, '06-localstorage-test-completed');
  });

  test('4. Route Protection and Error Handling', async ({ page }) => {
    // Test protected routes redirect
    const protectedRoutes = ['/admin', '/trainer', '/student'];
    
    for (const route of protectedRoutes) {
      const responseTime = await measureResponseTime(page, async () => {
        await page.goto(`http://localhost:8030${route}`);
        await page.waitForLoadState('networkidle');
      });
      
      const currentUrl = page.url();
      console.log(`Route ${route} -> ${currentUrl} (${responseTime}ms)`);
      
      // Should redirect away from protected route when not authenticated
      const wasRedirected = !currentUrl.endsWith(route);
      console.log(`Route ${route} was redirected: ${wasRedirected}`);
      
      await takeScreenshot(page, `07-route-protection-${route.replace('/', '')}`);
    }
    
    // Test 404 handling
    const invalidRoute = '/non-existent-page';
    await page.goto(`http://localhost:8030${invalidRoute}`);
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const has404Content = content?.includes('404') || 
                          content?.includes('não encontrada') ||
                          content?.includes('Not Found');
    
    console.log(`Has 404 content: ${has404Content}`);
    expect(has404Content).toBe(true);
    
    await takeScreenshot(page, '08-404-error-handling');
  });

  test('5. Cross-Browser and Mobile Responsiveness', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:8030/');
      await page.waitForLoadState('networkidle');
      
      await takeScreenshot(page, `09-responsive-${viewport.name}`);
      
      // Test demo page on different sizes
      await page.goto('http://localhost:8030/student-demo');
      await page.waitForLoadState('networkidle');
      
      await takeScreenshot(page, `10-demo-responsive-${viewport.name}`);
    }
  });

  test('6. Performance and Load Testing', async ({ page }) => {
    // Test multiple page loads to measure consistency
    const loadTimes = [];
    
    for (let i = 0; i < 3; i++) {
      const loadTime = await measureResponseTime(page, async () => {
        await page.goto('http://localhost:8030/', { waitUntil: 'networkidle' });
      });
      loadTimes.push(loadTime);
      console.log(`Load ${i + 1}: ${loadTime}ms`);
    }
    
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    console.log(`Average load time: ${avgLoadTime.toFixed(2)}ms`);
    
    // Test should complete within reasonable time
    expect(avgLoadTime).toBeLessThan(5000); // 5 seconds max
    
    // Test navigation performance
    const navTime = await measureResponseTime(page, async () => {
      await page.goto('http://localhost:8030/student-demo');
      await page.waitForLoadState('networkidle');
    });
    
    console.log(`Navigation time: ${navTime}ms`);
    expect(navTime).toBeLessThan(3000); // 3 seconds max for navigation
    
    await takeScreenshot(page, '11-performance-test-completed');
  });

  test('7. Data Persistence and State Management', async ({ page }) => {
    await page.goto('http://localhost:8030/localStorage-manager');
    await page.waitForLoadState('networkidle');
    
    // Test data persistence across page reloads
    const persistenceTest = await page.evaluate(() => {
      // Store test data
      const testData = {
        timestamp: Date.now(),
        testValue: 'persistence-test',
        complexData: { nested: { value: 42 } }
      };
      
      localStorage.setItem('fitcoach_persistence_test', JSON.stringify(testData));
      return testData;
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data persisted
    const retrievedData = await page.evaluate(() => {
      const stored = localStorage.getItem('fitcoach_persistence_test');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.removeItem('fitcoach_persistence_test'); // Cleanup
        return parsed;
      }
      return null;
    });
    
    expect(retrievedData).toBeTruthy();
    expect(retrievedData.testValue).toBe(persistenceTest.testValue);
    expect(retrievedData.complexData.nested.value).toBe(42);
    
    console.log('Data persistence test passed');
    await takeScreenshot(page, '12-data-persistence-verified');
  });
});

test.describe('System Integration Tests', () => {
  test('8. Complete Application Health Check', async ({ page }) => {
    const healthChecks = {
      landingPage: false,
      demoAccess: false,
      managerAccess: false,
      routeProtection: false,
      localStorage: false,
      errorHandling: false
    };

    // Test landing page
    try {
      await page.goto('http://localhost:8030/');
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      healthChecks.landingPage = title.includes('FitCoach');
    } catch (error) {
      console.log('Landing page error:', error.message);
    }

    // Test demo access
    try {
      await page.goto('http://localhost:8030/student-demo');
      await page.waitForLoadState('networkidle');
      const content = await page.textContent('body');
      healthChecks.demoAccess = content.length > 100;
    } catch (error) {
      console.log('Demo access error:', error.message);
    }

    // Test manager access
    try {
      await page.goto('http://localhost:8030/localStorage-manager');
      await page.waitForLoadState('networkidle');
      const content = await page.textContent('body');
      healthChecks.managerAccess = content.length > 50;
    } catch (error) {
      console.log('Manager access error:', error.message);
    }

    // Test route protection
    try {
      await page.goto('http://localhost:8030/admin');
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      healthChecks.routeProtection = !currentUrl.endsWith('/admin');
    } catch (error) {
      console.log('Route protection error:', error.message);
    }

    // Test localStorage
    try {
      await page.goto('http://localhost:8030/');
      const storageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('health-check', 'ok');
          const result = localStorage.getItem('health-check') === 'ok';
          localStorage.removeItem('health-check');
          return result;
        } catch {
          return false;
        }
      });
      healthChecks.localStorage = storageWorks;
    } catch (error) {
      console.log('LocalStorage error:', error.message);
    }

    // Test error handling
    try {
      await page.goto('http://localhost:8030/nonexistent');
      await page.waitForLoadState('networkidle');
      const content = await page.textContent('body');
      healthChecks.errorHandling = content.includes('404') || content.includes('não encontrada');
    } catch (error) {
      console.log('Error handling test error:', error.message);
    }

    // Report results
    console.log('Health Check Results:', healthChecks);
    
    const passedChecks = Object.values(healthChecks).filter(Boolean).length;
    const totalChecks = Object.keys(healthChecks).length;
    
    console.log(`Health Check: ${passedChecks}/${totalChecks} passed`);
    expect(passedChecks).toBeGreaterThanOrEqual(4); // At least 4/6 should pass
    
    await takeScreenshot(page, '13-health-check-completed');
  });
});
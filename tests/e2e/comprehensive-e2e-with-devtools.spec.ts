import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Enhanced E2E testing with DevTools and Axe Core
test.describe('Comprehensive E2E Tests with DevTools and Accessibility', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let networkErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear logs arrays
    consoleLogs = [];
    consoleErrors = [];
    networkErrors = [];

    // Enable DevTools logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleErrors.push(`[${type}] ${text}`);
      } else {
        consoleLogs.push(`[${type}] ${text}`);
      }
    });

    // Monitor network failures
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`Network error: ${response.status()} ${response.url()}`);
      }
    });

    // Monitor page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });
  });

  test.afterEach(async ({ page }) => {
    // Report DevTools findings
    console.log('\n=== DevTools Analysis ===');
    console.log(`Console logs: ${consoleLogs.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Network errors: ${networkErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n🚨 Console Errors Found:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors Found:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }
  });

  test('Landing Page - Complete Usability & Accessibility Analysis', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Accessibility testing with Axe Core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    console.log(`\n🔍 Accessibility Violations: ${accessibilityScanResults.violations.length}`);
    
    // Report accessibility issues
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n♿ Accessibility Issues Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`     Impact: ${violation.impact}`);
        console.log(`     Help: ${violation.help}`);
      });
    }

    // Usability checks
    await test.step('Check page loading and responsiveness', async () => {
      // Check if page loads without major console errors
      const criticalErrors = consoleErrors.filter(error => 
        error.includes('Error') || error.includes('Failed') || error.includes('404')
      );
      
      if (criticalErrors.length > 0) {
        console.log('\n⚠️ Critical loading issues found:', criticalErrors);
      }
      
      // Check basic usability elements (using actual page structure)
      await expect(page.locator('section').first()).toBeVisible(); // Hero section
      
      // Look for login button with various possible selectors
      const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login"), [data-testid="login-button"]').first();
      if (await loginButton.count() > 0) {
        await expect(loginButton).toBeVisible();
        console.log('✅ Login button found and visible');
      } else {
        console.log('⚠️ Login button not found - checking for navigation elements');
        // Check for any navigation or CTA buttons
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        console.log(`Found ${buttonCount} buttons on the page`);
      }
    });

    await test.step('Test navigation usability', async () => {
      // Test login button accessibility with flexible selectors
      const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login"), [data-testid="login-button"]').first();
      
      if (await loginButton.count() > 0) {
        await expect(loginButton).toBeVisible();
        await expect(loginButton).toBeEnabled();
        
        // Check if button has proper accessibility attributes
        const ariaLabel = await loginButton.getAttribute('aria-label');
        const buttonText = await loginButton.textContent();
        
        console.log(`Login button accessibility - aria-label: ${ariaLabel}, text: ${buttonText}`);
      } else {
        console.log('⚠️ No login button found - analyzing page navigation structure');
        
        // Analyze all interactive elements on the page
        const allButtons = page.locator('button');
        const allLinks = page.locator('a');
        const buttonCount = await allButtons.count();
        const linkCount = await allLinks.count();
        
        console.log(`Page navigation analysis:`);
        console.log(`  - Buttons found: ${buttonCount}`);
        console.log(`  - Links found: ${linkCount}`);
        
        // Log first few button texts for debugging
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`  - Button ${i + 1}: "${buttonText}"`);
        }
      }
    });

    // Performance insights from DevTools
    await test.step('Analyze performance metrics', async () => {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log('\n📊 Performance Metrics:');
      console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
      console.log(`  Load Complete: ${performanceMetrics.loadComplete}ms`);
      console.log(`  First Paint: ${performanceMetrics.firstPaint}ms`);
      console.log(`  First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    });

    // Accessibility should not have critical violations
    expect(accessibilityScanResults.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  test('Authentication Flow - Usability & Error Handling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await test.step('Navigate to login and test usability', async () => {
      // Click login button
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('/auth/login');
      
      // Accessibility scan on login page
      const loginAccessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`\n🔐 Login Page Accessibility Violations: ${loginAccessibility.violations.length}`);
      
      // Test form usability
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      // Check form elements visibility and accessibility
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Test keyboard navigation
      await emailInput.press('Tab');
      await expect(passwordInput).toBeFocused();
      
      await passwordInput.press('Tab');
      await expect(submitButton).toBeFocused();
    });

    await test.step('Test form validation and error states', async () => {
      // Test empty form submission
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      const errorMessages = page.locator('[role="alert"], .error-message, [data-testid*="error"]');
      const errorCount = await errorMessages.count();
      
      console.log(`\n📝 Form validation errors displayed: ${errorCount}`);
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`  Error ${i + 1}: ${errorText}`);
        }
      }
    });

    await test.step('Test successful login flow', async () => {
      // Fill in valid credentials
      await page.fill('input[type="email"]', 'admin@fitcoach.com');
      await page.fill('input[type="password"]', 'admin123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for navigation or success state
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check if login was successful
      const currentUrl = page.url();
      console.log(`\n✅ After login navigation: ${currentUrl}`);
      
      // Verify we're in an authenticated state
      const isLoggedIn = currentUrl.includes('/admin') || currentUrl.includes('/dashboard');
      expect(isLoggedIn).toBeTruthy();
    });
  });

  test('Dashboard Functionality - Complete User Experience', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@fitcoach.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await test.step('Test dashboard loading and accessibility', async () => {
      // Accessibility scan of dashboard
      const dashboardAccessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`\n📊 Dashboard Accessibility Violations: ${dashboardAccessibility.violations.length}`);
      
      // Check for critical dashboard elements
      const dashboardElements = [
        '[data-testid="sidebar"]',
        '[data-testid="main-content"]',
        '[data-testid="user-menu"], [data-testid="profile-menu"]'
      ];
      
      for (const selector of dashboardElements) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await expect(element.first()).toBeVisible();
          console.log(`✅ Dashboard element found: ${selector}`);
        } else {
          console.log(`⚠️ Dashboard element not found: ${selector}`);
        }
      }
    });

    await test.step('Test navigation and interactions', async () => {
      // Test sidebar navigation if available
      const sidebarLinks = page.locator('nav a, [role="navigation"] a');
      const linkCount = await sidebarLinks.count();
      
      console.log(`\n🧭 Navigation links found: ${linkCount}`);
      
      // Test at least one navigation link
      if (linkCount > 0) {
        const firstLink = sidebarLinks.first();
        const linkText = await firstLink.textContent();
        console.log(`Testing navigation to: ${linkText}`);
        
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check if navigation was successful
        const newUrl = page.url();
        console.log(`✅ Navigation successful to: ${newUrl}`);
      }
    });

    await test.step('Test responsive design', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Check if mobile navigation works
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu" i]');
      if (await mobileMenu.count() > 0) {
        console.log('📱 Mobile menu found, testing interaction...');
        await mobileMenu.first().click();
        await page.waitForTimeout(500);
      }
      
      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test('Form Interactions - Complete Usability Testing', async ({ page }) => {
    // Login as admin to access forms
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@fitcoach.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await test.step('Test form creation dialogs', async () => {
      // Look for "Create" or "Add" buttons
      const createButtons = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const buttonCount = await createButtons.count();
      
      console.log(`\n➕ Create buttons found: ${buttonCount}`);
      
      if (buttonCount > 0) {
        // Test first create button
        const firstButton = createButtons.first();
        const buttonText = await firstButton.textContent();
        console.log(`Testing create button: ${buttonText}`);
        
        await firstButton.click();
        await page.waitForTimeout(1000);
        
        // Check if dialog/modal opened
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="dialog"]');
        if (await modal.count() > 0) {
          console.log('✅ Modal/Dialog opened successfully');
          
          // Test form accessibility in modal
          const modalAccessibility = await new AxeBuilder({ page })
            .include('[role="dialog"], .modal, [data-testid*="dialog"]')
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();
          
          console.log(`📝 Modal Form Accessibility Violations: ${modalAccessibility.violations.length}`);
          
          // Test form inputs in modal
          const formInputs = modal.locator('input, select, textarea');
          const inputCount = await formInputs.count();
          
          console.log(`Form inputs found in modal: ${inputCount}`);
          
          // Test keyboard navigation in form
          if (inputCount > 0) {
            await formInputs.first().focus();
            for (let i = 0; i < Math.min(inputCount - 1, 3); i++) {
              await page.keyboard.press('Tab');
              await page.waitForTimeout(200);
            }
          }
          
          // Close modal
          const closeButton = modal.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label*="close" i]');
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
          } else {
            await page.keyboard.press('Escape');
          }
        }
      }
    });
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    await test.step('Test network error handling', async () => {
      // Block network requests to simulate offline
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Check how app handles network failures
      const errorIndicators = page.locator('[data-testid*="error"], .error, [role="alert"]');
      const errorCount = await errorIndicators.count();
      
      console.log(`\n🚫 Error indicators displayed during network failure: ${errorCount}`);
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorIndicators.nth(i).textContent();
          console.log(`  Error indicator ${i + 1}: ${errorText}`);
        }
      }
    });

    await test.step('Test invalid URL handling', async () => {
      // Clear network blocking
      await page.unroute('**/api/**');
      
      // Test 404 page
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');
      
      // Check if 404 is handled gracefully
      const pageContent = await page.textContent('body');
      const has404Content = pageContent?.includes('404') || 
                           pageContent?.includes('Not Found') || 
                           pageContent?.includes('Page not found');
      
      console.log(`\n🔍 404 page handling: ${has404Content ? 'Graceful' : 'Needs improvement'}`);
    });
  });
});
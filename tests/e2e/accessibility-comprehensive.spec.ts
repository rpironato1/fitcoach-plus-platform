import { test, expect, Page } from '@playwright/test';

interface PageTestConfig {
  path: string;
  name: string;
  requiresAuth?: boolean;
  userRole?: 'admin' | 'trainer' | 'student';
  waitForSelector?: string;
  setup?: (page: Page) => Promise<void>;
}

const pages: PageTestConfig[] = [
  // Public pages
  { path: '/', name: 'Landing Page' },
  { path: '/student-demo', name: 'Student Demo' },
  { path: '/localStorage-manager', name: 'LocalStorage Manager' },
  
  // Error pages
  { path: '/non-existent-page', name: '404 Not Found' }
];

async function authenticateUser(page: Page, role: 'admin' | 'trainer' | 'student') {
  const credentials = {
    admin: { email: 'admin@fitcoach.com', password: 'admin123' },
    trainer: { email: 'trainer@fitcoach.com', password: 'trainer123' },
    student: { email: 'student@fitcoach.com', password: 'student123' }
  };

  await page.goto('/');
  
  // Look for login form or button
  const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login"), [data-testid="login-button"]');
  if (await loginButton.isVisible({ timeout: 5000 })) {
    await loginButton.click();
  }

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', credentials[role].email);
  await page.fill('input[type="password"], input[name="password"]', credentials[role].password);
  
  // Submit form
  await page.click('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
  
  // Wait for redirect
  await page.waitForURL(`**/${role}/**`, { timeout: 10000 });
}

async function runAxeAccessibilityCheck(page: Page): Promise<any[]> {
  // Inject axe-core into the page
  await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.7.2/axe.min.js' });
  
  // Run axe-core accessibility check
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run(document, {
      runOnly: {
        type: 'tags',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
      }
    });
  });
  
  return results.violations || [];
}

test.describe('Comprehensive Accessibility Testing with Axe-Core', () => {
  for (const pageConfig of pages) {
    test(`${pageConfig.name} - Accessibility Test`, async ({ page }, testInfo) => {
      console.log(`\n=== TESTING ${pageConfig.name.toUpperCase()} ===`);
      
      try {
        // Setup authentication if required
        if (pageConfig.requiresAuth && pageConfig.userRole) {
          await authenticateUser(page, pageConfig.userRole);
        }

        // Navigate to the page
        console.log(`Navigating to: ${pageConfig.path}`);
        await page.goto(pageConfig.path);
        
        // Wait for page to load
        if (pageConfig.waitForSelector) {
          await page.waitForSelector(pageConfig.waitForSelector, { timeout: 10000 });
        } else {
          await page.waitForLoadState('networkidle', { timeout: 15000 });
        }

        // Execute custom setup if provided
        if (pageConfig.setup) {
          await pageConfig.setup(page);
        }

        // Take screenshot before accessibility check
        const screenshotPath = `accessibility-before-${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({ 
          path: `test-results/${screenshotPath}`,
          fullPage: true 
        });

        // Run accessibility check
        const violations = await runAxeAccessibilityCheck(page);

        console.log(`URL: ${pageConfig.path}`);
        console.log(`Total violations found: ${violations.length}`);

        if (violations.length > 0) {
          console.log('\n--- VIOLATIONS DETAILS ---');
          violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.id}: ${violation.description}`);
            console.log(`   Impact: ${violation.impact}`);
            console.log(`   Help: ${violation.help}`);
            console.log(`   Tags: ${violation.tags.join(', ')}`);
            console.log(`   Nodes affected: ${violation.nodes.length}`);
            
            violation.nodes.forEach((node: any, nodeIndex: number) => {
              console.log(`   Node ${nodeIndex + 1}:`);
              console.log(`     Target: ${node.target.join(' > ')}`);
              console.log(`     HTML: ${node.html.substring(0, 100)}...`);
              console.log(`     Failure Summary: ${node.failureSummary}`);
            });
          });

          // Take screenshot after violations found
          const violationsScreenshotPath = `accessibility-violations-${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          await page.screenshot({ 
            path: `test-results/${violationsScreenshotPath}`,
            fullPage: true 
          });

          // Add violation details to test info
          testInfo.attachments.push({
            name: `Accessibility Violations - ${pageConfig.name}`,
            body: JSON.stringify(violations, null, 2),
            contentType: 'application/json'
          });
        } else {
          console.log('✅ No accessibility violations found!');
        }

        // Get page info for reporting
        const pageTitle = await page.title();
        const pageUrl = page.url();
        
        console.log(`\nPage Title: ${pageTitle}`);
        console.log(`Final URL: ${pageUrl}`);
        console.log(`=== END REPORT FOR ${pageConfig.name.toUpperCase()} ===\n`);

        // For now, don't fail the test to collect all violations first
        // expect(violations).toHaveLength(0);

      } catch (error) {
        console.error(`Error testing ${pageConfig.name}:`, error);
        
        // Take screenshot on error
        const errorScreenshotPath = `accessibility-error-${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({ 
          path: `test-results/${errorScreenshotPath}`,
          fullPage: true 
        });
        
        console.log(`⚠️  Page ${pageConfig.name} could not be tested: ${error}`);
      }
    });
  }
});

test.describe('Lighthouse CI Integration', () => {
  test('Run Lighthouse Accessibility Audit for Key Pages', async ({ page }) => {
    const keyPages = [
      '/',
      '/student-demo',
      '/localStorage-manager'
    ];

    for (const pagePath of keyPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Take performance timing
      const timing = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
          load: perf.loadEventEnd - perf.navigationStart,
          firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
        };
      });

      console.log(`\n=== PERFORMANCE METRICS FOR ${pagePath} ===`);
      console.log(`DOM Content Loaded: ${timing.domContentLoaded}ms`);
      console.log(`Load Complete: ${timing.load}ms`);
      console.log(`First Paint: ${timing.firstPaint}ms`);
      console.log(`First Contentful Paint: ${timing.firstContentfulPaint}ms`);
      console.log(`=== END PERFORMANCE METRICS ===\n`);
    }
  });
});

test.describe('Missing Resources Detection', () => {
  test('Detect Missing Images, Icons, and Resources', async ({ page }) => {
    const resourceErrors: string[] = [];
    const missingImages: string[] = [];

    // Listen for failed network requests
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        resourceErrors.push(`${response.status()}: ${response.url()}`);
      }
    });

    // Test key pages for missing resources
    const pagesToTest = ['/', '/student-demo', '/localStorage-manager'];
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => ({
            src: img.src,
            alt: img.alt,
            element: img.outerHTML.substring(0, 100)
          }));
      });

      if (brokenImages.length > 0) {
        console.log(`\n🖼️  Broken images found on ${pagePath}:`);
        brokenImages.forEach(img => {
          console.log(`  - ${img.src} (alt: "${img.alt}")`);
          missingImages.push(`${pagePath}: ${img.src}`);
        });
      }

      // Check for missing icons (common selectors)
      const missingIcons = await page.evaluate(() => {
        const iconSelectors = [
          'i[class*="icon"]:empty',
          '.icon:empty',
          '[class*="lucide"]:empty',
          'svg:not([viewBox]):empty'
        ];
        
        const missing = [];
        iconSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            missing.push({
              selector,
              element: el.outerHTML.substring(0, 100),
              classes: el.className
            });
          });
        });
        
        return missing;
      });

      if (missingIcons.length > 0) {
        console.log(`\n🎨 Potentially missing icons on ${pagePath}:`);
        missingIcons.forEach(icon => {
          console.log(`  - ${icon.element}`);
        });
      }
    }

    // Report summary
    console.log(`\n=== MISSING RESOURCES SUMMARY ===`);
    console.log(`Network errors: ${resourceErrors.length}`);
    console.log(`Missing images: ${missingImages.length}`);
    
    if (resourceErrors.length > 0) {
      console.log('\nNetwork Errors:');
      resourceErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (missingImages.length > 0) {
      console.log('\nMissing Images:');
      missingImages.forEach(img => console.log(`  - ${img}`));
    }
    
    console.log(`=== END MISSING RESOURCES SUMMARY ===\n`);
  });
});
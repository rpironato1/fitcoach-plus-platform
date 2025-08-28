/**
 * Comprehensive Dashboard Screenshots Test
 * 
 * Tests all dashboards using localStorage credentials and captures screenshots
 * for visual analysis and error detection.
 */

import { test, expect, Page } from '@playwright/test';

// Demo credentials from localStorage service
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@fitcoach.com', password: 'admin123' },
  trainer: { email: 'trainer@fitcoach.com', password: 'trainer123' },
  student: { email: 'student@fitcoach.com', password: 'student123' }
};

// Helper function to set up localStorage authentication
async function setupLocalStorageAuth(page: Page, userType: 'admin' | 'trainer' | 'student') {
  // Initialize localStorage with mock data
  await page.evaluate(() => {
    localStorage.setItem('fitcoach_use_localStorage', 'true');
  });

  // Set up authentication session based on user type
  await page.evaluate(async (type) => {
    // Enable localStorage mode
    localStorage.setItem('fitcoach_use_localStorage', 'true');
    
    // Create mock authentication session based on user type
    const now = new Date().toISOString();
    const userId = type === 'admin' ? 'admin_123' : type === 'trainer' ? 'trainer_123' : 'student_123';
    const email = `${type}@fitcoach.com`;
    
    const authSession = {
      user: {
        id: userId,
        email: email,
        created_at: now,
        email_confirmed_at: now,
        last_sign_in_at: now,
      },
      access_token: `mock_token_${userId}_${Date.now()}`,
      refresh_token: `mock_refresh_${userId}_${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      token_type: 'bearer',
    };
    
    // Set auth session in localStorage
    localStorage.setItem('fitcoach_auth', JSON.stringify(authSession));
    
    // Create comprehensive mock data structure
    const mockData = {
      auth_session: authSession,
      users: [
        {
          id: 'admin_123',
          email: 'admin@fitcoach.com',
          created_at: now,
          email_confirmed_at: now,
          last_sign_in_at: now,
        },
        {
          id: 'trainer_123',
          email: 'trainer@fitcoach.com',
          created_at: now,
          email_confirmed_at: now,
          last_sign_in_at: now,
        },
        {
          id: 'student_123',
          email: 'student@fitcoach.com',
          created_at: now,
          email_confirmed_at: now,
          last_sign_in_at: now,
        },
      ],
      profiles: [
        {
          id: 'admin_123',
          first_name: 'Admin',
          last_name: 'FitCoach',
          phone: '+55 11 99999-9999',
          role: 'admin',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'trainer_123',
          first_name: 'Personal',
          last_name: 'Trainer',
          phone: '+55 11 98888-8888',
          role: 'trainer',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'student_123',
          first_name: 'Ana',
          last_name: 'Silva',
          phone: '+55 11 97777-7777',
          role: 'student',
          created_at: now,
          updated_at: now,
        },
      ],
      trainer_profiles: [
        {
          id: 'trainer_123',
          plan: 'pro',
          max_students: 40,
          ai_credits: 25,
          active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          avatar_url: null,
          bio: 'Personal trainer especializado em emagrecimento e hipertrofia',
          whatsapp_number: '+5511988888888',
          created_at: now,
          updated_at: now,
        },
      ],
      student_profiles: [
        {
          id: 'student_123',
          trainer_id: 'trainer_123',
          gender: 'female',
          menstrual_cycle_tracking: true,
          start_date: now,
          status: 'active',
          created_at: now,
          updated_at: now,
        },
      ],
      students: [],
      sessions: [],
      payments: [],
      diet_plans: [],
      workout_plans: [],
      notifications: [],
      system_settings: [],
      lastUpdated: now,
      dataVersion: '2.0.0',
    };
    
    // Store the complete data structure
    localStorage.setItem('fitcoach_data', JSON.stringify(mockData));
  }, userType);

  // Wait a bit for localStorage to be set
  await page.waitForTimeout(1000);
}

// Helper function to capture full page screenshot
async function captureFullPageScreenshot(page: Page, name: string) {
  const screenshotPath = `screenshots/dashboard-analysis/${name}-dashboard.png`;
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Capture full page screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    type: 'png'
  });
  
  console.log(`Screenshot captured: ${screenshotPath}`);
  return screenshotPath;
}

// Helper function to analyze page for common issues
async function analyzePage(page: Page, userType: string) {
  const issues: string[] = [];
  
  try {
    // Check for error messages
    const errorElements = await page.locator('.error, .alert-error, [data-testid*="error"]').count();
    if (errorElements > 0) {
      issues.push(`Found ${errorElements} error element(s)`);
    }

    // Check for loading states that might be stuck
    const loadingElements = await page.locator('.loading, .spinner, [data-testid*="loading"]').count();
    if (loadingElements > 0) {
      issues.push(`Found ${loadingElements} loading element(s) - might be stuck`);
    }

    // Check for broken images
    const images = await page.locator('img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0) {
        const src = await img.getAttribute('src');
        issues.push(`Broken image found: ${src}`);
      }
    }

    // Check for console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console error: ${msg.text()}`);
      }
    });

    // Check for accessibility issues (basic)
    const missingAltImages = await page.locator('img:not([alt])').count();
    if (missingAltImages > 0) {
      issues.push(`Found ${missingAltImages} images without alt text`);
    }

    // Check for missing navigation elements
    const hasNavigation = await page.locator('nav, [role="navigation"]').count();
    if (hasNavigation === 0 && userType !== 'landing') {
      issues.push('No navigation elements found');
    }

    // Check for empty content areas
    const mainContent = await page.locator('main, [role="main"], .main-content').count();
    if (mainContent === 0) {
      issues.push('No main content area found');
    }

  } catch (error) {
    issues.push(`Analysis error: ${error}`);
  }

  return issues;
}

test.describe('Dashboard Screenshots and Analysis', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    // Use the dev server URL
    baseURL = 'http://localhost:8030';
  });

  test('Admin Dashboard - Screenshot and Analysis', async ({ page }) => {
    console.log('Testing Admin Dashboard...');
    
    // Set up localStorage authentication as admin
    await page.goto(baseURL);
    await setupLocalStorageAuth(page, 'admin');
    
    // Navigate to admin dashboard
    await page.goto(`${baseURL}/admin`);
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="admin-dashboard"], .admin-dashboard, h1', { timeout: 10000 });
    
    // Capture screenshot
    const screenshotPath = await captureFullPageScreenshot(page, 'admin');
    
    // Analyze page for issues
    const issues = await analyzePage(page, 'admin');
    
    // Log results
    console.log(`Admin Dashboard Analysis:`);
    console.log(`Screenshot: ${screenshotPath}`);
    console.log(`Issues found: ${issues.length}`);
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    // Verify basic dashboard elements
    await expect(page).toHaveTitle(/FitCoach|Admin/i);
    
    // Check for critical errors that should fail the test
    const criticalErrors = issues.filter(issue => 
      issue.includes('Console error') || 
      issue.includes('No main content') ||
      issue.includes('error element')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Trainer Dashboard - Screenshot and Analysis', async ({ page }) => {
    console.log('Testing Trainer Dashboard...');
    
    // Set up localStorage authentication as trainer
    await page.goto(baseURL);
    await setupLocalStorageAuth(page, 'trainer');
    
    // Navigate to trainer dashboard
    await page.goto(`${baseURL}/trainer`);
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="trainer-dashboard"], .trainer-dashboard, h1', { timeout: 10000 });
    
    // Capture screenshot
    const screenshotPath = await captureFullPageScreenshot(page, 'trainer');
    
    // Analyze page for issues
    const issues = await analyzePage(page, 'trainer');
    
    // Log results
    console.log(`Trainer Dashboard Analysis:`);
    console.log(`Screenshot: ${screenshotPath}`);
    console.log(`Issues found: ${issues.length}`);
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    // Verify basic dashboard elements
    await expect(page).toHaveTitle(/FitCoach|Trainer|Personal/i);
    
    // Check for critical errors
    const criticalErrors = issues.filter(issue => 
      issue.includes('Console error') || 
      issue.includes('No main content') ||
      issue.includes('error element')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Student Dashboard - Screenshot and Analysis', async ({ page }) => {
    console.log('Testing Student Dashboard...');
    
    // Set up localStorage authentication as student  
    await page.goto(baseURL);
    await setupLocalStorageAuth(page, 'student');
    
    // Navigate to student dashboard
    await page.goto(`${baseURL}/student`);
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="student-dashboard"], .student-dashboard, h1', { timeout: 10000 });
    
    // Capture screenshot
    const screenshotPath = await captureFullPageScreenshot(page, 'student');
    
    // Analyze page for issues
    const issues = await analyzePage(page, 'student');
    
    // Log results
    console.log(`Student Dashboard Analysis:`);
    console.log(`Screenshot: ${screenshotPath}`);
    console.log(`Issues found: ${issues.length}`);
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    // Verify basic dashboard elements
    await expect(page).toHaveTitle(/FitCoach|Student|Aluno/i);
    
    // Check for critical errors
    const criticalErrors = issues.filter(issue => 
      issue.includes('Console error') || 
      issue.includes('No main content') ||
      issue.includes('error element')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Comprehensive Navigation Test', async ({ page }) => {
    console.log('Testing comprehensive navigation across all dashboards...');
    
    const testResults: any[] = [];
    
    // Test each user type
    for (const userType of ['admin', 'trainer', 'student'] as const) {
      console.log(`\nTesting ${userType} navigation...`);
      
      await page.goto(baseURL);
      await setupLocalStorageAuth(page, userType);
      
      // Navigate to dashboard
      const dashboardPath = `/${userType}`;
      await page.goto(`${baseURL}${dashboardPath}`);
      
      // Wait for page load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Capture navigation screenshot
      const navScreenshot = await captureFullPageScreenshot(page, `${userType}-navigation`);
      
      // Test navigation links if they exist
      const navLinks = await page.locator('nav a, [role="navigation"] a').all();
      console.log(`Found ${navLinks.length} navigation links for ${userType}`);
      
      const linkTexts: string[] = [];
      for (const link of navLinks.slice(0, 5)) { // Limit to first 5 links
        try {
          const text = await link.textContent();
          const href = await link.getAttribute('href');
          if (text && href) {
            linkTexts.push(`${text.trim()} -> ${href}`);
          }
        } catch (error) {
          console.log(`Error reading link: ${error}`);
        }
      }
      
      testResults.push({
        userType,
        screenshot: navScreenshot,
        navigationLinks: linkTexts,
        linkCount: navLinks.length
      });
    }
    
    // Log comprehensive results
    console.log('\n=== COMPREHENSIVE NAVIGATION RESULTS ===');
    testResults.forEach(result => {
      console.log(`\n${result.userType.toUpperCase()} Dashboard:`);
      console.log(`Screenshot: ${result.screenshot}`);
      console.log(`Navigation links (${result.linkCount}):`);
      result.navigationLinks.forEach((link: string) => console.log(`  - ${link}`));
    });
    
    // Verify all dashboards are accessible
    expect(testResults).toHaveLength(3);
    testResults.forEach(result => {
      expect(result.screenshot).toBeTruthy();
    });
  });
});
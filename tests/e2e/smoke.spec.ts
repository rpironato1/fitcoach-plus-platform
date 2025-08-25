import { test, expect } from '@playwright/test';

test.describe('FitCoach Smoke Tests', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FitCoach/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load student demo page', async ({ page }) => {
    await page.goto('/student-demo');
    await expect(page.locator('text=Olá, Maria!')).toBeVisible();
  });

  test('should load localStorage manager', async ({ page }) => {
    await page.goto('/localStorage-manager');
    await expect(page.locator('text=localStorage Manager')).toBeVisible();
  });
});
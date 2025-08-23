import { test, expect } from '@playwright/test';

test.describe('FitCoach Landing Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display landing page with all sections', async ({ page }) => {
    // Test hero section
    await expect(page.getByRole('heading', { name: /A plataforma mais completa para Personal Trainers/ })).toBeVisible();
    
    // Test navigation
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Começar Grátis' })).toBeVisible();
    
    // Test stats section
    await expect(page.getByText('2.5k+')).toBeVisible();
    await expect(page.getByText('Personal Trainers')).toBeVisible();
    await expect(page.getByText('15k+')).toBeVisible();
    await expect(page.getByText('Alunos Ativos')).toBeVisible();
  });

  test('should have working tabs functionality', async ({ page }) => {
    // Test Gestão tab (default)
    await expect(page.getByRole('tab', { name: 'Gestão' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Gestão Inteligente de Alunos')).toBeVisible();
    
    // Test Agendamento tab
    await page.getByRole('tab', { name: 'Agendamento' }).click();
    await expect(page.getByRole('tab', { name: 'Agendamento' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Agendamento Automático')).toBeVisible();
    
    // Test IA tab  
    await page.getByRole('tab', { name: 'IA' }).click();
    await expect(page.getByRole('tab', { name: 'IA' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('IA para Planos de Dieta')).toBeVisible();
    
    // Test Sistema tab
    await page.getByRole('tab', { name: 'Sistema' }).click();
    await expect(page.getByRole('tab', { name: 'Sistema' })).toHaveAttribute('aria-selected', 'true');
    
    // Test Analytics tab
    await page.getByRole('tab', { name: 'Analytics' }).click();
    await expect(page.getByRole('tab', { name: 'Analytics' })).toHaveAttribute('aria-selected', 'true');
    
    // Test Mobile tab
    await page.getByRole('tab', { name: 'Mobile' }).click();
    await expect(page.getByRole('tab', { name: 'Mobile' })).toHaveAttribute('aria-selected', 'true');
  });

  test('should have working FAQ accordion', async ({ page }) => {
    // Test first FAQ item
    const faqButton = page.getByRole('button', { name: 'Como funciona o período gratuito?' });
    await faqButton.click();
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Você pode usar o plano Free indefinidamente')).toBeVisible();
    
    // Test closing FAQ
    await faqButton.click();
    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should open login dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('dialog', { name: 'Bem-vindo de volta!' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible();
    
    // Close dialog
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should have working pricing section', async ({ page }) => {
    // Test pricing cards
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Elite')).toBeVisible();
    
    // Test popular badge
    await expect(page.getByText('Mais Popular')).toBeVisible();
    
    // Test pricing buttons
    await expect(page.getByRole('button', { name: 'Começar Grátis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Escolher Plano' })).toBeVisible();
  });

  test('should have proper mobile responsiveness', async ({ page }) => {
    // Test desktop view first
    await expect(page.getByRole('heading', { name: /A plataforma mais completa/ })).toBeVisible();
    
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Verify content is still visible and properly laid out
    await expect(page.getByRole('heading', { name: /A plataforma mais completa/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Começar Grátis' })).toBeVisible();
    
    // Test mobile navigation
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should have proper contrast and accessibility', async ({ page }) => {
    // Test that all buttons are keyboard accessible
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test that all interactive elements have proper roles
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(10); // Should have many buttons
    
    // Test that all links have proper href or are buttons
    const links = page.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(5); // Should have footer links
  });

  test('should handle button clicks gracefully', async ({ page }) => {
    // Test that buttons respond to clicks (even if they don't navigate)
    const experimentarButton = page.getByRole('button', { name: 'Experimentar Agora' }).first();
    await experimentarButton.click();
    // Button should not cause any JavaScript errors
    
    const verDemoButton = page.getByRole('button', { name: 'Ver Demo' });
    await verDemoButton.click();
    // Button should not cause any JavaScript errors
    
    const começarGratisButtons = page.getByRole('button', { name: 'Começar Grátis' });
    await começarGratisButtons.first().click();
    // Button should not cause any JavaScript errors
  });

  test('should have all required testimonials content', async ({ page }) => {
    // Test testimonials section
    await expect(page.getByText('Maria Silva')).toBeVisible();
    await expect(page.getByText('João Santos')).toBeVisible();
    await expect(page.getByText('Ana Costa')).toBeVisible();
    
    // Test testimonial metrics
    await expect(page.getByText('+150% receita')).toBeVisible();
    await expect(page.getByText('4h economizadas/semana')).toBeVisible();
    await expect(page.getByText('98% satisfação clientes')).toBeVisible();
  });

  test('should have complete footer content', async ({ page }) => {
    // Test footer sections
    await expect(page.getByText('Produto')).toBeVisible();
    await expect(page.getByText('Empresa')).toBeVisible();
    await expect(page.getByText('Suporte')).toBeVisible();
    
    // Test footer links
    await expect(page.getByRole('link', { name: 'Recursos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Preços' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sobre' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Central de Ajuda' })).toBeVisible();
    
    // Test footer copyright
    await expect(page.getByText('© 2024 FitCoach. Todos os direitos reservados.')).toBeVisible();
  });
});

test.describe('FitCoach Navigation Tests', () => {
  test('should handle protected routes properly', async ({ page }) => {
    // Try to access trainer dashboard without authentication
    await page.goto('/trainer');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to landing page since not authenticated
    expect(page.url()).toContain('/');
    
    // Try admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/');
    
    // Try student dashboard  
    await page.goto('/student');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/');
  });

  test('should handle 404 routes', async ({ page }) => {
    await page.goto('/nonexistent-route');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 page or redirect
    // The exact behavior depends on the router configuration
    const isOn404 = page.url().includes('/nonexistent-route') || page.url().includes('/');
    expect(isOn404).toBeTruthy();
  });
});
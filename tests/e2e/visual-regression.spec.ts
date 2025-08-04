import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('landing page deve manter aparência consistente', async ({ page }) => {
    await page.goto('/')
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle')
    
    // Screenshot da página completa
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('formulário de login deve manter layout', async ({ page }) => {
    await page.goto('/')
    
    // Abrir modal de login
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForSelector('[role="dialog"]')
    
    // Screenshot do modal
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('login-modal.png', {
      animations: 'disabled',
    })
  })

  test('dashboard trainer deve ser consistente', async ({ page }) => {
    // Mock login como trainer
    await page.route('**/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { 
            session: { 
              user: { id: 'trainer-id', role: 'trainer' } 
            } 
          }
        })
      })
    })

    await page.goto('/trainer')
    await page.waitForLoadState('networkidle')
    
    // Screenshot do dashboard
    await expect(page).toHaveScreenshot('trainer-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('responsividade mobile deve ser mantida', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Screenshot mobile
    await expect(page).toHaveScreenshot('landing-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('tema escuro deve renderizar corretamente', async ({ page }) => {
    await page.goto('/')
    
    // Simular preferência de tema escuro
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('landing-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('componentes de formulário devem ter aparência consistente', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /cadastrar/i }).click()
    await page.waitForSelector('[role="dialog"]')
    
    // Focar em diferentes campos para testar estados
    await page.getByPlaceholder(/nome/i).focus()
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('register-form-focused.png')
    
    // Estado de erro
    await page.getByRole('button', { name: /cadastrar/i }).click()
    await page.waitForSelector('.text-destructive', { timeout: 1000 }).catch(() => {})
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('register-form-errors.png')
  })
})

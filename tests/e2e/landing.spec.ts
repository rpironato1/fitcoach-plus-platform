import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('deve carregar página inicial corretamente', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se o título está correto
    await expect(page).toHaveTitle(/FitCoach/i)
    
    // Verificar elementos principais da landing page
    await expect(page.getByRole('heading', { name: /fitcoach/i })).toBeVisible()
    
    // Verificar botões de navegação
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cadastrar/i })).toBeVisible()
  })

  test('deve navegar para formulário de login', async ({ page }) => {
    await page.goto('/')
    
    // Clicar no botão de entrar
    await page.getByRole('button', { name: /entrar/i }).click()
    
    // Verificar se o formulário de login apareceu
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible()
  })

  test('deve navegar para formulário de cadastro', async ({ page }) => {
    await page.goto('/')
    
    // Clicar no botão de cadastrar
    await page.getByRole('button', { name: /cadastrar/i }).click()
    
    // Verificar se o formulário de cadastro apareceu
    await expect(page.getByPlaceholder(/nome/i)).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible()
  })

  test('deve ser responsiva em dispositivos móveis', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Verificar se elementos estão visíveis em mobile
    await expect(page.getByRole('heading', { name: /fitcoach/i })).toBeVisible()
    
    // Verificar se o menu mobile funciona (se implementado)
    const mobileMenu = page.getByRole('button', { name: /menu/i })
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
    }
  })
})

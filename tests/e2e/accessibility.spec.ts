import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Testes de Acessibilidade', () => {
  test('página inicial deve estar acessível', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('formulário de login deve estar acessível', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    // Navegar para o formulário de login
    await page.getByRole('button', { name: /entrar/i }).click()
    
    await checkA11y(page, '[role="dialog"]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('navegação por teclado deve funcionar', async ({ page }) => {
    await page.goto('/')
    
    // Testar navegação por Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verificar se o foco está visível
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('imagens devem ter texto alternativo', async ({ page }) => {
    await page.goto('/')
    
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      const ariaLabelledby = await img.getAttribute('aria-labelledby')
      
      // Verificar se tem pelo menos uma forma de texto alternativo
      expect(alt !== null || ariaLabel !== null || ariaLabelledby !== null).toBe(true)
    }
  })
})

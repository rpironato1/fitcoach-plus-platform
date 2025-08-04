# 🧪 Guia de Testes - FitCoach Plus Platform

Este documento descreve a estratégia de testes implementada no projeto FitCoach Plus Platform.

## 📋 Visão Geral

O projeto utiliza uma abordagem de testes em múltiplas camadas:

- **Testes Unitários**: Vitest + Testing Library
- **Testes de Integração**: Vitest com mocks do Supabase
- **Testes E2E**: Playwright
- **Testes de Acessibilidade**: Playwright + axe-core
- **Análise de Qualidade**: TypeScript + ESLint

## 🛠️ Tecnologias

### Vitest
- **Framework**: Vitest 3.x
- **Testing Library**: @testing-library/react
- **Coverage**: v8 provider
- **Ambiente**: jsdom

### Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Chrome Mobile, Safari Mobile
- **Acessibilidade**: axe-playwright
- **Reports**: HTML, JUnit, JSON

## 📁 Estrutura de Arquivos

```
src/
├── test/
│   ├── setup.ts              # Configuração global de testes
│   └── test-utils.tsx         # Utilitários e providers para testes
├── **/*.test.{ts,tsx}         # Testes unitários
└── **/*.spec.{ts,tsx}         # Testes de integração

tests/
└── e2e/
    ├── *.spec.ts              # Testes E2E gerais
    └── *.accessibility.spec.ts # Testes de acessibilidade
```

## 🎯 Scripts Disponíveis

### Desenvolvimento
```bash
# Executar testes em modo watch
npm run test:watch

# Interface visual do Vitest
npm run test:ui
```

### CI/CD
```bash
# Verificação de tipos
npm run typecheck

# Todos os testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes de acessibilidade
npm run test:accessibility

# Executar todos os testes
npm run test:all
```

### Debug
```bash
# Debug do Playwright
npm run test:e2e:debug

# Interface do Playwright
npm run test:e2e:ui
```

## ✅ Boas Práticas

### Testes Unitários
- ✅ Use `describe` para agrupar testes relacionados
- ✅ Nomes descritivos em português
- ✅ Teste comportamentos, não implementação
- ✅ Use `screen.getByRole` em vez de `getByTestId`
- ✅ Mock serviços externos (Supabase)

### Testes E2E
- ✅ Foque em fluxos críticos do usuário
- ✅ Use seletores semânticos (`getByRole`, `getByLabel`)
- ✅ Teste em múltiplos browsers
- ✅ Inclua testes mobile
- ✅ Capture screenshots em falhas

### Acessibilidade
- ✅ Teste navegação por teclado
- ✅ Verifique contraste de cores
- ✅ Valide texto alternativo em imagens
- ✅ Teste com leitores de tela (simulado)

## 🎨 Exemplos de Testes

### Teste de Componente
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('deve executar onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clique</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Teste E2E
```typescript
import { test, expect } from '@playwright/test'

test('deve realizar login com sucesso', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /entrar/i }).click()
  
  await page.fill('[placeholder*="email"]', 'user@test.com')
  await page.fill('[placeholder*="senha"]', 'password123')
  await page.getByRole('button', { name: /entrar/i }).click()
  
  await expect(page.getByText(/dashboard/i)).toBeVisible()
})
```

### Teste de Acessibilidade
```typescript
import { test } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test('página deve estar acessível', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

## 📊 Métricas de Qualidade

### Coverage Mínimo
- **Statements**: 70%
- **Branches**: 70% 
- **Functions**: 70%
- **Lines**: 70%

### Estratégia por Tipo
- **Componentes UI**: 90%+ coverage
- **Hooks**: 85%+ coverage
- **Utilitários**: 95%+ coverage
- **Páginas**: Testes E2E principalmente

## 🚀 CI/CD Integration

O pipeline de CI/CD executa automaticamente:

1. **Qualidade**: TypeScript + ESLint
2. **Unitários**: Vitest com coverage
3. **E2E**: Playwright em múltiplos browsers
4. **Acessibilidade**: Testes axe-core
5. **Build**: Verificação de build

### GitHub Actions
- ✅ Execução paralela de jobs
- ✅ Cache de dependências
- ✅ Upload de relatórios
- ✅ Falha fast em erros críticos

## 🐛 Debugging

### Vitest
```bash
# Debug com breakpoints
npm run test:watch -- --reporter=verbose

# UI mode para investigação
npm run test:ui
```

### Playwright
```bash
# Modo debug com browser visível
npm run test:e2e:debug

# Screenshots de falhas automáticas
# Vídeos em caso de retry
```

## 🔧 Configurações

### Vitest (`vitest.config.ts`)
- Ambiente jsdom
- Setup automático com mocks
- Coverage com v8
- Thresholds configurados

### Playwright (`playwright.config.ts`)
- Múltiplos browsers e dispositivos
- Base URL configurável
- Relatórios detalhados
- WebServer automático

## 📝 Manutenção

### Atualizações
- Revisar dependencies mensalmente
- Atualizar snapshots quando necessário
- Monitorar flaky tests
- Ajustar thresholds de coverage conforme projeto cresce

### Monitoramento
- Coverage trends
- Test execution time
- Flaky test detection
- Browser compatibility

---

## 🎯 Próximos Passos

1. **Implementar testes RLS** para políticas do Supabase
2. **Testes de performance** com Lighthouse CI
3. **Testes de carga** com k6
4. **Testes de segurança** com OWASP ZAP
5. **Visual regression tests** com Playwright

Para mais informações, consulte a documentação oficial:
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

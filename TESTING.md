# 🧪 Guia de Testes - FitCoach Plus Platform

Este documento descreve a estratégia de testes implementada no projeto FitCoach Plus Platform.

## 📋 Visão Geral

O projeto utiliza uma abordagem de testes focada em qualidade de código:

- **Testes Unitários**: Vitest + Testing Library
- **Testes de Integração**: Vitest com mocks do Supabase
- **Análise de Qualidade**: TypeScript + ESLint

## 🛠️ Tecnologias

### Vitest

- **Framework**: Vitest 3.x
- **Testing Library**: @testing-library/react
- **Coverage**: v8 provider
- **Ambiente**: jsdom

## 📁 Estrutura de Arquivos

```
src/
├── test/
│   ├── setup.ts              # Configuração global de testes
│   └── test-utils.tsx         # Utilitários e providers para testes
├── **/*.test.{ts,tsx}         # Testes unitários
└── **/*.spec.{ts,tsx}         # Testes de integração
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

# Executar todos os testes
npm run test:all
```

## ✅ Boas Práticas

### Testes Unitários

- ✅ Use `describe` para agrupar testes relacionados
- ✅ Nomes descritivos em português
- ✅ Teste comportamentos, não implementação
- ✅ Use `screen.getByRole` em vez de `getByTestId`
- ✅ Mock serviços externos (Supabase)

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
3. **Build**: Verificação de build

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

## 🔧 Configurações

### Vitest (`vitest.config.ts`)

- Ambiente jsdom
- Setup automático com mocks
- Coverage com v8
- Thresholds configurados

## 📝 Manutenção

### Atualizações

- Revisar dependencies mensalmente
- Atualizar snapshots quando necessário
- Monitorar flaky tests
- Ajustar thresholds de coverage conforme projeto cresce

### Monitoramento

- Coverage trends
- Test execution time
- Unit test reliability

---

## 🎯 Próximos Passos

1. **Implementar testes RLS** para políticas do Supabase
2. **Testes de performance** com Lighthouse CI
3. **Testes de carga** com k6
4. **Testes de segurança** com OWASP ZAP

Para mais informações, consulte a documentação oficial:

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

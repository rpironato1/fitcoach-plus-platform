# CLAUDE.md

Este arquivo fornece orientação ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Stack Tecnológica Principal

- **Frontend:** React 18 + TypeScript + Vite 5
- **UI Framework:** shadcn/ui + Tailwind CSS + Radix UI
- **Backend:** Supabase (Auth, Database)
- **Estado:** TanStack Query (React Query)
- **Roteamento:** React Router DOM
- **Testes:** Vitest, Playwright, Testing Library
- **Documentação:** Storybook
- **Análise:** Lighthouse, ESLint

## Comandos de Desenvolvimento

### Desenvolvimento Local

```bash
npm run dev          # Inicia servidor dev na porta 8030
npm run dev:open     # Inicia servidor e abre no navegador
npm run preview      # Preview build de produção na porta 8031
```

### Build e Análise

```bash
npm run build        # Build de produção
npm run build:dev    # Build modo desenvolvimento
npm run build:analyze # Build + análise de bundle
```

### Testes

```bash
# Testes unitários/integração (Vitest)
npm run test         # Executa todos os testes
npm run test:watch   # Modo watch
npm run test:ui      # Interface visual (porta 8033)
npm run test:coverage # Com coverage

# Testes E2E (Playwright)
npm run test:e2e     # Todos os testes E2E
npm run test:e2e:ui  # Interface visual (porta 8035)
npm run test:e2e:essential # Testes essenciais
npm run test:e2e:smoke     # Smoke tests
npm run test:screenshots   # Testes de screenshots

# Testes de Performance/Acessibilidade (Lighthouse)
npm run lighthouse:all         # Todos os audits
npm run lighthouse:accessibility # Apenas acessibilidade
npm run lighthouse:performance   # Apenas performance

# Testes especializados
npm run test:rls    # Row Level Security (PostgreSQL)
npm run test:load   # Testes de carga (k6)
npm run test:stress # Testes de stress (k6)
```

### Storybook

```bash
npm run storybook       # Servidor Storybook (porta 6006)
npm run build-storybook # Build para produção
```

## Arquitetura do Código

### Estrutura Modular

O projeto utiliza uma **arquitetura modular** com injeção de dependências:

```
src/
├── core/               # Sistema de DI e setup
├── modules/           # Módulos de domínio
│   ├── ai/           # Serviços de IA
│   ├── auth/         # Autenticação
│   ├── payments/     # Pagamentos
│   ├── security/     # Segurança
│   ├── ui/           # Componentes UI
│   └── workouts/     # Treinos
├── components/        # Componentes por domínio
│   ├── admin/        # Painel administrativo
│   ├── auth/         # Formulários de auth
│   ├── trainer/      # Funcionalidades trainer
│   └── ui/           # shadcn/ui components
├── pages/            # Componentes de página
├── hooks/            # Custom hooks
└── services/         # Serviços utilitários
```

### Padrão de Módulos

Cada módulo contém:

- `hooks/` - Custom hooks específicos
- `services/` - Classes de serviço
- `types/` - Definições TypeScript
- `utils/` - Utilitários
- `components/` - Componentes específicos

### Sistema de Autenticação

- **Adaptativo**: Supabase Auth + LocalStorage para demo
- **Roles**: admin, trainer, student
- **Proteção de rotas** via `ProtectedRoute`
- **Credenciais de teste**:
  - Admin: admin@fitcoach.com / admin123
  - Trainer: trainer@fitcoach.com / trainer123
  - Student: student@fitcoach.com / student123

### Roteamento

- `/` - Landing page pública
- `/admin/*` - Painel administrativo
- `/trainer/*` - Dashboard do trainer
- `/student/*` - Dashboard do student
- `/student-demo` - Demo sem autenticação
- `/localStorage-manager` - Gerenciamento de dados demo

## Padrões de Desenvolvimento

### Componentes UI

- **shadcn/ui** para componentes base
- **Variants** usando `class-variance-authority`
- **Stories** obrigatórias para novos componentes
- **Testes** com Testing Library

### Gerenciamento de Estado

- **TanStack Query** para estado do servidor
- **React Context** para estado de autenticação
- **LocalStorage** para dados de demonstração

### Estilo e CSS

- **Tailwind CSS** como framework principal
- **CSS Modules** para estilos específicos
- **Design tokens** através de classes Tailwind
- **Responsividade** mobile-first

### Configurações de Build

- **Otimizações**: Chunks separados por vendor
- **Compressão**: Terser para produção
- **Assets**: Otimização automática de imagens
- **Análise**: Bundle analyzer integrado

## Dados de Demonstração

O sistema inclui **DataSourceManager** para alternar entre:

- **Supabase**: Dados reais de produção
- **LocalStorage**: Dados simulados para demo
  - Dados completos: Dataset completo
  - Dados mínimos: Dataset reduzido
  - Dados vazios: Estados vazios

## Testing Strategy

1. **Unit/Integration**: Vitest + Testing Library
2. **E2E**: Playwright com multiple browsers
3. **Visual**: Screenshot testing
4. **Performance**: Lighthouse automation
5. **Accessibility**: axe-core + Lighthouse
6. **Security**: RLS testing com PostgreSQL

## Deployment

- **Build otimizado**: `npm run build`
- **Preview local**: `npm run preview`
- **Platform**: Lovable.dev deployment
- **Custom domain**: Suportado via projeto settings

## Notas Importantes

- **Portas fixas**: Dev:8030, Preview:8031, Storybook:6006
- **Path aliases**: `@/` aponta para `./src`
- **TypeScript strict**: Configuração rigorosa habilitada
- **Hot reload**: SWC para compilação rápida
- **Bundle analysis**: Automático em builds de análise

# FitCoach Plus Platform - Guia de Desenvolvimento

## 📋 Visão Geral

A FitCoach Plus Platform é uma aplicação React moderna construída com arquitetura modular, utilizando **Dependency Injection**, **TypeScript** e uma separação clara de responsabilidades. Este guia explica como a modularização está implementada, como os módulos se comunicam e como configurar o ambiente de desenvolvimento local.

## 🏗️ Arquitetura Modular

### 1. Core Module (`src/core/`)

O módulo core é o coração da aplicação, responsável pela infraestrutura e configuração dos serviços.

#### Container de Injeção de Dependência
```typescript
// src/core/container/Container.ts
class DIContainer implements Container {
  bind<T>(token: string): BindingBuilder<T>
  resolve<T>(token: string): T
  register<T>(token: string, binding: ServiceBinding<T>): void
}
```

**Características:**
- **Singleton Pattern**: Instância única do container
- **Service Lifetimes**: Suporte a Transient e Singleton
- **Type Safety**: Completamente tipado com TypeScript
- **Factory Support**: Registro via construtores, factories ou valores

#### Setup de Módulos
```typescript
// src/core/setup.ts
export function setupModules() {
  // Auth module
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
  
  // Workouts module
  container.bind('WorkoutService').to(SupabaseWorkoutService);
  
  // Payments module
  container.bind('PaymentService').to(StripePaymentService);
  
  // AI module
  container.bind('AIService').to(OpenAIService);
  
  // Security module
  container.bind('SecurityService').to(SupabaseSecurityService);
}
```

### 2. Feature Modules (`src/modules/`)

Cada módulo segue uma estrutura consistente:

```
src/modules/{module}/
├── components/     # Componentes específicos do módulo
├── hooks/         # Custom hooks do módulo
├── services/      # Serviços e lógica de negócio
├── types/         # Tipos TypeScript
├── utils/         # Utilitários específicos
└── index.ts       # API pública do módulo
```

#### Módulo de Autenticação (`auth/`)
```typescript
// src/modules/auth/index.ts
export { AuthProvider, useAuth } from './components/AuthProvider';
export { SupabaseAuthService } from './services/AuthService';
export type { AuthService, Profile } from './types';
```

**Responsabilidades:**
- Gerenciamento de sessões
- Autenticação/autorização
- Perfis de usuário
- Proteção de rotas

#### Módulo de Treinos (`workouts/`)
```typescript
// src/modules/workouts/index.ts
export { useExercises, useWorkoutPlans } from './hooks/useWorkouts';
export { SupabaseWorkoutService } from './services/WorkoutService';
export type { Exercise, WorkoutPlan } from './types';
```

**Responsabilidades:**
- Gerenciamento de exercícios
- Planos de treino
- Sessões de treino
- Validações de treino

#### Módulo de Pagamentos (`payments/`)
**Responsabilidades:**
- Integração com Stripe
- Processamento de pagamentos
- Gerenciamento de assinaturas

#### Módulo de IA (`ai/`)
**Responsabilidades:**
- Integração com OpenAI
- Geração de conteúdo
- Recomendações inteligentes

#### Módulo de Segurança (`security/`)
**Responsabilidades:**
- Políticas de segurança
- Auditoria
- Rate limiting

### 3. Components Layer (`src/components/`)

Organização hierárquica de componentes:

```
src/components/
├── admin/         # Componentes administrativos
├── auth/          # Componentes de autenticação
├── landing/       # Landing page
├── layout/        # Layout principal
├── trainer/       # Componentes do trainer
├── ui/           # Componentes reutilizáveis (shadcn/ui)
└── workouts/     # Componentes de treino
```

### 4. Services Layer (`src/services/`)

Serviços transversais não específicos de módulos:
- `localStorageService.ts`: Gerenciamento de armazenamento local

### 5. Infrastructure (`src/integrations/`)

Integrações com serviços externos:
```
src/integrations/
└── supabase/
    ├── client.ts    # Cliente Supabase configurado
    └── types.ts     # Tipos gerados do banco
```

## 🔄 Comunicação Entre Módulos

### 1. Dependency Injection

**Registro de Serviços:**
```typescript
// Durante a inicialização da aplicação
setupModules(); // Registra todos os serviços no container
```

**Resolução de Dependências:**
```typescript
// Em qualquer parte da aplicação
const authService = container.resolve<AuthService>('AuthService');
const workoutService = container.resolve<WorkoutService>('WorkoutService');
```

### 2. React Context

**AuthProvider para Estado Global:**
```typescript
// src/modules/auth/components/AuthProvider.tsx
const AuthProvider = ({ children }) => {
  // Gerencia estado de autenticação globalmente
  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. React Query

**Cache e Sincronização de Estado:**
```typescript
// Hooks customizados para dados
const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutService.getWorkouts()
  });
};
```

### 4. React Router

**Roteamento Modular:**
```typescript
// src/App.tsx
<Routes>
  <Route path="/admin" element={<AdminRoutes />}>
    <Route path="trainers" element={<TrainersManagement />} />
  </Route>
  <Route path="/trainer" element={<TrainerRoutes />}>
    <Route path="workouts" element={<WorkoutsPage />} />
  </Route>
</Routes>
```

## 🚀 Configuração para Desenvolvimento Local

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Supabase CLI** (opcional, para desenvolvimento backend)

### 1. Instalação das Dependências

```bash
# Clone o repositório
git clone <repository-url>
cd fitcoach-plus-platform

# Instale as dependências
npm install
```

### 2. Configuração de Portas (8030-8040)

Edite o arquivo `vite.config.ts` para usar a faixa de portas especificada:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8030, // Porta principal
  },
  preview: {
    port: 8031, // Porta para preview
  },
  // ...
});
```

### 3. Configuração de Ambiente

Crie um arquivo `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://coscoqsrnizvilxbubvq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe Configuration (opcional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# OpenAI Configuration (opcional)
VITE_OPENAI_API_KEY=your_openai_key
```

### 4. Scripts de Desenvolvimento

```bash
# Servidor de desenvolvimento (porta 8030)
npm run dev

# Build de desenvolvimento
npm run build:dev

# Preview da build (porta 8031)
npm run preview

# Testes com watch mode
npm run test:watch

# Interface de testes (porta 8032)
npm run test:ui

# Linting
npm run lint

# Type checking
npm run typecheck
```

### 5. Portas Utilizadas

| Serviço | Porta | Comando | Descrição |
|---------|-------|---------|-----------|
| **Desenvolvimento** | 8030 | `npm run dev` | Servidor principal de desenvolvimento |
| **Preview** | 8031 | `npm run preview` | Preview da build de produção |
| **Test UI** | 8032 | `npm run test:ui` | Interface dos testes Vitest |
| **Storybook** | 8033 | `npm run storybook` | Documentação de componentes (se configurado) |
| **Supabase Local** | 8034 | `supabase start` | Banco local (se usando Supabase CLI) |

### 6. Desenvolvimento com Hot Reload

O servidor de desenvolvimento suporta:
- **Hot Module Replacement (HMR)**
- **Automatic type checking**
- **ESLint integration**
- **Tailwind CSS compilation**

### 7. Estrutura de Teste

```bash
# Executar todos os testes
npm run test

# Testes com cobertura
npm run test:coverage

# Testes de performance/load (porta 8035)
npm run test:load

# Testes de stress (porta 8036)
npm run test:stress
```

## 🔧 Configurações Avançadas

### Desenvolvimento Multi-Módulo

Para trabalhar em módulos específicos:

```bash
# Focar no módulo de autenticação
npm run dev -- --filter=auth

# Focar no módulo de treinos
npm run dev -- --filter=workouts
```

### Debug Configuration

Para debug com VS Code, configure o `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug FitCoach",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vite/bin/vite.js",
      "args": ["--port", "8030"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Proxy Configuration

Para desenvolvimento com backend local:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8037',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

## 📦 Build e Deploy

### Build de Produção

```bash
# Build otimizada
npm run build

# Preview da build
npm run preview
```

### Verificações Pré-Deploy

```bash
# Executar todas as verificações
npm run test:all

# Inclui:
# - Type checking
# - Testes unitários
# - Cobertura de código
# - Linting
```

## 🤝 Contribuição

### Adicionando Novos Módulos

1. **Criar estrutura do módulo:**
```bash
mkdir src/modules/new-module
mkdir src/modules/new-module/{components,hooks,services,types,utils}
touch src/modules/new-module/index.ts
```

2. **Implementar serviços:**
```typescript
// src/modules/new-module/services/NewService.ts
export class NewService {
  // Implementação
}
```

3. **Registrar no DI container:**
```typescript
// src/core/setup.ts
container.bind('NewService').to(NewService);
```

4. **Exportar API pública:**
```typescript
// src/modules/new-module/index.ts
export { NewService } from './services/NewService';
export type { NewServiceInterface } from './types';
```

### Convenções de Código

- **PascalCase** para componentes e classes
- **camelCase** para funções e variáveis
- **kebab-case** para arquivos
- **UPPER_CASE** para constantes
- Prefixo `I` para interfaces quando necessário

## 📚 Recursos Adicionais

- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

**Última atualização:** Janeiro 2025  
**Versão da documentação:** 1.0
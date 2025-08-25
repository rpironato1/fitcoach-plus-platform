# 🏗️ FitCoach Plus Platform - Guia de Modularização e Desenvolvimento

## 📋 Índice
- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Sistema de Módulos](#-sistema-de-módulos)
- [Comunicação Entre Módulos](#-comunicação-entre-módulos)
- [Configuração para Desenvolvimento Local](#-configuração-para-desenvolvimento-local)
- [Estrutura de Portas](#-estrutura-de-portas)
- [Comandos de Desenvolvimento](#-comandos-de-desenvolvimento)
- [Sistema de Testes](#-sistema-de-testes)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral da Arquitetura

O FitCoach Plus Platform utiliza uma arquitetura modular avançada baseada em **Dependency Injection** e **Clean Architecture**, proporcionando:

- ✅ **Modularidade**: Código organizado em módulos independentes
- ✅ **Escalabilidade**: Fácil adição de novos recursos e módulos
- ✅ **Testabilidade**: Módulos isolados e facilmente testáveis  
- ✅ **Manutenibilidade**: Separação clara de responsabilidades
- ✅ **Flexibilidade**: Troca fácil de implementações (Supabase ↔ LocalStorage)

### Stack Tecnológica Principal
```typescript
Frontend: React 18 + TypeScript + Vite
UI/UX: RadixUI + ShadCN + TailwindCSS (ReactBits)
Backend: Supabase + Edge Functions
Estado: TanStack Query + React Context  
Roteamento: React Router v6 + Role-Based Protection
DI Container: Custom TypeScript Implementation
Testes: Vitest + Playwright + Testing Library
```

---

## 🧩 Sistema de Módulos

### Estrutura de Diretórios

```
src/
├── core/                   # 🔧 Sistema Central
│   ├── container/          # Dependency Injection Container
│   ├── setup.ts           # Inicialização dos módulos
│   └── index.ts           # Exportações centrais
│
├── modules/                # 📦 Módulos de Negócio
│   ├── auth/              # 🔐 Autenticação & Usuários
│   ├── ai/                # 🤖 Inteligência Artificial
│   ├── payments/          # 💳 Pagamentos & Assinaturas
│   ├── security/          # 🛡️ Segurança & Auditoria
│   ├── ui/                # 🎨 Componentes UI
│   └── workouts/          # 💪 Treinos & Exercícios
│
├── integrations/          # 🔌 Integrações Externas
│   └── supabase/          # Supabase Client & Types
│
├── components/            # 🧱 Componentes Compartilhados
├── pages/                 # 📄 Páginas da Aplicação
├── services/              # ⚙️ Serviços da Aplicação
├── hooks/                 # 🪝 Custom React Hooks
└── utils/                 # 🛠️ Utilitários
```

### Anatomia de um Módulo

Cada módulo segue a mesma estrutura padrão:

```
modules/[module-name]/
├── components/            # Componentes React específicos
├── hooks/                 # Hooks específicos do módulo
├── services/              # Lógica de negócio e integração
├── types/                 # TypeScript interfaces
├── utils/                 # Utilitários específicos
└── index.ts              # Exports públicos + setup
```

#### Exemplo: Módulo de Autenticação
```typescript
// modules/auth/index.ts
export { AuthProvider, useAuth } from './components/AuthProvider';
export { LoginForm, RegisterForm } from './components/';
export { SupabaseAuthService } from './services/AuthService';
export type { AuthService, Profile } from './types';

// Setup function para DI Container
export async function setupAuthModule() {
  const { container } = await import('@/core');
  const { SupabaseAuthService } = await import('./services/AuthService');
  
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
}
```

---

## 🔄 Comunicação Entre Módulos

### 1. Dependency Injection Container

O coração da comunicação entre módulos é o **DI Container customizado**:

```typescript
// core/container/Container.ts
class DIContainer implements Container {
  private bindings = new Map<string, ServiceBinding>();

  bind<T>(token: string): BindingBuilder<T> {
    return new DIBindingBuilder<T>(this, token);
  }

  resolve<T>(token: string): T {
    // Resolve dependências automaticamente
  }
}
```

#### Registro de Serviços
```typescript
// core/setup.ts
export function setupModules() {
  // Módulo Auth
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
  
  // Módulo Workouts  
  container.bind('WorkoutService').to(SupabaseWorkoutService);
  
  // Módulo Payments
  container.bind('PaymentService').to(StripePaymentService);
  
  // Módulo AI
  container.bind('AIService').to(OpenAIService);
}
```

#### Uso de Serviços
```typescript
// Em qualquer componente ou serviço
import { container } from '@/core';

const authService = container.resolve<AuthService>('AuthService');
const paymentService = container.resolve<PaymentService>('PaymentService');
```

### 2. React Context + Custom Hooks

Para estado reativo e comunicação com UI:

```typescript
// Contexto Global de Autenticação
export const AdaptiveAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Lógica adaptativa: LocalStorage vs Supabase
  const authService = useMemo(() => {
    return isLocalStorageMode() 
      ? new LocalStorageAuthService()
      : container.resolve<AuthService>('AuthService');
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, authService }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Event Bus Pattern (Para comunicação assíncrona)

```typescript
// utils/eventBus.ts
class EventBus {
  private listeners = new Map<string, Function[]>();
  
  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
  
  on(event: string, callback: Function) {
    // Adiciona listener
  }
}

export const eventBus = new EventBus();
```

### 4. TanStack Query para Cache Compartilhado

```typescript
// Queries compartilhadas entre módulos
export const userQueries = {
  profile: (userId: string) => ({
    queryKey: ['user', 'profile', userId],
    queryFn: () => container.resolve<ProfileService>('ProfileService').getProfile(userId)
  }),
  
  workouts: (userId: string) => ({
    queryKey: ['user', 'workouts', userId], 
    queryFn: () => container.resolve<WorkoutService>('WorkoutService').getUserWorkouts(userId)
  })
};
```

---

## 💻 Configuração para Desenvolvimento Local

### Pré-requisitos

```bash
# Node.js 18+ (recomendado 20+)
node --version  # >= 18.0.0

# npm ou yarn
npm --version   # >= 8.0.0

# Git
git --version  # >= 2.25.0
```

### 1. Clone e Instalação

```bash
# Clone do repositório
git clone https://github.com/rpironato1/fitcoach-plus-platform.git
cd fitcoach-plus-platform

# Instalação das dependências
npm install

# Ou usando yarn
yarn install
```

### 2. Configuração de Ambiente

O projeto funciona em **dois modos**:

#### Modo 1: LocalStorage (Desenvolvimento/Demo)
```bash
# Nenhuma configuração adicional necessária
# O sistema detecta automaticamente e usa localStorage
npm run dev
```

#### Modo 2: Supabase (Produção)
```bash
# Configure as variáveis de ambiente (se necessário)
# O projeto já vem com credenciais de desenvolvimento configuradas
echo "VITE_SUPABASE_URL=https://coscoqsrnizvilxbubvq.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs..." >> .env.local
```

### 3. Verificação da Instalação

```bash
# Verifica se tudo está funcionando
npm run typecheck  # Verifica TypeScript
npm run lint       # Verifica código  
npm run test       # Executa testes
npm run build      # Testa build de produção
```

---

## 🌐 Estrutura de Portas

Para evitar conflitos de desenvolvimento, o projeto está configurado para usar a faixa de portas **8030-8040**:

### Configuração Atual (Vite)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 8030,        // ⚠️ Alterado de 8080 para 8030
    open: true,        // Abre automaticamente no navegador
    strictPort: true,  // Falha se a porta não estiver disponível
  },
  preview: {
    port: 8031,       // Porta para preview de build
    host: "::",
    strictPort: true,
  }
});
```

### Mapeamento de Portas Recomendado

| Serviço | Porta | Descrição |
|---------|--------|-----------|
| **Frontend Dev** | `8030` | Servidor de desenvolvimento Vite |
| **Preview Build** | `8031` | Preview da build de produção |
| **Storybook** | `8032` | Documentação de componentes |
| **Test UI** | `8033` | Interface de testes Vitest |
| **Backend Local** | `8034` | Supabase local (se usar) |
| **Playwright UI** | `8035` | Interface do Playwright |
| **Reserved 1** | `8036` | Serviços extras |
| **Reserved 2** | `8037` | Microserviços |
| **Reserved 3** | `8038` | Ferramentas de dev |
| **Reserved 4** | `8039` | Debug/profiling |
| **Reserved 5** | `8040` | Backup/contingência |

### Scripts com Portas Configuradas

```json
{
  "scripts": {
    "dev": "vite --port 8030",
    "dev:open": "vite --port 8030 --open",
    "preview": "vite preview --port 8031",
    "test:ui": "vitest --ui --port 8033",
    "test:e2e:ui": "playwright test --ui-port=8035",
    "storybook": "storybook dev -p 8032",
    "supabase:start": "supabase start --port-offset=4",
  }
}
```

---

## ⚡ Comandos de Desenvolvimento

### Desenvolvimento Básico
```bash
# Inicia servidor de desenvolvimento (porta 8030)
npm run dev

# Inicia e abre automaticamente no navegador  
npm run dev:open

# Build de produção
npm run build

# Preview da build (porta 8031)
npm run preview
```

### Testes e Qualidade
```bash
# Testes unitários
npm run test                # Execução única
npm run test:watch          # Modo watch
npm run test:ui             # Interface gráfica (porta 8033)
npm run test:coverage       # Com coverage

# Testes E2E
npm run test:e2e           # Execução headless
npm run test:e2e:ui        # Interface gráfica (porta 8035)

# Qualidade de código
npm run lint               # ESLint
npm run typecheck          # TypeScript
npm run test:all           # Todos os testes
```

### Ferramentas de Desenvolvimento
```bash
# Interface de gerenciamento LocalStorage
# Acesse: http://localhost:8030/localStorage-manager

# Console do navegador (F12) - Automação
fitcoachLocalStorageDemo.help()           # Lista comandos
fitcoachLocalStorageDemo.enableLocalStorage()  # Ativa modo localStorage
fitcoachLocalStorageDemo.loginAsAdmin()        # Login como admin
fitcoachLocalStorageDemo.loginAsTrainer()      # Login como trainer
fitcoachLocalStorageDemo.loginAsStudent()      # Login como student
```

### Modo LocalStorage vs Supabase

#### Ativar Modo LocalStorage (Desenvolvimento)
```javascript
// No console do navegador (F12)
fitcoachLocalStorageDemo.enableLocalStorage();

// Ou programaticamente
import { localStorageService } from '@/services/localStorageService';
localStorageService.enableLocalStorageMode();
```

#### Ativar Modo Supabase (Produção)
```javascript
// No console do navegador (F12) 
fitcoachLocalStorageDemo.disableLocalStorage();

// Ou programaticamente
localStorageService.disableLocalStorageMode();
```

---

## 🧪 Sistema de Testes

### Estrutura de Testes
```
tests/
├── e2e/                   # Testes End-to-End (Playwright)
├── unit/                  # Testes Unitários (Vitest)
├── integration/           # Testes de Integração
└── fixtures/              # Dados de teste
```

### Configuração dos Testes

#### Vitest (Testes Unitários)
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

#### Playwright (Testes E2E)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 8030,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: 'http://localhost:8030'
  }
});
```

### Executando Testes

```bash
# Testes unitários
npm run test               # Todos os testes
npm run test:coverage      # Com relatório de coverage
npm run test:watch         # Modo watch para desenvolvimento

# Testes E2E  
npm run test:e2e           # Headless
npm run test:e2e:headed    # Com interface gráfica
npm run test:e2e:debug     # Modo debug

# Interface gráfica dos testes
npm run test:ui            # Vitest UI (porta 8033)
npm run test:e2e:ui        # Playwright UI (porta 8035)
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso
```bash
# Erro: EADDRINUSE :::8030
# Solução: Matar processo na porta
npx kill-port 8030

# Ou usar porta alternativa
npm run dev -- --port 8031
```

#### 2. Dependências desatualizadas
```bash
# Verificar dependências
npm outdated

# Atualizar dependências
npm update

# Ou reinstalar tudo
rm -rf node_modules package-lock.json
npm install
```

#### 3. Erro de TypeScript
```bash
# Verificar erros de tipo
npm run typecheck

# Regenerar tipos do Supabase (se necessário)
npx supabase gen types typescript --project-id coscoqsrnizvilxbubvq > src/integrations/supabase/types.ts
```

#### 4. Problemas com LocalStorage
```bash
# Limpar dados do localStorage
# No console do navegador (F12):
localStorage.clear()
sessionStorage.clear()

# Ou usar a ferramenta:
fitcoachLocalStorageDemo.clearAllData()
```

#### 5. Build falha
```bash
# Verificar problemas de build
npm run build 2>&1 | tee build.log

# Verificar tamanho do bundle
npm run build:analyze
```

### Scripts de Diagnóstico

```bash
# Verifica tudo
npm run test:all

# Diagnóstico completo
npm run typecheck && npm run lint && npm run test && npm run build
```

### Logs e Debug

```typescript
// Ativar logs detalhados
localStorage.setItem('DEBUG', 'fitcoach:*');

// Debug específico  
localStorage.setItem('DEBUG', 'fitcoach:auth,fitcoach:payments');

// Ver logs no console
console.log('Debug ativo:', localStorage.getItem('DEBUG'));
```

---

## 📞 Suporte e Documentação Adicional

### Recursos Adicionais
- 📄 **README.md** - Visão geral do projeto
- 📊 **RELATORIO-FINAL-PROJETO.md** - Status completo do desenvolvimento
- 🧪 **TESTING.md** - Guia de testes detalhado
- 🗄️ **LOCALSTORAGE_IMPLEMENTATION.md** - Sistema localStorage

### Comandos Úteis para Desenvolvimento

```bash
# Análise do projeto
npm run analyze            # Análise do bundle
npm run audit              # Auditoria de segurança
npm run outdated          # Dependências desatualizadas

# Documentação
npm run docs:build        # Gerar documentação
npm run storybook         # Documentação de componentes

# Qualidade
npm run format            # Formatar código
npm run lint:fix          # Corrigir problemas de lint
npm run clean             # Limpeza geral
```

---

## 🚀 Próximos Passos

1. **Configure sua IDE** com as extensões recomendadas (ESLint, TypeScript, Tailwind)
2. **Execute os testes** para garantir que tudo está funcionando
3. **Explore o código** começando pelos módulos em `src/modules/`
4. **Use as ferramentas de desenvolvimento** como LocalStorage Manager
5. **Contribua** seguindo os padrões estabelecidos na arquitetura

---

**🎉 Pronto! Agora você pode desenvolver na plataforma FitCoach Plus com total compreensão da arquitetura modular.**

Para qualquer dúvida, consulte os arquivos de documentação ou execute os comandos de diagnóstico listados acima.
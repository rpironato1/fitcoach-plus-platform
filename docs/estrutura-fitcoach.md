# Estrutura e Análise do Projeto: FitCoach Plus Platform

Este documento detalha a estrutura completa do projeto `fitcoach-plus-platform`, fornecendo uma visão geral da arquitetura, tecnologias, organização de arquivos e o propósito de cada componente principal.

## 1. Visão Geral do Projeto

- **Nome:** FitCoach Plus Platform
- **Descrição:** Uma aplicação web moderna (SPA - Single Page Application) projetada para conectar personal trainers e seus alunos. A plataforma permite que treinadores gerenciem alunos, planos de dieta e agendamentos. Possui também um painel administrativo para gerenciamento geral.
- **Objetivo:** Oferecer uma ferramenta centralizada e eficiente para a gestão de atividades de fitness, melhorando a interação e o acompanhamento entre treinador e aluno.

## 2. Tecnologias e Linguagens

- **Frontend:**
  - **Framework:** React (com TypeScript)
  - **Build Tool:** Vite
  - **Linguagens:** TypeScript, CSS3, HTML5
- **Estilização:**
  - **Framework CSS:** Tailwind CSS
  - **Componentes UI:** Shadcn/UI (uma coleção de componentes reutilizáveis construídos sobre Radix UI e Tailwind CSS).
- **Backend & Banco de Dados:**
  - **Serviço:** Supabase (usado como Backend-as-a-Service, fornecendo banco de dados, autenticação e APIs).
  - **Linguagem (Banco de Dados):** SQL (PostgreSQL)
- **Gerenciamento de Pacotes:**
  - **Gerenciador:** Bun / NPM

## 3. Estrutura Detalhada de Arquivos e Diretórios

A seguir, uma descrição detalhada dos principais arquivos e diretórios do projeto.

---

### 📁 `.` (Diretório Raiz)

Contém arquivos de configuração globais, metadados do projeto e a documentação.

| Arquivo/Pasta            | O que é                    | O que faz                                                        | Benefícios                                            | Linguagem/Formato |
| :----------------------- | :------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------- | :---------------- |
| **`package.json`**       | Manifesto do projeto       | Lista dependências, scripts (build, dev, lint) e metadados.      | Centraliza o gerenciamento do projeto.                | JSON              |
| **`vite.config.ts`**     | Configuração do Vite       | Define como o projeto é compilado e servido em desenvolvimento.  | Build rápido, HMR (Hot Module Replacement) eficiente. | TypeScript        |
| **`tailwind.config.ts`** | Configuração do Tailwind   | Customiza o framework CSS, como temas, cores e plugins.          | Estilização consistente e rápida.                     | TypeScript        |
| **`tsconfig.json`**      | Configuração do TypeScript | Define as regras e opções para o compilador TypeScript.          | Garante a tipagem e a qualidade do código.            | JSON              |
| **`eslint.config.js`**   | Configuração do ESLint     | Define regras de linting para manter a consistência do código.   | Padronização e prevenção de erros.                    | JavaScript        |
| **`index.html`**         | Ponto de Entrada HTML      | É a página principal onde a aplicação React é montada.           | Base da SPA.                                          | HTML              |
| **`GEMINI.md`**          | Contexto do Agente         | Fornece diretrizes para a IA sobre como interagir com o projeto. | Automatiza e padroniza o desenvolvimento.             | Markdown          |

---

### 📁 `src/`

O coração da aplicação. Contém todo o código-fonte da interface do usuário.

| Arquivo/Pasta   | O que é                | O que faz                                                               | Benefícios                                    | Linguagem/Formato |
| :-------------- | :--------------------- | :---------------------------------------------------------------------- | :-------------------------------------------- | :---------------- |
| **`main.tsx`**  | Ponto de Entrada React | Renderiza o componente principal (`App`) na `div#root` do `index.html`. | Inicializa a aplicação React.                 | TypeScript (TSX)  |
| **`App.tsx`**   | Componente Raiz        | Define a estrutura principal da aplicação, incluindo o roteamento.      | Organiza as principais visualizações e rotas. | TypeScript (TSX)  |
| **`index.css`** | Estilos Globais        | Contém estilos CSS aplicados a toda a aplicação.                        | Estilização base e reset.                     | CSS               |

---

### 📁 `src/components/`

Diretório de componentes React reutilizáveis, organizados por funcionalidade.

| Subpasta       | O que é                         | O que faz                                                              | Benefícios                                         |
| :------------- | :------------------------------ | :--------------------------------------------------------------------- | :------------------------------------------------- |
| **`ui/`**      | Componentes de UI Base          | Contém componentes genéricos (Button, Card, Input, etc.) do Shadcn/UI. | Reutilização, consistência visual, acessibilidade. |
| **`auth/`**    | Componentes de Autenticação     | Contém formulários de login, registro e lógica de proteção de rotas.   | Centraliza a lógica de autenticação.               |
| **`admin/`**   | Componentes do Painel Admin     | Peças de UI específicas para a interface do administrador.             | Modularidade da área de administração.             |
| **`trainer/`** | Componentes do Painel Treinador | Peças de UI específicas para a interface do treinador.                 | Modularidade da área do treinador.                 |
| **`layout/`**  | Componentes de Layout           | Estruturas de página, como a barra de navegação (`Navbar`).            | Consistência no layout entre as páginas.           |
| **`landing/`** | Componentes da Landing Page     | Seções e elementos da página inicial de apresentação.                  | Organização do conteúdo de marketing/entrada.      |

---

### 📁 `src/pages/`

Componentes que representam páginas completas da aplicação, geralmente associados a uma rota.

| Subpasta           | O que é                  | O que faz                                                                     | Benefícios                                     |
| :----------------- | :----------------------- | :---------------------------------------------------------------------------- | :--------------------------------------------- |
| **`admin/`**       | Páginas do Administrador | Telas completas para o dashboard do admin, gerenciamento de treinadores, etc. | Separação clara das responsabilidades de rota. |
| **`trainer/`**     | Páginas do Treinador     | Telas para o dashboard do treinador, gerenciamento de alunos, dietas, etc.    | Organização funcional das telas do treinador.  |
| **`student/`**     | Páginas do Aluno         | Telas para o dashboard do aluno.                                              | Organização funcional das telas do aluno.      |
| **`Index.tsx`**    | Página Inicial           | Provavelmente renderiza a `LandingPage`.                                      | Ponto de entrada visual da aplicação.          |
| **`NotFound.tsx`** | Página 404               | Página exibida quando uma rota não é encontrada.                              | Melhora a experiência do usuário.              |

---

### 📁 `src/hooks/`

Hooks customizados do React para encapsular e reutilizar lógica com estado.

| Arquivo               | O que é                 | O que faz                                                             | Benefícios                                          |
| :-------------------- | :---------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------- |
| **`useStudents.ts`**  | Hook de Alunos          | Gerencia o estado e a lógica para buscar e manipular dados de alunos. | Reutilização da lógica de dados, código mais limpo. |
| **`useDietPlans.ts`** | Hook de Planos de Dieta | Gerencia o estado e a lógica para dados de planos de dieta.           | Centraliza a complexidade da gestão de dietas.      |
| **`useSessions.ts`**  | Hook de Sessões         | Gerencia o estado e a lógica para dados de agendamentos.              | Simplifica a manipulação de sessões.                |

---

### 📁 `src/integrations/supabase/`

Configuração da integração com o Supabase.

| Arquivo         | O que é           | O que faz                                                            | Benefícios                                |
| :-------------- | :---------------- | :------------------------------------------------------------------- | :---------------------------------------- |
| **`client.ts`** | Cliente Supabase  | Inicializa e exporta o cliente Supabase para ser usado na aplicação. | Ponto único de acesso ao backend.         |
| **`types.ts`**  | Tipos do Supabase | Contém as definições de tipo para as tabelas do banco de dados.      | Garante a segurança de tipos nas queries. |

---

### 📁 `supabase/`

Configurações e migrações do banco de dados Supabase, gerenciadas localmente.

| Arquivo/Pasta     | O que é            | O que faz                                                                   | Benefícios                                 |
| :---------------- | :----------------- | :-------------------------------------------------------------------------- | :----------------------------------------- |
| **`migrations/`** | Migrações do Banco | Contém arquivos SQL que definem as alterações no esquema do banco de dados. | Versionamento e histórico do schema do BD. |

---

## 4. Árvore Completa de Arquivos do Projeto

```
.
├── .gitignore
├── bun.lockb
├── components.json
├── eslint.config.js
├── fitcoach_plus_platform_backup.tar.gz
├── GEMINI.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── refactoring_log_2025-07-02.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .git/
├── dist/
├── escopos/
│   ├── escopo-construcao.md
│   ├── escopo-faltante-clean.md
│   ├── escopo-faltante.md
│   ├── estrategia-produto.md
│   └── fitcoach_coding_tasks.md
├── node_modules/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── TrainerCard.tsx
│   │   │   ├── TrainersFilters.tsx
│   │   │   └── TrainersList.tsx
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── landing/
│   │   │   └── LandingPage.tsx
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   ├── trainer/
│   │   │   ├── AddStudentDialog.tsx
│   │   │   ├── CreateDietDialog.tsx
│   │   │   ├── DietPlansList.tsx
│   │   │   ├── DietStatsCards.tsx
│   │   │   ├── ScheduleSessionDialog.tsx
│   │   │   ├── SessionsList.tsx
│   │   │   ├── StudentsList.tsx
│   │   │   ├── StudentStatsCards.tsx
│   │   │   └── UpgradeModal.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge-variants.ts
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button-variants.ts
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── EmptyState.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   ��       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle-variants.ts
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useDietPlans.ts
│   │   ├── usePlanLimits.ts
│   │   ├── useSessions.ts
│   │   ├── useStudents.ts
│   │   └── useTrainersManagement.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   └── utils.ts
│   └── pages/
│       ├── Index.tsx
│       ├── NotFound.tsx
│       ├── admin/
│       │   ├── AdminDashboard.tsx
│       │   ├── PaymentsManagement.tsx
│       │   ├── ReportsPage.tsx
│       │   ├── SystemSettings.tsx
│       │   └── TrainersManagement.tsx
│       ├── student/
│       │   └── StudentDashboard.tsx
│       └── trainer/
│           ├── DietPlansPage.tsx
│           ├── SessionsPage.tsx
│           ├── StudentsPage.tsx
│           └── TrainerDashboard.tsx
└── supabase/
    ├── config.toml
    └── migrations/
        ├── 20250630160128-36091232-eb7c-4f4f-87ec-69b982259759.sql
        └── 20250630192924-b96f05e3-c2d0-43fc-aa6a-60eaebbcec22.sql
```

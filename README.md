# FitCoach Plus Platform

Sistema completo de gestão para personal trainers e alunos, com painel administrativo integrado.

## 🔐 Credenciais de Teste

Para acessar as diferentes dashboards da aplicação, use as seguintes credenciais:

### Dashboard do Personal Trainer
- **Email:** trainer@fitcoach.com
- **Senha:** trainer123
- **Funcionalidades:** Gerenciamento de alunos, sessões, dietas e treinos

### Dashboard do Aluno
- **Email:** student@fitcoach.com
- **Senha:** student123
- **Funcionalidades:** Visualização de treinos, dietas e progresso

### Dashboard Administrativo
- **Email:** admin@fitcoach.com
- **Senha:** admin123
- **Funcionalidades:** Visão geral do sistema, gestão de trainers, pagamentos e configurações

## 💾 Modo de Teste LocalStorage

Todas as dashboards incluem um **DataSourceManager** que permite alternar entre dados do Supabase e dados locais para teste:

- **Dados Completos**: Dataset completo com múltiplos alunos, sessões e pagamentos
- **Dados Mínimos**: Dataset reduzido para testes específicos
- **Dados Vazios**: Para testar estados vazios da aplicação

Os dados localStorage são estruturados em JSON compatível com Supabase, permitindo migração fácil.

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase
- **Autenticação:** Supabase Auth
- **Estado:** TanStack Query
- **Testes:** Vitest + Testing Library

## Project info

**URL**: https://lovable.dev/projects/254a31e3-7dca-40b5-87fb-cca20ae161aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/254a31e3-7dca-40b5-87fb-cca20ae161aa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/254a31e3-7dca-40b5-87fb-cca20ae161aa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# FitCoach Plus Platform

Uma plataforma moderna para conectar personal trainers e seus alunos, oferecendo ferramentas centralizadas para gestão de treinos, dietas e agendamentos.

## 📊 Status do Projeto

**Completude Atual:** 35-40% ✅  
**Última Atualização:** Janeiro 2025  
**Status de Build:** ✅ Funcionando  
**Testes:** ✅ 36/36 passando  

### 🎯 O que está funcionando

#### ✅ Infraestrutura e Base Técnica (90% Completo)
- **Banco de Dados:** Schema completo com Row Level Security (RLS)
- **Frontend:** Arquitetura moderna com React 18 + TypeScript
- **Autenticação:** Sistema completo com Supabase Auth
- **UI/UX:** Design system consistente com shadcn/ui

#### ✅ Autenticação e Autorização (85% Completo)
- Login/Registro funcionando
- Roles bem definidos (admin, trainer, student)
- Rotas protegidas implementadas
- Redirecionamento automático baseado em role

#### ✅ Interface do Usuário (70% Completo)
- Landing page responsiva
- Dashboards básicos para cada tipo de usuário
- Páginas de gestão (alunos, sessões, planos de dieta)
- Sistema de navegação baseado em roles

### 🚧 Em Desenvolvimento

#### ❌ Funcionalidades Core (Próximas implementações)
- **Sistema de Gestão de Treinos:** Banco de exercícios e criação de fichas
- **Dashboard Real:** Estatísticas e métricas reais
- **Integração de Pagamentos:** Sistema Stripe para monetização
- **Inteligência Artificial:** Geração automática de treinos e dietas
- **Sistema de Planos:** Limitações baseadas em assinatura

## 🛠️ Tecnologias

### Frontend
- **Framework:** React 18 com TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui (baseado em Radix UI)
- **Roteamento:** React Router
- **State Management:** React Query (@tanstack/react-query)

### Backend
- **BaaS:** Supabase
- **Banco de Dados:** PostgreSQL
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage

### Ferramentas de Desenvolvimento
- **Testes:** Vitest + Testing Library + Playwright
- **Linting:** ESLint + TypeScript ESLint
- **Formatação:** Prettier (configurado via ESLint)
- **CI/CD:** GitHub Actions

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
├── modules/             # Módulos organizados por funcionalidade
│   ├── auth/           # Sistema de autenticação
│   ├── ui/             # Componentes de interface
│   └── ...
├── pages/              # Páginas organizadas por role
│   ├── admin/         # Painel administrativo
│   ├── trainer/       # Dashboard do trainer
│   └── student/       # Dashboard do aluno
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas (Supabase)
├── lib/               # Utilitários e configurações
└── services/          # Serviços e APIs
```

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/rpironato1/fitcoach-plus-platform.git

# Entre no diretório
cd fitcoach-plus-platform

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test         # Executa testes
npm run test:watch   # Testes em modo watch
npm run test:ui      # Interface gráfica para testes
npm run lint         # Executa linter
npm run typecheck    # Verificação de tipos TypeScript
```

## 🧪 Testes

O projeto possui uma suite de testes abrangente:

- **Testes Unitários:** Vitest + Testing Library
- **Testes E2E:** Playwright
- **Cobertura:** Disponível via `npm run test:coverage`

```bash
# Executar todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Interface gráfica para testes
npm run test:ui
```

## 🔧 Configuração do Ambiente

1. Configure as variáveis de ambiente necessárias para Supabase
2. Certifique-se de que o banco de dados está configurado com as migrações
3. Configure as chaves de API para serviços externos (quando implementados)

## 📈 Roadmap

### Próximas Implementações (Prioridade Alta)
1. **Sistema de Gestão de Treinos** (3 semanas)
2. **Dashboard com Dados Reais** (1 semana)  
3. **Integração Stripe** (2 semanas)
4. **Sistema de Planos Funcionais** (2 semanas)
5. **Integração com IA** (2 semanas)

### Melhorias Futuras
- Rate limiting e segurança avançada
- Notificações push
- App mobile (React Native)
- Compliance LGPD completo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte, entre em contato através das issues do GitHub.

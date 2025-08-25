#!/bin/bash

# 🚀 FitCoach Plus - Setup Validation Script
# Valida se o ambiente de desenvolvimento está configurado corretamente

echo "🏗️ FitCoach Plus Platform - Validação do Ambiente de Desenvolvimento"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check port availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Porta $port está em uso${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Porta $port está disponível${NC}"
        return 0
    fi
}

echo ""
echo "🔍 Verificando Pré-requisitos..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}❌ Node.js versão 18+ é requerida${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git: $GIT_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Git não encontrado (opcional)${NC}"
fi

echo ""
echo "🌐 Verificando Configuração de Portas (8030-8040)..."

# Check port availability
PORT_8030_OK=0
PORT_8031_OK=0
PORT_8033_OK=0
PORT_8035_OK=0

check_port 8030 && PORT_8030_OK=1
check_port 8031 && PORT_8031_OK=1
check_port 8033 && PORT_8033_OK=1
check_port 8035 && PORT_8035_OK=1

echo ""
echo "🧪 Verificando Dependências do Projeto..."

# Check if package.json exists
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    exit 1
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Execute: npm install${NC}"
fi

echo ""
echo "⚙️  Verificando Configuração do Projeto..."

# Check vite.config.ts
if grep -q "port: 8030" vite.config.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Vite configurado para porta 8030${NC}"
else
    echo -e "${RED}❌ Vite não configurado corretamente${NC}"
fi

# Check playwright.config.ts
if grep -q "localhost:8030" playwright.config.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Playwright configurado para porta 8030${NC}"
else
    echo -e "${RED}❌ Playwright não configurado corretamente${NC}"
fi

echo ""
echo "🚀 Testando Scripts de Desenvolvimento..."

# Test TypeScript compilation
echo -n "Verificando TypeScript... "
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Falha${NC}"
fi

# Test build
echo -n "Testando build... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Falha${NC}"
fi

echo ""
echo "📋 Resumo da Validação:"
echo "======================"

ALL_OK=true

if [ $PORT_8030_OK -eq 1 ]; then
    echo -e "${GREEN}✅ Porta 8030 (Dev Server): Disponível${NC}"
else
    echo -e "${RED}❌ Porta 8030 (Dev Server): Em uso${NC}"
    ALL_OK=false
fi

if [ $PORT_8031_OK -eq 1 ]; then
    echo -e "${GREEN}✅ Porta 8031 (Preview): Disponível${NC}"
else
    echo -e "${YELLOW}⚠️  Porta 8031 (Preview): Em uso${NC}"
fi

if [ $PORT_8033_OK -eq 1 ]; then
    echo -e "${GREEN}✅ Porta 8033 (Test UI): Disponível${NC}"
else
    echo -e "${YELLOW}⚠️  Porta 8033 (Test UI): Em uso${NC}"
fi

if [ $PORT_8035_OK -eq 1 ]; then
    echo -e "${GREEN}✅ Porta 8035 (Playwright UI): Disponível${NC}"
else
    echo -e "${YELLOW}⚠️  Porta 8035 (Playwright UI): Em uso${NC}"
fi

echo ""
if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}🎉 Ambiente de desenvolvimento configurado corretamente!${NC}"
    echo ""
    echo -e "${BLUE}Para iniciar o desenvolvimento:${NC}"
    echo "  npm run dev        # Servidor na porta 8030"
    echo "  npm run test:ui    # Interface de testes na porta 8033"
    echo "  npm run test:e2e:ui # Playwright na porta 8035"
    echo ""
    echo -e "${BLUE}URLs importantes:${NC}"
    echo "  📱 App: http://localhost:8030"
    echo "  🧪 Tests: http://localhost:8033"
    echo "  🎭 E2E: http://localhost:8035"
    echo "  🗄️  LocalStorage Manager: http://localhost:8030/localStorage-manager"
    echo ""
    echo -e "${BLUE}Console commands (F12):${NC}"
    echo "  fitcoachLocalStorageDemo.help()"
    echo "  fitcoachLocalStorageDemo.enableLocalStorage()"
    echo "  fitcoachLocalStorageDemo.loginAsStudent()"
else
    echo -e "${RED}❌ Existem problemas com o ambiente. Verifique as mensagens acima.${NC}"
    exit 1
fi
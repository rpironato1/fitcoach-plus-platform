# Implementação LocalStorage para Dashboard Personal

## Visão Geral

Esta implementação adiciona suporte ao localStorage no dashboard do personal trainer, permitindo testes e desenvolvimento sem dependência do Supabase. Os dados são estruturados em JSON compatível para facilitar a migração futura.

## Arquivos Criados

### 1. `src/services/localStorageService.ts`
- **Função**: Serviço principal para gerenciamento de dados localStorage
- **Características**:
  - Estrutura JSON compatível com schema Supabase
  - Dados mock abrangentes para teste
  - Variações de dados (vazio, mínimo, completo)
  - Exportação para migração Supabase
  - Gestão de IDs consistente

### 2. `src/hooks/useLocalStorageDashboardData.ts`
- **Função**: Hooks React Query para localStorage
- **Características**:
  - Espelha hooks existentes do Supabase
  - Mesma interface de dados
  - Cache e timing similares
  - Compatibilidade total com dashboard atual

### 3. `src/components/trainer/DataSourceManager.tsx`
- **Função**: Interface de controle para alternar entre fontes
- **Características**:
  - Toggle localStorage/Supabase
  - Controles de variação de dados
  - Exportação de dados
  - Informações detalhadas sobre dados atuais

### 4. `src/test/localStorage.test.tsx`
- **Função**: Testes unitários completos
- **Características**:
  - Cobertura de todos os hooks
  - Teste de variações de dados
  - Validação de compatibilidade JSON
  - Teste de funcionalidades de migração

### 5. `src/utils/localStorageDemo.ts`
- **Função**: Utilitários para demonstração
- **Características**:
  - Comandos de console para teste
  - Facilita switching entre fontes
  - Demonstração de funcionalidades

## Estrutura de Dados

### Entidades Principais

```typescript
interface LocalStorageData {
  trainer_profiles: LocalStorageTrainerProfile[];
  students: LocalStorageStudent[];
  sessions: LocalStorageSession[];
  payments: LocalStoragePayment[];
  diet_plans: LocalStorageDietPlan[];
  workout_plans: LocalStorageWorkoutPlan[];
  lastUpdated: string;
}
```

### Dados Mock Incluídos

- **5 alunos** com perfis variados
- **6 sessões** (hoje, amanhã, próxima semana, concluídas)
- **3 pagamentos** simulando receita mensal
- **3 planos de dieta** com diferentes tipos
- **3 planos de treino** diversos
- **1 perfil de trainer** plano Pro

## Como Usar

### 1. Interface Visual (Recomendado)

1. Acesse o dashboard do trainer
2. Use o componente "Gerenciador de Fonte de Dados" no topo
3. Ative o toggle "Usar LocalStorage"
4. Escolha variação de dados (Completos/Mínimos/Vazios)
5. Teste diferentes cenários

### 2. Console do Navegador

```javascript
// Mostrar ajuda
fitcoachLocalStorageDemo.help()

// Alternar para localStorage
fitcoachLocalStorageDemo.useLocalStorage()

// Alternar para Supabase
fitcoachLocalStorageDemo.useSupabase()

// Ver dados atuais
fitcoachLocalStorageDemo.exportData()
```

### 3. Programático

```typescript
import { localStorageService } from '@/services/localStorageService';

// Inicializar dados
localStorageService.initializeData();

// Carregar variação
localStorageService.addDataVariation('empty');

// Exportar para Supabase
const exportData = localStorageService.exportForSupabase();
```

## Variações de Dados

### 1. Dados Completos (Padrão)
- 5 alunos ativos
- Sessões distribuídas (hoje, futuro, passado)
- Receita mensal R$ 450,00
- Múltiplos planos de dieta e treino
- Atividades recentes variadas

### 2. Dados Mínimos
- 1 aluno
- 2 sessões
- 1 pagamento
- 1 plano de cada tipo
- Ideal para testes de estado simples

### 3. Dados Vazios
- Sem alunos
- Sem sessões
- Sem pagamentos
- Sem planos
- Ideal para testes de estado vazio

## Compatibilidade Supabase

### Estrutura JSON Compatível

Os dados localStorage são estruturados para serem 100% compatíveis com o schema Supabase:

```json
{
  "trainer_profiles": [...],
  "student_profiles": [...],
  "sessions": [...],
  "payment_intents": [...],
  "diet_plans": [...],
  "workout_plans": [...]
}
```

### Processo de Migração

1. **Desenvolvimento**: Use localStorage para testes
2. **Teste**: Exporte dados via "Exportar para Supabase"
3. **Migração**: Importe JSON diretamente no Supabase
4. **Produção**: Desative localStorage e use Supabase

## Benefícios

### Para Desenvolvimento
- ✅ Testes sem dependência de rede
- ✅ Dados consistentes e previsíveis
- ✅ Debugging simplificado
- ✅ Desenvolvimento offline

### Para Testes
- ✅ Cenários controlados
- ✅ Variações rápidas
- ✅ Estado resetável
- ✅ Cobertura abrangente

### Para Migração
- ✅ Estrutura JSON compatível
- ✅ Validação prévia
- ✅ Processo gradual
- ✅ Rollback seguro

## Monitoramento

### Logs Disponíveis
- Inicialização de dados
- Mudanças de variação
- Exportações
- Erros de localStorage

### Métricas de Teste
- 12 testes unitários
- Cobertura de hooks
- Validação de dados
- Teste de compatibilidade

## Configurações

### Cache e Performance
- 5 minutos cache para stats
- 2 minutos cache para sessões
- 1 minuto cache para atividades
- Garbage collection configurado

### Persistência
- Dados sobrevivem a refresh
- Limpeza automática opcional
- Backup local disponível
- Sincronização manual

## Próximos Passos

1. **Teste Extensivo**: Validar todos os cenários
2. **Documentação**: Guia completo de migração
3. **Automação**: Scripts de importação/exportação
4. **Monitoramento**: Métricas de uso localStorage vs Supabase

## Comandos Úteis

```bash
# Executar testes
npm test src/test/localStorage.test.tsx

# Build com localStorage
npm run build

# Desenvolvimento
npm run dev
```

## Suporte

Para dúvidas ou problemas:
1. Consulte os testes em `src/test/localStorage.test.tsx`
2. Use `fitcoachLocalStorageDemo.help()` no console
3. Verifique logs do navegador para depuração
# 🛠️ Plano de Implementação Técnica - FitCoach Plus Platform

## 📋 ROADMAP DE DESENVOLVIMENTO

### FASE 1: CORE BUSINESS LOGIC (2-3 semanas)

#### 1.1 Sistema de Gestão de Treinos ⏱️ 2 semanas
**Prioridade:** 🔴 CRÍTICA - É a funcionalidade PRINCIPAL

**Banco de Dados:**
```sql
-- Adicionar tabelas no próximo migration
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'chest', 'back', 'legs', etc.
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT,
  instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  target_muscles TEXT[],
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INTEGER NOT NULL,
  reps_min INTEGER,
  reps_max INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL
);

CREATE TABLE student_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID REFERENCES workout_templates(id),
  name TEXT NOT NULL,
  scheduled_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_workout_id UUID REFERENCES student_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets_completed INTEGER,
  reps_completed INTEGER[],
  weight_used DECIMAL[],
  rest_time_seconds INTEGER[],
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);
```

**Frontend Components:**
- `WorkoutBuilder` - Criação de fichas de treino
- `ExerciseDatabase` - Banco de exercícios
- `WorkoutAssignment` - Atribuição para alunos
- `ProgressTracking` - Acompanhamento de execução

#### 1.2 Dashboard Real ⏱️ 1 semana
**Problema Atual:** Dados sempre mostram "0"

**Implementar:**
```typescript
// hooks/useTrainerStats.ts
export function useTrainerStats(trainerId: string) {
  return useQuery({
    queryKey: ['trainer-stats', trainerId],
    queryFn: async () => {
      // Buscar estatísticas reais:
      // - Número de alunos ativos
      // - Sessões desta semana
      // - Receita estimada
      // - Planos de dieta criados
      // - Próximas sessões
    }
  });
}
```

**Métricas Reais Necessárias:**
- Total de alunos ativos (COUNT student_profiles WHERE status='active')
- Sessões agendadas próximas 7 dias
- Receita projetada do mês
- Taxa de conclusão de treinos
- Planos de dieta criados no mês

---

### FASE 2: MONETIZAÇÃO (2-3 semanas)

#### 2.1 Integração Stripe ⏱️ 2 semanas

**Edge Functions Necessárias:**
```typescript
// supabase/functions/create-payment-intent/index.ts
// supabase/functions/stripe-webhook/index.ts
// supabase/functions/create-subscription/index.ts
```

**Implementação Step-by-Step:**
1. **Semana 1:**
   - Configurar Stripe SDK
   - Criar Edge Function para Payment Intents
   - Implementar webhook básico
   - Testes com cartão de teste

2. **Semana 2:**
   - Implementar subscriptions
   - Criar UI de checkout
   - Handling de falhas de pagamento
   - Testes completos

#### 2.2 Sistema de Planos Real ⏱️ 1 semana

**Middleware de Limitações:**
```typescript
// Implementar em: hooks/usePlanLimits.ts
export function usePlanLimits() {
  const checkStudentLimit = (currentCount: number, plan: string) => {
    const limits = {
      free: 3,
      pro: 40,
      elite: 100
    };
    return currentCount < limits[plan];
  };
  
  const checkAICredits = (used: number, plan: string) => {
    const limits = {
      free: 0,
      pro: 50,
      elite: 200
    };
    return used < limits[plan];
  };
}
```

**Features:**
- Modal de upgrade quando atingir limites
- Trial de 14 dias automático
- Downgrade automático após vencimento

---

### FASE 3: INTELIGÊNCIA ARTIFICIAL (2 semanas)

#### 3.1 Integração OpenAI ⏱️ 2 semanas

**Edge Function para IA:**
```typescript
// supabase/functions/generate-diet-plan/index.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

export async function generateDietPlan(params: {
  goals: string;
  restrictions: string;
  calories: number;
  meals: number;
}) {
  // Implementar geração real com OpenAI
  // Descontar créditos do trainer
  // Salvar resultado na tabela diet_plans
}
```

**Sistema de Créditos:**
```typescript
// hooks/useAICredits.ts
export function useAICredits() {
  const consumeCredit = async (type: 'diet' | 'workout' | 'chat') => {
    // Verificar se tem créditos
    // Descontar da tabela ai_credit_ledger
    // Bloquear se sem créditos
  };
}
```

---

### FASE 4: SEGURANÇA E COMPLIANCE (1-2 semanas)

#### 4.1 Rate Limiting ⏱️ 3 dias
```typescript
// supabase/functions/_shared/rate-limiter.ts
export const checkRateLimit = async (req: Request, limit: number) => {
  // Implementar rate limiting por IP
  // 100 requests por 15 minutos para auth
  // 1000 requests por hora para API geral
};
```

#### 4.2 LGPD Compliance ⏱️ 2 dias
```typescript
// supabase/functions/delete-user-account/index.ts
export async function deleteUserAccount(userId: string) {
  // Anonimizar dados PII
  // Soft delete relacionamentos
  // Revogar tokens
  // Enviar confirmação por email
}
```

#### 4.3 Correção de Testes ⏱️ 2 dias
- Corrigir mock do AuthProvider
- Implementar testes para funcionalidades principais
- Configurar CI/CD com testes obrigatórios

---

## 🧪 ESTRATÉGIA DE TESTES

### Testes Críticos para Implementar:

1. **E2E Principal:**
```typescript
// tests/e2e/main-flow.spec.ts
test('Fluxo completo trainer', async ({ page }) => {
  // 1. Signup como trainer
  // 2. Criar primeiro aluno
  // 3. Criar ficha de treino
  // 4. Agendar sessão
  // 5. Gerar plano de dieta
  // 6. Fazer upgrade de plano
});
```

2. **Testes de Limitação:**
```typescript
test('Free plan limits', async () => {
  // Verificar que free não pode ter 4º aluno
  // Verificar que free não pode usar IA
  // Verificar que free tem fee de 1.5%
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### MVP (Fase 1-2 Completa):
- [ ] Trainer consegue criar ficha de treino completa
- [ ] Aluno consegue ver e executar treino
- [ ] Dashboard mostra dados reais
- [ ] Pagamento básico funcionando
- [ ] Limitações de plano funcionando

### Versão Comercial (Fase 1-3 Completa):
- [ ] IA gerando dietas personalizadas
- [ ] Sistema de créditos funcionando
- [ ] Upgrade/downgrade automático
- [ ] Relatórios de progresso funcionais

### Versão Produção (Todas Fases):
- [ ] Rate limiting ativo
- [ ] LGPD compliance
- [ ] Testes E2E passando
- [ ] Monitoramento ativo

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana:
1. **DIA 1-2:** Criar migration para sistema de treinos
2. **DIA 3-4:** Implementar componente WorkoutBuilder
3. **DIA 5:** Implementar ExerciseDatabase com seed data

### Próxima Semana:
1. **DIA 1-2:** Finalizar sistema de treinos
2. **DIA 3:** Implementar dashboard real
3. **DIA 4-5:** Começar integração Stripe

### Semana 3:
1. **DIA 1-3:** Finalizar Stripe integration
2. **DIA 4-5:** Implementar sistema de planos

---

## ⚠️ ARMADILHAS A EVITAR

1. **Não implementar features secundárias** antes do core
2. **Não over-engineer** - MVP primeiro, otimização depois
3. **Não ignorar testes** - implementar junto com features
4. **Não implementar IA sem sistema de créditos** - pode gerar custos
5. **Não deployer sem rate limiting** - risco de segurança

---

*Documento criado em: 02/01/2025*
*Próxima revisão: Após completar Fase 1*
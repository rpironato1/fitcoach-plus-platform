# FitCoach Plus Platform - Implementações Técnicas

> **📋 Estratégia:** `escopos/estrategia-produto.md`  
> **Este arquivo:** APENAS código e implementações

---

## 🔥 FUNCIONALIDADES CORE

### 1. Sistema de Gestão de Treinos

**Banco de Dados:**

```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainer_profiles(id),
  student_id UUID REFERENCES student_profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID REFERENCES workout_plans(id),
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  weight_kg DECIMAL(5,2),
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER
);
```

**Frontend:**

```typescript
// src/pages/trainer/WorkoutsPage.tsx
export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planos de Treino</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Treino
        </Button>
      </div>
      <CreateWorkoutDialog />
      <WorkoutsList workouts={workouts} />
    </div>
  )
}
```

### 2. Dashboard do Personal Trainer

```typescript
// src/pages/trainer/TrainerDashboard.tsx
export function TrainerDashboard() {
  const { trainerProfile } = useAuth()
  const { data: stats } = useQuery({
    queryKey: ['trainer-dashboard'],
    queryFn: async () => {
      const [students, workouts, sessions] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('trainer_id', trainerProfile.id),
        supabase.from('workout_plans').select('*').eq('trainer_id', trainerProfile.id),
        supabase.from('sessions').select('*').eq('trainer_id', trainerProfile.id)
      ])

      return {
        totalStudents: students.data?.length || 0,
        activeWorkouts: workouts.data?.length || 0,
        upcomingSessions: sessions.data?.length || 0
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Alunos" value={stats?.totalStudents} />
        <StatsCard title="Treinos" value={stats?.activeWorkouts} />
        <StatsCard title="Sessões" value={stats?.upcomingSessions} />
      </div>
    </div>
  )
}
```

### 3. Definição dos Planos

```typescript
// src/lib/plans.ts
export const PLAN_DEFINITIONS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      students: 3,
      workouts_per_student: 1,
      ai_credits: 0,
      sessions_per_month: 5,
    },
  },
  pro: {
    name: "Pro",
    price: 4990,
    limits: {
      students: 40,
      workouts_per_student: -1,
      ai_credits: 50,
      sessions_per_month: -1,
    },
  },
  elite: {
    name: "Elite",
    price: 9990,
    limits: {
      students: -1,
      workouts_per_student: -1,
      ai_credits: 150,
      sessions_per_month: -1,
    },
  },
};
```

### 4. Portal de Gestão de Assinatura

```typescript
// src/pages/trainer/SubscriptionPage.tsx
export function SubscriptionPage() {
  const { trainerProfile } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Minha Assinatura</h1>

      <Card>
        <CardHeader>
          <CardTitle>Plano Atual: {trainerProfile.plan}</CardTitle>
          <CardDescription>
            {trainerProfile.active_until &&
              `Válido até: ${new Date(trainerProfile.active_until).toLocaleDateString()}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-x-2">
            <Button variant="outline">Alterar Plano</Button>
            <Button variant="outline">Gerenciar Pagamento</Button>
            <Button variant="destructive">Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. Fluxo de Onboarding

```typescript
// src/components/onboarding/OnboardingFlow.tsx
export function OnboardingFlow() {
  const [step, setStep] = useState(1)

  const steps = [
    { title: 'Bem-vindo', component: WelcomeStep },
    { title: 'Perfil', component: ProfileStep },
    { title: 'Primeiro Aluno', component: StudentStep },
    { title: 'Primeiro Treino', component: WorkoutStep },
    { title: 'Escolher Plano', component: PlanStep }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <ProgressBar current={step} total={steps.length} />
        <StepComponent step={steps[step - 1]} onNext={() => setStep(step + 1)} />
      </div>
    </div>
  )
}
```

---

## 🔐 BACKEND E SEGURANÇA

### 1. Endpoint LGPD – Exclusão de Conta

```typescript
// supabase/functions/delete-user-account/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { userId } = await req.json()
    const supabase = createClient(...)

    // Anonimizar dados PII
    await supabase
      .from('profiles')
      .update({
        first_name: 'ANONIMO',
        last_name: 'DELETADO',
        phone: null,
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Soft delete relacionamentos
    await supabase
      .from('student_profiles')
      .update({ status: 'cancelled' })
      .eq('trainer_id', userId)

    // Revogar tokens auth
    await supabase.auth.admin.deleteUser(userId)

    return new Response('Account deleted', { status: 204 })
  } catch (error) {
    return new Response(error.message, { status: 400 })
  }
})
```

### 2. Rate-Limit e Brute-Force Protection

```typescript
// supabase/functions/_shared/rate-limiter.ts
import { RateLimiter } from "https://deno.land/x/rate_limiter@v1.0.0/mod.ts";

const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  keyExtractor: (req) => req.headers.get("x-forwarded-for") || "unknown",
});

export const checkRateLimit = async (req: Request) => {
  const result = await authLimiter.check(req);
  if (!result.allowed) {
    throw new Error("Muitas tentativas. Tente novamente em 15 minutos.");
  }
};
```

### 3. CSRF & CORS Protection

```typescript
// supabase/functions/_shared/security.ts
export const validateCSRF = async (req: Request) => {
  const token = req.headers.get("x-csrf-token");
  const sessionToken = req.headers.get("authorization");

  if (!token || !validateCSRFToken(token, sessionToken)) {
    throw new Error("Invalid CSRF token");
  }
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
  "Access-Control-Allow-Credentials": "true",
};
```

---

## 💳 INTEGRAÇÃO DE PAGAMENTOS

### 1. Configuração do Stripe

```bash
npm install @stripe/stripe-js stripe
```

**Variáveis de Ambiente:**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPABASE_STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Edge Function para Processar Pagamentos

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-08-16',
})

serve(async (req) => {
  try {
    const { amount, trainerId, studentId, method } = await req.json()

    const supabase = createClient(...)
    const { data: config } = await supabase
      .from('payment_processor_config')
      .select('markup_percent')
      .eq('trainer_id', trainerId)
      .single()

    const feePercent = config?.markup_percent || 1.5
    const feeAmount = Math.round(amount * (feePercent / 100))

    // Criar Payment Intent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + feeAmount,
      currency: 'brl',
      metadata: { trainerId, studentId }
    })

    // Salvar no banco
    const { data: dbPayment } = await supabase
      .from('payment_intents')
      .insert({
        student_id: studentId,
        trainer_id: trainerId,
        amount: amount + feeAmount,
        method,
        fee_percent: feePercent,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      })
      .select()
      .single()

    return new Response(JSON.stringify({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: dbPayment.id
    }))
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

### 3. Webhook para Confirmação de Pagamentos

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0?target=deno'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    const supabase = createClient(...)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object

      await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntent.id)
    }

    if (event.type === 'payment_intent.refunded') {
      const paymentIntent = event.data.object

      await supabase
        .from('payment_intents')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent_id', paymentIntent.id)
    }

    return new Response('OK')
  } catch (error) {
    return new Response('Webhook Error', { status: 400 })
  }
})
```

### 4. Hook Frontend para Pagamentos

```typescript
// src/hooks/usePayment.ts
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

export function usePayment() {
  const createPaymentIntent = async ({
    amount,
    trainerId,
    studentId,
    method,
  }) => {
    const { data } = await supabase.functions.invoke("create-payment-intent", {
      body: { amount, trainerId, studentId, method },
    });
    return data;
  };

  const processPayment = async (clientSecret: string) => {
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );

    return await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
  };

  return { createPaymentIntent, processPayment };
}
```

---

## 🔧 MIDDLEWARE DE VALIDAÇÃO

### 1. Edge Function de Validação de Limites

```typescript
// supabase/functions/check-limits/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { action, trainerId } = await req.json()

    const supabase = createClient(...)

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('plan, max_students, ai_credits')
      .eq('id', trainerId)
      .single()

    if (!trainer) throw new Error('Trainer não encontrado')

    const limits = {
      free: { maxStudents: 3, aiCredits: 0 },
      pro: { maxStudents: 40, aiCredits: 50 },
      elite: { maxStudents: 0, aiCredits: 150 }
    }

    const planLimits = limits[trainer.plan]

    // Verificar limite de alunos
    if (action === 'create_student' && planLimits.maxStudents > 0) {
      const { count: currentStudents } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainerId)
        .eq('status', 'active')

      if (currentStudents >= planLimits.maxStudents) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'students_limit',
          message: `Limite de ${planLimits.maxStudents} alunos atingido.`,
          currentCount: currentStudents,
          limit: planLimits.maxStudents
        }))
      }
    }

    // Verificar créditos IA
    if (action === 'use_ai') {
      if (trainer.ai_credits <= 0) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'ai_credits',
          message: 'Sem créditos de IA disponíveis.',
          currentCredits: trainer.ai_credits
        }))
      }
    }

    return new Response(JSON.stringify({ allowed: true }))

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

### 2. Hook Frontend para Validação

```typescript
// src/hooks/useCheckLimits.ts
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export function useCheckLimits() {
  const { profile } = useAuth();

  const checkLimit = async (action: string) => {
    const { data } = await supabase.functions.invoke("check-limits", {
      body: {
        action,
        trainerId: profile?.id,
      },
    });

    return data;
  };

  return { checkLimit };
}
```

### 3. Implementação nos Componentes

```typescript
// src/components/trainer/AddStudentDialog.tsx
const { checkLimit } = useCheckLimits();

const handleAddStudent = async (studentData) => {
  const limitCheck = await checkLimit("create_student");

  if (!limitCheck.allowed) {
    if (limitCheck.reason === "students_limit") {
      setShowUpgradeModal(true);
      return;
    }
  }

  // Prosseguir com criação...
};
```

---

## 🤖 SISTEMA IA

### 1. Endpoint IA com Controle de Créditos

```typescript
// supabase/functions/ai-use/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from 'https://esm.sh/openai@4.20.1'

serve(async (req) => {
  try {
    const { trainerId, prompt, type } = await req.json()

    const supabase = createClient(...)

    const { data: trainer } = await supabase
      .from('trainer_profiles')
      .select('ai_credits, plan')
      .eq('id', trainerId)
      .single()

    if (trainer.ai_credits <= 0 && trainer.plan !== 'elite') {
      return new Response(JSON.stringify({
        error: 'Sem créditos de IA disponíveis',
        code: 'INSUFFICIENT_CREDITS'
      }), { status: 402 })
    }

    // Consumir 1 crédito
    await supabase
      .from('ai_credit_ledger')
      .insert({
        trainer_id: trainerId,
        amount: -1,
        type: type
      })

    // Atualizar saldo
    await supabase
      .from('trainer_profiles')
      .update({ ai_credits: trainer.ai_credits - 1 })
      .eq('id', trainerId)

    // Chamar OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    })

    return new Response(JSON.stringify({
      response: completion.choices[0].message.content,
      creditsRemaining: trainer.ai_credits - 1
    }))

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

### 2. Cron Job Mensal para Reset de Créditos

```typescript
// supabase/functions/monthly-credits-reset/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(...)

  const creditsMap = {
    free: 0,
    pro: 50,
    elite: 150
  }

  for (const [plan, credits] of Object.entries(creditsMap)) {
    await supabase
      .from('trainer_profiles')
      .update({ ai_credits: credits })
      .eq('plan', plan)
  }

  return new Response('Credits reset completed')
})
```

---

## 📧 SISTEMA DE E-MAIL

### 1. Integração com Resend

```bash
npm install resend
```

```typescript
// src/lib/mailer.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailTemplates = {
  confirm_session: {
    subject: "Sessão Confirmada - FitCoach",
    template: "session-confirmed",
  },
  reminder_24h: {
    subject: "Lembrete: Sessão em 24h",
    template: "session-reminder",
  },
  trial_expire: {
    subject: "Seu trial expira em breve",
    template: "trial-expiring",
  },
};

export const sendEmail = async (template: string, to: string, vars: any) => {
  const config = emailTemplates[template];

  return await resend.emails.send({
    from: "noreply@fitcoach.com",
    to,
    subject: config.subject,
    html: renderTemplate(config.template, vars),
  });
};
```

---

## 🧪 TESTES

### 1. Testes E2E com Cypress

```bash
npm install --save-dev cypress
```

```typescript
// cypress/e2e/payment-flow.cy.ts
describe("Fluxo de Pagamento", () => {
  it("Trainer Free → Upgrade → Pagamento", () => {
    cy.visit("/register");
    cy.get("[data-cy=trainer-signup]").click();
    cy.get("[data-cy=email]").type("trainer@test.com");
    cy.get("[data-cy=submit]").click();

    // Verificar limite
    cy.contains("3 alunos máximo");

    // Tentar adicionar 4º aluno
    cy.get("[data-cy=add-student]").click();
    cy.get("[data-cy=upgrade-modal]").should("be.visible");

    // Fazer upgrade
    cy.get("[data-cy=select-pro-plan]").click();
    cy.get("[data-cy=stripe-card]").type("4242424242424242");
    cy.get("[data-cy=confirm-payment]").click();

    cy.contains("Plano: Pro");
  });
});
```

### 2. Testes Unitários

```typescript
// tests/rate-limiter.test.ts
import { checkRateLimit } from "../src/lib/rate-limiter";

describe("Rate Limiter", () => {
  test("deve bloquear após 5 tentativas", async () => {
    const mockReq = {
      headers: { get: () => "192.168.1.1" },
    } as Request;

    for (let i = 0; i < 5; i++) {
      await expect(checkRateLimit(mockReq)).resolves.not.toThrow();
    }

    await expect(checkRateLimit(mockReq)).rejects.toThrow("Muitas tentativas");
  });
});
```

---

## 🔧 CONFIGURAÇÕES

### Environment Variables

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPABASE_STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# E-mail
RESEND_API_KEY=re_...

# OpenAI
OPENAI_API_KEY=sk-...

# Outros
CORS_ORIGIN=https://fitcoach.com
```

### Webhooks URLs

```
Stripe Webhook: https://your-project.supabase.co/functions/v1/stripe-webhook
```

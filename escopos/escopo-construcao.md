# FitCoach – SaaS de Agenda e Acompanhamento para Personal Trainer

## 0 – Visão geral

Crie um aplicativo web responsivo em português chamado **FitCoach**.  
Objetivo: permitir que **personais** gerenciem agenda, treinos, dietas, IA e pagamentos de **alunos**.  
Modelo de negócio: assinatura mensal por personal + plano Free com taxas maiores.  
Tecnologia: use o stack padrão que o Lovable sugerir (Node/React/PostgreSQL ou equivalente).

## 1 – Autenticação e papéis

• Autenticação e-mail/senha.  
• Papéis: **admin**, **trainer**, **student** (enum em User).  
• Landing page pública; demais rotas privadas.

## 2 – Modelos de dados (principais)

### Usuários

- **User** → extra: firstName, lastName, phone, role.
- **TrainerProfile** (1-1 User)  
   • plan(enum: free, pro, elite) **NOVO**  
   • activeUntil(date)  
   • whatsappNumber, bio, avatarUrl.
- **StudentProfile** (1-1 User)  
   • trainerId FK, startDate, status(enum active/paused/cancelled).

### Financeiro

- **PlanTemplate**, **StudentPlan**, **Payment** (já descritos).
- **PaymentIntent** (gateway log) **NOVO**  
   • id, studentId, trainerId, amount, method, feePct, status(succeeded/failed), createdAt.
- **PaymentProcessorConfig** **NOVO**  
   • trainerId, markupPercent (definido via plan).

### Agenda, treinos, nutrição e métricas

(Sem alterações – ver prompt original.)

### Dieta

- **DietPlan**  
   • id, studentId, trainerId, name, totalCalories, **isPaid:boolean** (true para dietas avulsas no Free).

## 3 – Regras de acesso

Idênticas ao prompt original + filtragem por plan (ver middleware).

## 4 – Interfaces públicas & privadas

(Mesmas definições de páginas do prompt original.)

## 5 – Fluxos principais (atualizados)

### 5.1 Recebimento obrigatório no Free

1. Ao criar **Session**, backend executa `enforceOnlinePayment()`.
2. Se `trainer.plan === 'free'` e `paymentIntentId === null` ⇒ negar agendamento.
3. Criar PaymentIntent via Stripe/Efí aplicando `markupPercent` (5,5 % cartão / 2,7 % Pix).
4. Após status `succeeded`, Session passa a `booked`.

### 5.2 Geração de Dieta Avulsa (Free)

1. Student pede dieta; backend verifica `trainer.plan`.
2. Se `plan === 'free'` → cria PaymentIntent R$ 7,90; espera `succeeded`; grava `DietPlan.isPaid = true`.
3. Chama serviço IA → salva dieta.
4. Em Pro/Elite pular PaymentIntent.

### 5.3 Upgrade de plano

1. Ao atingir 4º aluno (Free) ou `sum(fee)>R$50`, mostrar modal “Migre para Pro”.
2. Permitir Trial Pro 14 dias (`trainer.activeUntil = now+14`).
3. Ao pagar assinatura, set `trainer.plan` e atualize `PaymentProcessorConfig.markupPercent`.

## 6 – Limites automáticos por plano

| Campo                    | Free | Pro | Elite           |
| ------------------------ | ---- | --- | --------------- |
| `maxStudents`            | 3    | 40  | ∞               |
| `aiCredits/month`        | 0    | 50  | 150             |
| `markupPercent` (cartão) | 1.5% | 0   | -0.5% (subsid.) |
| Dietas incluídas/mês     | 0    | ∞   | ∞               |

Implementar middleware `checkLimits` antes dos endpoints críticos.

## 7 – IA e créditos

• Tabela **AICreditLedger**: trainerId, amount, type(genDiet/genWorkout/chat), usedAt.  
• Cron mensal: zera saldo, injeta créditos conforme plano.  
• Endpoint `/ai/use` consome 1 crédito; se saldo 0 (e não Elite) → retorna erro “compre pacote”.

## 8 – Rotina mensal (Cron)

1. Gerar faturas de assinatura Pro/Elite (Stripe Subscriptions).
2. Consolidar `markupPercent` do mês de todos os PaymentIntent `succeeded` Free.
3. Reset `aiCredits`, enviar e-mail de resumo ao trainer.

## 9 – Check-list de implementação **(essencial para Lovable)**

1. **Adicionar `plan` enum** em TrainerProfile.
2. **Tabela PaymentProcessorConfig** com `markupPercent` setado via trigger ao criar/alterar plano.
3. **Middleware**  
    • `enforceOnlinePayment` – bloqueia Session Free sem PaymentIntent.  
    • `checkLimits` – valida `maxStudents` e `aiCredits`.
4. **DietPlan.isPaid** + fluxo de pagamento avulso no Free.
5. **Credit Ledger** + cron mensal (reset + refill).
6. **Modal Upgrade** quando `students>maxStudents` OU `(feeMarkupCurrentMonth > R$ 50)`.
7. **Stripe / Efí integração** com webhook → atualiza PaymentIntent + Payment.
8. **Unit tests**:  
    • Free não consegue 4º aluno sem upgrade.  
    • Free agenda sessão apenas após fee 5,5 % aplicada.  
    • Pro/Elite criam dietas sem cobrança.

## 10 – UX

Same as original prompt (design limpo, responsive, etc.).

## 11 – Deploy

Build e deploy automáticos; HTTPS; variáveis Stripe/Efí e OPENAI no .env.

## 12 – Conclusão

Mostrar dashboard do trainer (plano e limites) sem erros após seed.

# FitCoach — Checklist de Programação Faltante

> **Escopo complementar focado APENAS em itens que exigem código**\
> (Integre tudo ao projeto base já gerado pelo Lovable)

---

## 1. Backend / Segurança

| Prioridade                             | Item                                                    | Detalhe técnico                                                                                                          | Pronto quando…                                                      |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 🔴 Crítico                             | **Endpoint LGPD – exclusão de conta**                   | `DELETE /user` → seta `deleted_at`, anonimiza PII, revoga tokens                                                         | Retorna 204 e usuário some das queries normais (row‑level‑security) |
| 🔴 Crítico                             | **Rate‑limit e brute‑force**                            | Middleware Express (e.g. `rate-limiter-flexible`) – 100 req/15 min por IP; apply only to auth routes                     | 429 para excesso, acessos legítimos OK                              |
| 🔴 Crítico                             | **CSRF & CORS lock**                                    | Adicionar `helmet`, tokens CSRF para rotas `POST /stripe/webhook` etc.                                                   | Tests E2E sem falha de CSRF                                         |
| 🟠 Alto                                | **2FA TOTP (trainer/admin)**                            | Campo `is2FAEnabled` em `User`; rota `/enable‑2fa`, `/verify‑2fa`                                                        | Login exige TOTP depois de senha                                    |
| 🟠 Alto                                | **Webhook **``                                          | Listener Stripe → `POST /webhooks/stripe`; on refund:  `Payment.status = refunded`, `StudentPlan.remainingSessions += X` | Unit‑test com payload de refund passa                               |
| 🟢 Médio                               | **Dynamic fee (pricing_rules)**                         | Nova tabela `pricing_rules` (`trainerId`, `method`, `markupPct`, `validFrom→To`)                                         |                                                                     |
| Alterar cálculo de `fee = base + rule` | PaymentIntent gravado com markup correto conforme regra |                                                                                                                          |                                                                     |

---

## 2. Backend / IA & Créditos

1. **Tabela **``
   ```sql
   CREATE TABLE ai_credit_ledger (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     trainer_id UUID REFERENCES trainer_profile(id),
     amount INT, -- −1 consumo / +n recarga
     type TEXT CHECK (type IN ('genDiet','genWorkout','chat')),
     used_at TIMESTAMP DEFAULT now()
   );
   ```
2. **Cron monthly** (`/jobs/reset‑credits.ts`):
   - iterate trainers; set saldo = plano.defaultCredits; insert row `+n`.
3. **Endpoint **``
   - Header: `X-Credit-Type`
   - Check saldo; if 0 → 402.
   - Call OpenAI; on success, `INSERT -1` no ledger.

---

## 3. Backend / E‑mail & Push

| Item                           | Tech       | Passo‑a‑passo                                                                                                      |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| **Mailer service**             | Resend SDK | `mailer.send(template, to, vars)`; templates: `confirm_session`, `reminder_24h`, `trial_expire`, `invite_referral` |
| **Service Worker + OneSignal** | Web SDK v9 | Init in `main.tsx`; subscribe user; backend salva `pushToken` para lembretes                                       |

---

## 4. Front‑end / UI novos

- **Admin portal **``
  - Lista trainers, botão _Impersonate_, ver logs Stripe.
- **Modal “Upgrade”** (Free → Pro)
  - Trigger quando `students > maxStudents` **ou** `thisMonthMarkup > 50`.
- **Questionário PAR‑Q**
  - Form wizard (7 perguntas); `POST /onboarding_answers`.
- **Service Worker & Manifest**
  - `manifest.json` (`display: standalone`, icons)
  - `service-worker.js` offline caching das rotas principais.

---

## 5. Testes

- **Cypress**
  - Flow: signup trainer → criar slot → signup aluno → pagamento Stripe test → agendar sessão → refund.
- **Jest unit**
  - Rate‑limit returns 429.
  - AiUse denies when saldo 0.

---

## 6. DevOps

- **Logflare** integration: Winston transport → Logflare.
- **Backup script** (pg_dump nightly) – mas código só para painel de restore opcional.
- **Dockerfile multistage** otimizado (`node:20-alpine`).

---

### DONE checklist (tick when finished)

-

> **Meta**: merge em `sprint-sec-hardening`; cobertura > 80 % statements.

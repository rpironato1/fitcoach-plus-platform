// Payment Module Types
export type TrainerPlan = 'free' | 'pro' | 'elite';

export interface PlanLimits {
  maxStudents: number;
  aiCredits: number;
  features: string[];
  feePercentage?: number; // Platform fee percentage
  monthlyPrice?: number; // Monthly price in cents
  yearlyPrice?: number; // Yearly price in cents
}

export interface PlanLimitsConfig {
  [key: string]: PlanLimits;
}

export interface Subscription {
  id: string;
  trainer_id: string;
  plan: TrainerPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, string>;
}

export interface StripeConfig {
  publishableKey: string;
  priceIds: {
    pro_monthly: string;
    pro_yearly: string;
    elite_monthly: string;
    elite_yearly: string;
  };
}

export interface CreateSubscriptionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateSubscriptionResponse {
  sessionId: string;
  url: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}
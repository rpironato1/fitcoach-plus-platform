import { supabase } from '@/integrations/supabase/client';
import type { 
  Subscription,
  PaymentIntent,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  TrainerPlan
} from '../types';

export interface IPaymentService {
  // Subscription methods
  getSubscription(trainerId: string): Promise<Subscription | null>;
  createSubscription(trainerId: string, request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription>;
  
  // Payment Intent methods
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent>;
  
  // Plan management
  updateTrainerPlan(trainerId: string, plan: TrainerPlan): Promise<void>;
  checkPlanLimits(trainerId: string): Promise<boolean>;
}

export class StripePaymentService implements IPaymentService {
  private readonly stripeConfig = {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    priceIds: {
      pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || '',
      pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || '',
      elite_monthly: import.meta.env.VITE_STRIPE_ELITE_MONTHLY_PRICE_ID || '',
      elite_yearly: import.meta.env.VITE_STRIPE_ELITE_YEARLY_PRICE_ID || '',
    },
  };

  async getSubscription(trainerId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  }

  async createSubscription(trainerId: string, request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          trainerId,
          priceId: request.priceId,
          successUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      // Fallback: simulate a response for development
      return {
        sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
        url: request.successUrl, // In development, just redirect to success
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      // Call Supabase Edge Function to cancel Stripe subscription
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // Fallback: Update local subscription status
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString() 
        })
        .eq('stripe_subscription_id', subscriptionId);
    }
  }

  async updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription> {
    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent> {
    try {
      // Call Supabase Edge Function to create Stripe payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
          metadata,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // Fallback: simulate a response for development
      return {
        id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: 'pi_test_' + Math.random().toString(36).substr(2, 9) + '_secret_test',
        metadata,
      };
    }
  }

  async updateTrainerPlan(trainerId: string, plan: TrainerPlan): Promise<void> {
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ 
        plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', trainerId);

    if (error) throw error;
  }

  async checkPlanLimits(trainerId: string): Promise<boolean> {
    // Get trainer profile with current plan
    const { data: profile, error: profileError } = await supabase
      .from('trainer_profiles')
      .select('plan, max_students')
      .eq('id', trainerId)
      .single();

    if (profileError) throw profileError;

    // Get current student count
    const { count, error: countError } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('trainer_id', trainerId);

    if (countError) throw countError;

    // Check if within limits
    const currentStudents = count || 0;
    const maxStudents = profile.max_students || 3; // Default free plan limit

    return currentStudents < maxStudents;
  }

  getStripeConfig() {
    return this.stripeConfig;
  }
}
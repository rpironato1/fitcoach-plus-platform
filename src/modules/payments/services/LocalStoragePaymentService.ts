/**
 * LocalStorage-only Payment Service
 * 
 * Provides payment and subscription services using only localStorage,
 * removing all Stripe and Supabase dependencies.
 */

import { localStorageService } from '@/services/localStorageService';
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

export class LocalStoragePaymentService implements IPaymentService {
  
  async getSubscription(trainerId: string): Promise<Subscription | null> {
    try {
      const data = localStorageService.getData();
      if (!data?.subscriptions) return null;
      
      const subscription = data.subscriptions.find(
        sub => sub.trainer_id === trainerId && sub.status === 'active'
      );
      
      return subscription || null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  async createSubscription(trainerId: string, request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      // Extract plan from priceId (mock implementation)
      let plan: TrainerPlan = 'pro';
      if (request.priceId.includes('elite')) {
        plan = 'elite';
      }
      
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const subscription: Subscription = {
        id: subscriptionId,
        trainer_id: trainerId,
        plan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancel_at_period_end: false,
        stripe_subscription_id: `stripe_${subscriptionId}`,
        stripe_customer_id: `cus_${trainerId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add subscription to localStorage
      const data = localStorageService.getData();
      if (data) {
        if (!data.subscriptions) {
          data.subscriptions = [];
        }
        data.subscriptions.push(subscription);
        localStorageService.setData(data);
      }
      
      // Update trainer plan
      await this.updateTrainerPlan(trainerId, plan);
      
      // Return mock success response
      return {
        sessionId: `cs_${subscriptionId}`,
        url: request.successUrl, // In localStorage mode, redirect to success immediately
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const data = localStorageService.getData();
      if (!data?.subscriptions) return;
      
      const subscriptionIndex = data.subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (subscriptionIndex >= 0) {
        data.subscriptions[subscriptionIndex].status = 'canceled';
        data.subscriptions[subscriptionIndex].cancel_at_period_end = true;
        data.subscriptions[subscriptionIndex].updated_at = new Date().toISOString();
        
        localStorageService.setData(data);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<Subscription>): Promise<Subscription> {
    try {
      const data = localStorageService.getData();
      if (!data?.subscriptions) {
        throw new Error('No subscriptions found');
      }
      
      const subscriptionIndex = data.subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (subscriptionIndex < 0) {
        throw new Error('Subscription not found');
      }
      
      data.subscriptions[subscriptionIndex] = {
        ...data.subscriptions[subscriptionIndex],
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      
      localStorageService.setData(data);
      return data.subscriptions[subscriptionIndex];
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent> {
    try {
      // Mock payment intent for localStorage mode
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        status: 'succeeded', // Always succeed in localStorage mode
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        metadata,
      };
      
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async updateTrainerPlan(trainerId: string, plan: TrainerPlan): Promise<void> {
    try {
      const data = localStorageService.getData();
      if (!data?.trainer_profiles) return;
      
      const trainerIndex = data.trainer_profiles.findIndex(trainer => trainer.id === trainerId);
      if (trainerIndex >= 0) {
        data.trainer_profiles[trainerIndex].plan = plan;
        
        // Update plan limits
        const planLimits = this.getPlanLimits(plan);
        data.trainer_profiles[trainerIndex].max_students = planLimits.maxStudents;
        data.trainer_profiles[trainerIndex].ai_credits = planLimits.aiCredits;
        data.trainer_profiles[trainerIndex].updated_at = new Date().toISOString();
        
        localStorageService.setData(data);
      }
    } catch (error) {
      console.error('Error updating trainer plan:', error);
      throw error;
    }
  }

  async checkPlanLimits(trainerId: string): Promise<boolean> {
    try {
      const data = localStorageService.getData();
      if (!data?.trainer_profiles) return false;
      
      const trainer = data.trainer_profiles.find(t => t.id === trainerId);
      if (!trainer) return false;
      
      const studentCount = data.student_profiles?.filter(s => s.trainer_id === trainerId).length || 0;
      
      return studentCount < trainer.max_students;
    } catch (error) {
      console.error('Error checking plan limits:', error);
      return false;
    }
  }

  private getPlanLimits(plan: TrainerPlan) {
    const limits = {
      free: { maxStudents: 3, aiCredits: 10 },
      pro: { maxStudents: 15, aiCredits: 100 },
      elite: { maxStudents: 50, aiCredits: 500 },
    };
    
    return limits[plan];
  }
}
import { container } from '@/core';
import { SupabaseAuthService, SupabaseProfileService } from '@/modules/auth/services/AuthService';
import { SupabaseWorkoutService } from '@/modules/workouts/services/WorkoutService';
import { StripePaymentService } from '@/modules/payments/services/PaymentService';
import { OpenAIService } from '@/modules/ai/services/AIService';
import { SupabaseSecurityService } from '@/modules/security/services/SecurityService';

// Setup all modules' dependencies
export function setupModules() {
  // Auth module dependencies
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
  
  // Workouts module dependencies
  container.bind('WorkoutService').to(SupabaseWorkoutService);
  
  // Payments module dependencies
  container.bind('PaymentService').to(StripePaymentService);
  
  // AI module dependencies
  container.bind('AIService').to(OpenAIService);
  
  // Security module dependencies
  container.bind('SecurityService').to(SupabaseSecurityService);
}
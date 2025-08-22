import { container } from '@/core';
import { SupabaseAuthService, SupabaseProfileService } from '@/modules/auth/services/AuthService';
import { SupabaseWorkoutService } from '@/modules/workouts/services/WorkoutService';
import { StripePaymentService } from '@/modules/payments/services/PaymentService';

// Setup all modules' dependencies
export function setupModules() {
  // Auth module dependencies
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
  
  // Workouts module dependencies
  container.bind('WorkoutService').to(SupabaseWorkoutService);
  
  // Payments module dependencies
  container.bind('PaymentService').to(StripePaymentService);
  
  // Future modules will be added here
  // setupAIModule();
  // setupSecurityModule();
}
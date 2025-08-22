import { container } from '@/core';
import { SupabaseAuthService, SupabaseProfileService } from '@/modules/auth/services/AuthService';
import { LocalStorageAuthService, LocalStorageProfileService } from '@/modules/auth/services/LocalStorageAuthService';
import { SupabaseWorkoutService } from '@/modules/workouts/services/WorkoutService';
import { StripePaymentService } from '@/modules/payments/services/PaymentService';
import { OpenAIService } from '@/modules/ai/services/AIService';
import { SupabaseSecurityService } from '@/modules/security/services/SecurityService';

// Setup all modules' dependencies
export function setupModules() {
  // Check if localStorage mode is enabled
  const useLocalStorage = localStorage.getItem('use_localstorage') === 'true';
  
  // Auth module dependencies - use localStorage services in localStorage mode
  if (useLocalStorage) {
    container.bind('AuthService').to(LocalStorageAuthService);
    container.bind('ProfileService').to(LocalStorageProfileService);
  } else {
    container.bind('AuthService').to(SupabaseAuthService);
    container.bind('ProfileService').to(SupabaseProfileService);
  }
  
  // Workouts module dependencies
  container.bind('WorkoutService').to(SupabaseWorkoutService);
  
  // Payments module dependencies
  container.bind('PaymentService').to(StripePaymentService);
  
  // AI module dependencies
  container.bind('AIService').to(OpenAIService);
  
  // Security module dependencies
  container.bind('SecurityService').to(SupabaseSecurityService);
}
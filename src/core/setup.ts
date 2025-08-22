import { container } from '@/core';
import { SupabaseAuthService, SupabaseProfileService } from '@/modules/auth/services/AuthService';

// Setup all modules' dependencies
export function setupModules() {
  // Auth module dependencies
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
  
  // Future modules will be added here
  // setupWorkoutsModule();
  // setupPaymentsModule();
  // setupAIModule();
}
import { container } from "@/core";
import {
  LocalStorageAuthService,
  LocalStorageProfileService,
} from "@/modules/auth/services/LocalStorageAuthService";
import { LocalStorageWorkoutService } from "@/modules/workouts/services/LocalStorageWorkoutService";
import { LocalStoragePaymentService } from "@/modules/payments/services/LocalStoragePaymentService";
import { LocalStorageAIService } from "@/modules/ai/services/LocalStorageAIService";
import { LocalStorageSecurityService } from "@/modules/security/services/LocalStorageSecurityService";

// Setup all modules' dependencies with LocalStorage-only services
export function setupModules() {
  // Auth module dependencies
  container.bind("AuthService").to(LocalStorageAuthService);
  container.bind("ProfileService").to(LocalStorageProfileService);

  // Workouts module dependencies
  container.bind("WorkoutService").to(LocalStorageWorkoutService);

  // Payments module dependencies
  container.bind("PaymentService").to(LocalStoragePaymentService);

  // AI module dependencies
  container.bind("AIService").to(LocalStorageAIService);

  // Security module dependencies
  container.bind("SecurityService").to(LocalStorageSecurityService);
}

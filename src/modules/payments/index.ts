// Public API for Payments Module

// Hooks
export {
  useSubscription,
  useCreateSubscription,
  useCancelSubscription,
  useUpdateTrainerPlan,
  useCheckPlanLimits,
  usePlanLimits,
  useCreatePaymentIntent,
} from './hooks/usePayments';

// Services
export { StripePaymentService } from './services/PaymentService';
export type { IPaymentService } from './services/PaymentService';

// Types
export type {
  TrainerPlan,
  PlanLimits,
  PlanLimitsConfig,
  Subscription,
  PaymentIntent,
  StripeConfig,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  WebhookEvent,
} from './types';

// Utils
export {
  formatPrice,
  calculateYearlySavings,
  getPlanDisplayName,
  getPlanColor,
  isUpgrade,
  isDowngrade,
  calculatePlatformFee,
  calculateNetAmount,
  validateStudentLimit,
  getFeatureComparison,
  getRecommendedPlan,
  isTrialPeriod,
  isActiveSubscription,
  getDaysRemaining,
} from './utils';
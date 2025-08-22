// Public API for AI Module

// Hooks
export {
  useDietPlans,
  useDietPlan,
  useGenerateDietPlan,
  useWorkoutSuggestions,
  useGenerateWorkoutSuggestion,
  useAIUsageStats,
  useAIRequests,
  useCreditBalance,
  useCreditTransactions,
  useCanUseAI,
} from './hooks/useAI';

// Services
export { OpenAIService } from './services/AIService';
export type { IAIService } from './services/AIService';

// Types
export type {
  DietPlan,
  Meal,
  Ingredient,
  WorkoutSuggestion,
  ExerciseSuggestion,
  AIRequest,
  AIConfig,
  GenerateDietPlanRequest,
  GenerateWorkoutRequest,
  AIUsageStats,
  CreditTransaction,
} from './types';

// Utils
export {
  calculateDietPlanMacros,
  calculateMacroPercentages,
  validateDietPlan,
  validateWorkoutSuggestion,
  formatAIUsageStats,
  getAIFeatureCosts,
  canAffordFeature,
  estimateCreditsForDuration,
  getMuscleGroupCategories,
  getDietaryRestrictions,
  getFitnessGoals,
  formatMealType,
} from './utils';
// Public API for Workouts Module

// Hooks
export {
  useExercises,
  useCreateExercise,
  useWorkoutPlans,
  useWorkoutPlan,
  useCreateWorkoutPlan,
  useAssignWorkoutToStudent,
  useWorkoutSessions,
  useCreateWorkoutSession,
} from './hooks/useWorkouts';

// Services
export { SupabaseWorkoutService } from './services/WorkoutService';
export type { IWorkoutService } from './services/WorkoutService';

// Types
export type {
  Exercise,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  WorkoutPlanExerciseRaw,
  WorkoutSessionRaw,
} from './types';

// Utils
export {
  calculateWorkoutDuration,
  validateWorkoutPlan,
  validateExercise,
  extractMuscleGroups,
  formatWorkoutDuration,
  getDifficultyText,
} from './utils';
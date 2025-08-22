// Backward compatibility exports - re-export from workouts module
export {
  useExercises,
  useCreateExercise,
  useWorkoutPlans,
  useWorkoutPlan,
  useCreateWorkoutPlan,
  useAssignWorkoutToStudent,
  useWorkoutSessions,
  useCreateWorkoutSession,
} from '@/modules/workouts';

// Re-export types for backward compatibility
export type {
  Exercise,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
} from '@/modules/workouts';
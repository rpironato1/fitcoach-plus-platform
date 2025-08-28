import type { WorkoutPlan, Exercise, WorkoutPlanExercise } from "../types";

/**
 * Calculate the total duration of a workout plan based on exercises
 */
export function calculateWorkoutDuration(
  exercises: WorkoutPlanExercise[]
): number {
  if (!exercises || exercises.length === 0) return 0;

  const totalTimeMinutes = exercises.reduce((total, exercise) => {
    // Estimate time per set (reps + rest)
    const estimatedSecondsPerSet = 60; // Average time for exercise execution
    const restSeconds = exercise.rest_seconds || 60;
    const totalSecondsPerExercise =
      (estimatedSecondsPerSet + restSeconds) * exercise.target_sets;

    return total + totalSecondsPerExercise / 60; // Convert to minutes
  }, 0);

  return Math.round(totalTimeMinutes);
}

/**
 * Validate a workout plan before saving
 */
export function validateWorkoutPlan(plan: Partial<WorkoutPlan>): string[] {
  const errors: string[] = [];

  if (!plan.name || plan.name.trim().length < 3) {
    errors.push("Nome do treino deve ter pelo menos 3 caracteres");
  }

  if (!plan.description || plan.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres");
  }

  if (
    !plan.difficulty_level ||
    plan.difficulty_level < 1 ||
    plan.difficulty_level > 5
  ) {
    errors.push("Nível de dificuldade deve estar entre 1 e 5");
  }

  if (!plan.muscle_groups || plan.muscle_groups.length === 0) {
    errors.push("Selecione pelo menos um grupo muscular");
  }

  if (plan.estimated_duration_minutes && plan.estimated_duration_minutes < 10) {
    errors.push("Duração estimada deve ser de pelo menos 10 minutos");
  }

  return errors;
}

/**
 * Validate an exercise before saving
 */
export function validateExercise(exercise: Partial<Exercise>): string[] {
  const errors: string[] = [];

  if (!exercise.name || exercise.name.trim().length < 3) {
    errors.push("Nome do exercício deve ter pelo menos 3 caracteres");
  }

  if (!exercise.description || exercise.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres");
  }

  if (!exercise.muscle_groups || exercise.muscle_groups.length === 0) {
    errors.push("Selecione pelo menos um grupo muscular");
  }

  if (!exercise.equipment || exercise.equipment.trim().length < 2) {
    errors.push("Especifique o equipamento necessário");
  }

  if (
    !exercise.difficulty_level ||
    exercise.difficulty_level < 1 ||
    exercise.difficulty_level > 5
  ) {
    errors.push("Nível de dificuldade deve estar entre 1 e 5");
  }

  if (!exercise.instructions || exercise.instructions.trim().length < 20) {
    errors.push("Instruções devem ter pelo menos 20 caracteres");
  }

  return errors;
}

/**
 * Get muscle groups from exercises
 */
export function extractMuscleGroups(
  exercises: WorkoutPlanExercise[]
): string[] {
  const muscleGroups = new Set<string>();

  exercises.forEach((exercise) => {
    exercise.exercise.muscle_groups.forEach((group) => {
      muscleGroups.add(group);
    });
  });

  return Array.from(muscleGroups);
}

/**
 * Format workout duration for display
 */
export function formatWorkoutDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Get difficulty level text
 */
export function getDifficultyText(level: number): string {
  const difficulties = {
    1: "Iniciante",
    2: "Fácil",
    3: "Intermediário",
    4: "Avançado",
    5: "Especialista",
  };

  return difficulties[level as keyof typeof difficulties] || "Indefinido";
}

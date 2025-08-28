import type { DietPlan, Meal, WorkoutSuggestion, AIUsageStats } from "../types";

/**
 * Calculate total macros for a diet plan
 */
export function calculateDietPlanMacros(meals: Meal[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(
  protein: number,
  carbs: number,
  fat: number
): {
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
} {
  const totalCalories = protein * 4 + carbs * 4 + fat * 9;

  if (totalCalories === 0) {
    return { proteinPercentage: 0, carbsPercentage: 0, fatPercentage: 0 };
  }

  return {
    proteinPercentage: Math.round(((protein * 4) / totalCalories) * 100),
    carbsPercentage: Math.round(((carbs * 4) / totalCalories) * 100),
    fatPercentage: Math.round(((fat * 9) / totalCalories) * 100),
  };
}

/**
 * Validate diet plan completeness
 */
export function validateDietPlan(dietPlan: Partial<DietPlan>): string[] {
  const errors: string[] = [];

  if (!dietPlan.title || dietPlan.title.trim().length < 3) {
    errors.push("Título do plano deve ter pelo menos 3 caracteres");
  }

  if (!dietPlan.description || dietPlan.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres");
  }

  if (!dietPlan.target_calories || dietPlan.target_calories < 800) {
    errors.push("Meta de calorias deve ser pelo menos 800 kcal");
  }

  if (!dietPlan.duration_days || dietPlan.duration_days < 1) {
    errors.push("Duração deve ser de pelo menos 1 dia");
  }

  if (!dietPlan.student_id) {
    errors.push("Aluno deve ser selecionado");
  }

  return errors;
}

/**
 * Validate workout suggestion
 */
export function validateWorkoutSuggestion(
  workout: Partial<WorkoutSuggestion>
): string[] {
  const errors: string[] = [];

  if (!workout.title || workout.title.trim().length < 3) {
    errors.push("Título do treino deve ter pelo menos 3 caracteres");
  }

  if (!workout.description || workout.description.trim().length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres");
  }

  if (
    !workout.difficulty_level ||
    workout.difficulty_level < 1 ||
    workout.difficulty_level > 5
  ) {
    errors.push("Nível de dificuldade deve estar entre 1 e 5");
  }

  if (
    !workout.estimated_duration_minutes ||
    workout.estimated_duration_minutes < 10
  ) {
    errors.push("Duração estimada deve ser de pelo menos 10 minutos");
  }

  if (!workout.muscle_groups || workout.muscle_groups.length === 0) {
    errors.push("Selecione pelo menos um grupo muscular");
  }

  return errors;
}

/**
 * Format AI usage statistics for display
 */
export function formatAIUsageStats(stats: AIUsageStats): {
  formattedStats: Array<{ label: string; value: string }>;
  recommendations: string[];
} {
  const formattedStats = [
    { label: "Total de Solicitações", value: stats.total_requests.toString() },
    { label: "Créditos Utilizados", value: stats.credits_used.toString() },
    { label: "Créditos Restantes", value: stats.credits_remaining.toString() },
    { label: "Recurso Mais Usado", value: stats.most_used_feature },
    { label: "Taxa de Sucesso", value: `${stats.success_rate.toFixed(1)}%` },
  ];

  const recommendations: string[] = [];

  if (stats.credits_remaining < 10) {
    recommendations.push(
      "Considere adquirir mais créditos para continuar usando recursos de IA"
    );
  }

  if (stats.success_rate < 80) {
    recommendations.push(
      "Tente ser mais específico nas suas solicitações para melhorar a qualidade"
    );
  }

  if (stats.credits_remaining > 50) {
    recommendations.push(
      "Você tem créditos suficientes! Experimente gerar mais planos de dieta"
    );
  }

  return { formattedStats, recommendations };
}

/**
 * Get credit cost for different AI features
 */
export function getAIFeatureCosts(): Record<
  string,
  { credits: number; description: string }
> {
  return {
    diet_plan: {
      credits: 5,
      description: "Gerar plano de dieta personalizado completo",
    },
    workout_suggestion: {
      credits: 3,
      description: "Gerar sugestão de treino personalizada",
    },
    nutrition_analysis: {
      credits: 2,
      description: "Análise nutricional de alimentos ou refeições",
    },
  };
}

/**
 * Check if user has enough credits for a feature
 */
export function canAffordFeature(
  creditBalance: number,
  featureType: string
): boolean {
  const costs = getAIFeatureCosts();
  const feature = costs[featureType];
  return feature ? creditBalance >= feature.credits : false;
}

/**
 * Calculate estimated credits needed for a plan duration
 */
export function estimateCreditsForDuration(
  duration: number,
  featuresPerWeek: number = 2
): number {
  const weeks = Math.ceil(duration / 7);
  return weeks * featuresPerWeek * 5; // Assuming diet plans (5 credits each)
}

/**
 * Get muscle group categories for UI
 */
export function getMuscleGroupCategories(): Record<string, string[]> {
  return {
    "Membros Superiores": [
      "Peito",
      "Costas",
      "Ombros",
      "Bíceps",
      "Tríceps",
      "Antebraços",
    ],
    Core: ["Abdominais", "Oblíquos", "Lombar"],
    "Membros Inferiores": [
      "Quadríceps",
      "Posterior",
      "Glúteos",
      "Panturrilhas",
      "Tibial",
    ],
    "Corpo Todo": ["Funcionais", "Cardio", "HIIT"],
  };
}

/**
 * Get common dietary restrictions
 */
export function getDietaryRestrictions(): string[] {
  return [
    "Vegetariano",
    "Vegano",
    "Sem Glúten",
    "Sem Lactose",
    "Low Carb",
    "Cetogênica",
    "Sem Açúcar",
    "Hiperproteica",
    "Mediterrânea",
    "Paleolítica",
  ];
}

/**
 * Get common fitness goals
 */
export function getFitnessGoals(): string[] {
  return [
    "Emagrecimento",
    "Ganho de Massa Muscular",
    "Definição Muscular",
    "Resistência Cardiovascular",
    "Força",
    "Flexibilidade",
    "Reabilitação",
    "Performance Esportiva",
  ];
}

/**
 * Format meal type for display
 */
export function formatMealType(mealType: string): string {
  const types = {
    breakfast: "Café da Manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
  };

  return types[mealType as keyof typeof types] || mealType;
}

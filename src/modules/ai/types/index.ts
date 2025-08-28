// AI Module Types
export interface DietPlan {
  id: string;
  trainer_id: string;
  student_id: string;
  title: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals: Meal[];
  duration_days: number;
  created_at: string;
  is_ai_generated: boolean;
}

export interface Meal {
  id: string;
  name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  instructions: string;
  prep_time_minutes: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_unit: number;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
}

export interface WorkoutSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty_level: number;
  estimated_duration_minutes: number;
  muscle_groups: string[];
  exercises: ExerciseSuggestion[];
  is_ai_generated: boolean;
}

export interface ExerciseSuggestion {
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  instructions: string;
  video_url?: string;
}

export interface AIRequest {
  id: string;
  trainer_id: string;
  type: "diet_plan" | "workout_suggestion" | "nutrition_analysis";
  prompt: string;
  response: string;
  tokens_used: number;
  cost_credits: number;
  created_at: string;
}

export interface AIConfig {
  openai_api_key: string;
  model: string;
  max_tokens: number;
  temperature: number;
}

export interface GenerateDietPlanRequest {
  student_id: string;
  target_calories: number;
  dietary_restrictions?: string[];
  meal_preferences?: string[];
  duration_days: number;
  health_goals: string[];
}

export interface GenerateWorkoutRequest {
  difficulty_level: number;
  duration_minutes: number;
  muscle_groups: string[];
  equipment_available: string[];
  fitness_goals: string[];
}

export interface AIUsageStats {
  total_requests: number;
  credits_used: number;
  credits_remaining: number;
  most_used_feature: string;
  success_rate: number;
}

export interface CreditTransaction {
  id: string;
  trainer_id: string;
  type: "purchase" | "usage" | "refund" | "bonus";
  amount: number;
  description: string;
  ai_request_id?: string;
  created_at: string;
}

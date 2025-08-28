// Workout Module Types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string;
  difficulty_level: number;
  instructions: string;
  video_url?: string;
  is_public: boolean;
  trainer_id?: string;
}

export interface WorkoutPlan {
  id: string;
  trainer_id: string;
  name: string;
  description: string;
  difficulty_level: number;
  estimated_duration_minutes: number;
  muscle_groups: string[];
  is_template: boolean;
  student_id?: string;
  created_at: string;
  exercises?: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: string;
  exercise_id: string;
  order_in_workout: number;
  target_sets: number;
  target_reps: string;
  target_weight_kg?: number;
  rest_seconds: number;
  notes?: string;
  exercise: Exercise;
}

export interface WorkoutSession {
  id: string;
  student_id: string;
  trainer_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  completed_at?: string;
  status: string;
  duration_minutes?: number;
  notes?: string;
  rating?: number;
  workout_plan: WorkoutPlan;
  student: {
    first_name: string;
    last_name: string;
  };
}

// Internal types for raw data mapping
export interface WorkoutPlanExerciseRaw {
  id: string;
  exercise_id: string;
  order_in_workout: number;
  target_sets: number;
  target_reps: string;
  target_weight_kg?: number;
  rest_seconds: number;
  notes?: string;
  exercises: Exercise;
}

export interface WorkoutSessionRaw {
  id: string;
  student_id: string;
  trainer_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  completed_at?: string;
  status: string;
  duration_minutes?: number;
  notes?: string;
  rating?: number;
  workout_plans: WorkoutPlan;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

import { supabase } from '@/integrations/supabase/client';
import type { 
  Exercise, 
  WorkoutPlan, 
  WorkoutSession, 
  WorkoutPlanExerciseRaw,
  WorkoutSessionRaw 
} from '../types';

export interface IWorkoutService {
  // Exercise methods
  getExercises(trainerId?: string): Promise<Exercise[]>;
  createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise>;
  
  // Workout Plan methods
  getWorkoutPlans(trainerId: string): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | null>;
  createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'created_at'>): Promise<WorkoutPlan>;
  assignWorkoutToStudent(templateId: string, studentId: string, trainerId: string): Promise<WorkoutPlan>;
  
  // Workout Session methods
  getWorkoutSessions(trainerId: string): Promise<WorkoutSession[]>;
  createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'workout_plan' | 'student'>): Promise<WorkoutSession>;
}

export class SupabaseWorkoutService implements IWorkoutService {
  async getExercises(trainerId?: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`is_public.eq.true,trainer_id.eq.${trainerId}`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkoutPlans(trainerId: string): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_plan_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map((plan) => ({
      ...plan,
      exercises: plan.workout_plan_exercises?.map((wpe: WorkoutPlanExerciseRaw) => ({
        ...wpe,
        exercise: wpe.exercises,
      })) || [],
    })) || [];
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | null> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_plan_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,
      exercises: data.workout_plan_exercises?.map((wpe: WorkoutPlanExerciseRaw) => ({
        ...wpe,
        exercise: wpe.exercises,
      })) || [],
    };
  }

  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'created_at'>): Promise<WorkoutPlan> {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert([plan])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async assignWorkoutToStudent(templateId: string, studentId: string, trainerId: string): Promise<WorkoutPlan> {
    // Get the original plan with exercises
    const originalPlan = await this.getWorkoutPlan(templateId);
    if (!originalPlan) throw new Error('Template workout plan not found');

    // Create a copy for the student
    const { data: newPlan, error: planError } = await supabase
      .from('workout_plans')
      .insert([{
        trainer_id: trainerId,
        name: originalPlan.name,
        description: originalPlan.description,
        difficulty_level: originalPlan.difficulty_level,
        estimated_duration_minutes: originalPlan.estimated_duration_minutes,
        muscle_groups: originalPlan.muscle_groups,
        is_template: false,
        student_id: studentId,
      }])
      .select()
      .single();

    if (planError) throw planError;

    // Copy the exercises
    if (originalPlan.exercises && originalPlan.exercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .insert(
          originalPlan.exercises.map((exercise) => ({
            workout_plan_id: newPlan.id,
            exercise_id: exercise.exercise_id,
            order_in_workout: exercise.order_in_workout,
            target_sets: exercise.target_sets,
            target_reps: exercise.target_reps,
            target_weight_kg: exercise.target_weight_kg,
            rest_seconds: exercise.rest_seconds,
            notes: exercise.notes,
          }))
        );

      if (exercisesError) throw exercisesError;
    }

    return newPlan;
  }

  async getWorkoutSessions(trainerId: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_plans (*),
        profiles!workout_sessions_student_id_fkey (first_name, last_name)
      `)
      .eq('trainer_id', trainerId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;

    return data?.map((session: WorkoutSessionRaw) => ({
      ...session,
      workout_plan: session.workout_plans,
      student: session.profiles,
    })) || [];
  }

  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'workout_plan' | 'student'>): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([session])
      .select(`
        *,
        workout_plans (*),
        profiles!workout_sessions_student_id_fkey (first_name, last_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      workout_plan: data.workout_plans,
      student: data.profiles,
    };
  }
}
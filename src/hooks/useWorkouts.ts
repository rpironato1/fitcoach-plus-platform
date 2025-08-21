import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

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

// Exercises hooks
export function useExercises() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['exercises'],
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`is_public.eq.true,trainer_id.eq.${profile?.id}`)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (exercise: Omit<Exercise, 'id' | 'trainer_id' | 'is_public'>) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          ...exercise,
          trainer_id: profile?.id,
          is_public: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercício criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar exercício: ' + error.message);
    },
  });
}

// Workout Plans hooks
export function useWorkoutPlans() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['workout-plans', profile?.id],
    queryFn: async (): Promise<WorkoutPlan[]> => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('trainer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: ['workout-plan', id],
    queryFn: async (): Promise<WorkoutPlan> => {
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

      return {
        ...data,
        exercises: data.workout_plan_exercises.map((wpe: any) => ({
          ...wpe,
          exercise: wpe.exercises,
        })),
      };
    },
    enabled: !!id,
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (workoutPlan: {
      name: string;
      description: string;
      difficulty_level: number;
      estimated_duration_minutes: number;
      muscle_groups: string[];
      is_template: boolean;
      student_id?: string;
      exercises: Array<{
        exercise_id: string;
        order_in_workout: number;
        target_sets: number;
        target_reps: string;
        target_weight_kg?: number;
        rest_seconds: number;
        notes?: string;
      }>;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Create workout plan
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          trainer_id: profile.id,
          name: workoutPlan.name,
          description: workoutPlan.description,
          difficulty_level: workoutPlan.difficulty_level,
          estimated_duration_minutes: workoutPlan.estimated_duration_minutes,
          muscle_groups: workoutPlan.muscle_groups,
          is_template: workoutPlan.is_template,
          student_id: workoutPlan.student_id,
        }])
        .select()
        .single();

      if (planError) throw planError;

      // Add exercises to the plan
      const { error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .insert(
          workoutPlan.exercises.map(exercise => ({
            workout_plan_id: plan.id,
            ...exercise,
          }))
        );

      if (exercisesError) throw exercisesError;

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Plano de treino criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar plano de treino: ' + error.message);
    },
  });
}

export function useAssignWorkoutToStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutPlanId,
      studentId,
    }: {
      workoutPlanId: string;
      studentId: string;
    }) => {
      // First, get the original workout plan
      const { data: originalPlan, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_plan_exercises (*)
        `)
        .eq('id', workoutPlanId)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy for the student
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          trainer_id: originalPlan.trainer_id,
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
      const { error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .insert(
          originalPlan.workout_plan_exercises.map((exercise: any) => ({
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

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Treino atribuído ao aluno com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atribuir treino: ' + error.message);
    },
  });
}

// Workout Sessions hooks
export function useWorkoutSessions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['workout-sessions', profile?.id],
    queryFn: async (): Promise<WorkoutSession[]> => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_plans (*),
          profiles!workout_sessions_student_id_fkey (first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      return data?.map((session: any) => ({
        ...session,
        workout_plan: session.workout_plans,
        student: session.profiles,
      })) || [];
    },
    enabled: !!profile?.id,
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (session: {
      student_id: string;
      workout_plan_id: string;
      scheduled_date: string;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([{
          trainer_id: profile.id,
          student_id: session.student_id,
          workout_plan_id: session.workout_plan_id,
          scheduled_date: session.scheduled_date,
          status: 'scheduled',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast.success('Sessão de treino agendada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao agendar sessão: ' + error.message);
    },
  });
}
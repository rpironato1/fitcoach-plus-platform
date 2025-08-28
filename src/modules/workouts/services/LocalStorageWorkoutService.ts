/**
 * LocalStorage-only Workout Service
 *
 * Provides workout services using only localStorage,
 * removing all Supabase dependencies.
 */

import { localStorageService } from "@/services/localStorageService";
import type {
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutPlanExercise,
} from "../types";

export interface IWorkoutService {
  // Exercise methods
  getExercises(trainerId?: string): Promise<Exercise[]>;
  createExercise(
    exercise: Omit<Exercise, "id" | "created_at">
  ): Promise<Exercise>;

  // Workout Plan methods
  getWorkoutPlans(trainerId: string): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | null>;
  createWorkoutPlan(
    plan: Omit<WorkoutPlan, "id" | "created_at">
  ): Promise<WorkoutPlan>;
  assignWorkoutToStudent(
    templateId: string,
    studentId: string,
    trainerId: string
  ): Promise<WorkoutPlan>;

  // Workout Session methods
  getWorkoutSessions(trainerId: string): Promise<WorkoutSession[]>;
  createWorkoutSession(
    session: Omit<
      WorkoutSession,
      "id" | "created_at" | "workout_plan" | "student"
    >
  ): Promise<WorkoutSession>;
}

export class LocalStorageWorkoutService implements IWorkoutService {
  async getExercises(trainerId?: string): Promise<Exercise[]> {
    try {
      const data = localStorageService.getData();
      if (!data?.exercises) return [];

      // Return public exercises and trainer's own exercises
      return data.exercises
        .filter(
          (exercise) => exercise.is_public || exercise.trainer_id === trainerId
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error getting exercises:", error);
      return [];
    }
  }

  async createExercise(
    exercise: Omit<Exercise, "id" | "created_at">
  ): Promise<Exercise> {
    try {
      const newExercise: Exercise = {
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...exercise,
      };

      const data = localStorageService.getData();
      if (data) {
        if (!data.exercises) data.exercises = [];
        data.exercises.push(newExercise);
        localStorageService.setData(data);
      }

      return newExercise;
    } catch (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }
  }

  async getWorkoutPlans(trainerId: string): Promise<WorkoutPlan[]> {
    try {
      const data = localStorageService.getData();
      if (!data?.workout_plans) return [];

      return data.workout_plans
        .filter((plan) => plan.trainer_id === trainerId)
        .map((plan) => this.enrichWorkoutPlanWithExercises(plan, data))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch (error) {
      console.error("Error getting workout plans:", error);
      return [];
    }
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | null> {
    try {
      const data = localStorageService.getData();
      if (!data?.workout_plans) return null;

      const plan = data.workout_plans.find((p) => p.id === id);
      if (!plan) return null;

      return this.enrichWorkoutPlanWithExercises(plan, data);
    } catch (error) {
      console.error("Error getting workout plan:", error);
      return null;
    }
  }

  async createWorkoutPlan(
    plan: Omit<WorkoutPlan, "id" | "created_at">
  ): Promise<WorkoutPlan> {
    try {
      const newPlan: WorkoutPlan = {
        id: `workout_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        ...plan,
      };

      const data = localStorageService.getData();
      if (data) {
        if (!data.workout_plans) data.workout_plans = [];
        data.workout_plans.push(newPlan);
        localStorageService.setData(data);
      }

      return newPlan;
    } catch (error) {
      console.error("Error creating workout plan:", error);
      throw error;
    }
  }

  async assignWorkoutToStudent(
    templateId: string,
    studentId: string,
    trainerId: string
  ): Promise<WorkoutPlan> {
    try {
      const data = localStorageService.getData();
      if (!data?.workout_plans) throw new Error("Workout plan not found");

      const template = data.workout_plans.find((p) => p.id === templateId);
      if (!template) throw new Error("Template not found");

      const assignedPlan: WorkoutPlan = {
        ...template,
        id: `workout_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        student_id: studentId,
        is_template: false,
        created_at: new Date().toISOString(),
      };

      data.workout_plans.push(assignedPlan);
      localStorageService.setData(data);

      return assignedPlan;
    } catch (error) {
      console.error("Error assigning workout to student:", error);
      throw error;
    }
  }

  async getWorkoutSessions(trainerId: string): Promise<WorkoutSession[]> {
    try {
      const data = localStorageService.getData();
      if (!data?.workout_sessions) return [];

      return data.workout_sessions
        .filter((session) => session.trainer_id === trainerId)
        .sort(
          (a, b) =>
            new Date(b.scheduled_date).getTime() -
            new Date(a.scheduled_date).getTime()
        );
    } catch (error) {
      console.error("Error getting workout sessions:", error);
      return [];
    }
  }

  async createWorkoutSession(
    session: Omit<
      WorkoutSession,
      "id" | "created_at" | "workout_plan" | "student"
    >
  ): Promise<WorkoutSession> {
    try {
      const newSession: WorkoutSession = {
        id: `workout_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        ...session,
      };

      const data = localStorageService.getData();
      if (data) {
        if (!data.workout_sessions) data.workout_sessions = [];
        data.workout_sessions.push(newSession);
        localStorageService.setData(data);
      }

      return newSession;
    } catch (error) {
      console.error("Error creating workout session:", error);
      throw error;
    }
  }

  private enrichWorkoutPlanWithExercises(
    plan: WorkoutPlan,
    data: Record<string, unknown>
  ): WorkoutPlan {
    if (!data?.workout_plan_exercises || !data?.exercises) {
      return plan;
    }

    const planExercises = (
      data.workout_plan_exercises as Array<Record<string, unknown>>
    )
      .filter((pe: Record<string, unknown>) => pe.workout_plan_id === plan.id)
      .map((pe: Record<string, unknown>) => {
        const exercise = (data.exercises as Exercise[]).find(
          (e: Exercise) => e.id === pe.exercise_id
        );
        return {
          ...pe,
          exercise: exercise || {
            id: pe.exercise_id,
            name: "Exercício não encontrado",
            description: "",
            muscle_groups: [],
            equipment: "",
            difficulty_level: 1,
            instructions: "",
            is_public: false,
          },
        };
      })
      .sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.order_in_workout as number) - (b.order_in_workout as number)
      );

    return {
      ...plan,
      exercises: planExercises,
    };
  }
}

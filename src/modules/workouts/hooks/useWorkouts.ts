import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/LocalStorageAuthProvider";
import { toast } from "sonner";
import { container } from "@/core/container";
import type { IWorkoutService } from "../services/WorkoutService";
import type { Exercise, WorkoutPlan, WorkoutSession } from "../types";

// Get workout service from DI container
const getWorkoutService = (): IWorkoutService => {
  return container.resolve<IWorkoutService>("WorkoutService");
};

// Exercise hooks
export function useExercises() {
  const { profile } = useAuth();
  const workoutService = getWorkoutService();

  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => workoutService.getExercises(profile?.id),
    enabled: !!profile?.id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const workoutService = getWorkoutService();

  return useMutation({
    mutationFn: (exercise: Omit<Exercise, "id">) =>
      workoutService.createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercício criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar exercício: " + error.message);
    },
  });
}

// Workout Plan hooks
export function useWorkoutPlans() {
  const { profile } = useAuth();
  const workoutService = getWorkoutService();

  return useQuery({
    queryKey: ["workout-plans", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return workoutService.getWorkoutPlans(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useWorkoutPlan(id: string) {
  const workoutService = getWorkoutService();

  return useQuery({
    queryKey: ["workout-plan", id],
    queryFn: () => workoutService.getWorkoutPlan(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();
  const workoutService = getWorkoutService();

  return useMutation({
    mutationFn: (plan: Omit<WorkoutPlan, "id" | "created_at">) =>
      workoutService.createWorkoutPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano de treino criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar plano de treino: " + error.message);
    },
  });
}

export function useAssignWorkoutToStudent() {
  const queryClient = useQueryClient();
  const workoutService = getWorkoutService();

  return useMutation({
    mutationFn: ({
      templateId,
      studentId,
      trainerId,
    }: {
      templateId: string;
      studentId: string;
      trainerId: string;
    }) =>
      workoutService.assignWorkoutToStudent(templateId, studentId, trainerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Treino atribuído ao aluno com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atribuir treino: " + error.message);
    },
  });
}

// Workout Session hooks
export function useWorkoutSessions() {
  const { profile } = useAuth();
  const workoutService = getWorkoutService();

  return useQuery({
    queryKey: ["workout-sessions", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return workoutService.getWorkoutSessions(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  const workoutService = getWorkoutService();

  return useMutation({
    mutationFn: (
      session: Omit<
        WorkoutSession,
        "id" | "created_at" | "workout_plan" | "student"
      >
    ) => workoutService.createWorkoutSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      toast.success("Sessão de treino criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar sessão de treino: " + error.message);
    },
  });
}

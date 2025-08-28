import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import { container } from "@/core/container";
import type { IAIService } from "../services/AIService";
import type { GenerateDietPlanRequest, GenerateWorkoutRequest } from "../types";

// Get AI service from DI container
const getAIService = (): IAIService => {
  return container.resolve<IAIService>("AIService");
};

// Diet Plan hooks
export function useDietPlans() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["diet-plans", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getDietPlans(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useDietPlan(id: string) {
  const aiService = getAIService();

  return useQuery({
    queryKey: ["diet-plan", id],
    queryFn: () => aiService.getDietPlan(id),
    enabled: !!id,
  });
}

export function useGenerateDietPlan() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const aiService = getAIService();

  return useMutation({
    mutationFn: (request: GenerateDietPlanRequest) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.generateDietPlan(profile.id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
      queryClient.invalidateQueries({ queryKey: ["ai-usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      toast.success("Plano de dieta gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar plano de dieta: " + error.message);
    },
  });
}

// Workout Suggestion hooks
export function useWorkoutSuggestions() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["workout-suggestions", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getWorkoutSuggestions(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useGenerateWorkoutSuggestion() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const aiService = getAIService();

  return useMutation({
    mutationFn: (request: GenerateWorkoutRequest) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.generateWorkoutSuggestion(profile.id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["ai-usage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      toast.success("Sugestão de treino gerada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar sugestão de treino: " + error.message);
    },
  });
}

// AI Usage hooks
export function useAIUsageStats() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["ai-usage-stats", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getAIUsageStats(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useAIRequests() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["ai-requests", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getAIRequests(profile.id);
    },
    enabled: !!profile?.id,
  });
}

// Credits hooks
export function useCreditBalance() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["credit-balance", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getCreditBalance(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useCreditTransactions() {
  const { profile } = useAuth();
  const aiService = getAIService();

  return useQuery({
    queryKey: ["credit-transactions", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return aiService.getCreditTransactions(profile.id);
    },
    enabled: !!profile?.id,
  });
}

// Utility hooks for AI features
export function useCanUseAI() {
  const { data: creditBalance } = useCreditBalance();
  const { trainerProfile } = useAuth();

  return {
    canUseDietPlan: (creditBalance || 0) >= 5,
    canUseWorkoutSuggestion: (creditBalance || 0) >= 3,
    hasActiveSubscription: ["pro", "elite"].includes(
      trainerProfile?.plan || "free"
    ),
    creditBalance: creditBalance || 0,
  };
}

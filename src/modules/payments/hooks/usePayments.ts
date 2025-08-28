import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import { container } from "@/core/container";
import type { IPaymentService } from "../services/PaymentService";
import type { CreateSubscriptionRequest, TrainerPlan } from "../types";

// Get payment service from DI container
const getPaymentService = (): IPaymentService => {
  return container.resolve<IPaymentService>("PaymentService");
};

// Subscription hooks
export function useSubscription() {
  const { profile } = useAuth();
  const paymentService = getPaymentService();

  return useQuery({
    queryKey: ["subscription", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return paymentService.getSubscription(profile.id);
    },
    enabled: !!profile?.id,
  });
}

export function useCreateSubscription() {
  const { profile } = useAuth();
  const paymentService = getPaymentService();

  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return paymentService.createSubscription(profile.id, request);
    },
    onSuccess: (data) => {
      toast.success("Redirecionando para o checkout...");
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar assinatura: " + error.message);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const paymentService = getPaymentService();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      paymentService.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura cancelada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar assinatura: " + error.message);
    },
  });
}

// Plan management hooks
export function useUpdateTrainerPlan() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const paymentService = getPaymentService();

  return useMutation({
    mutationFn: (plan: TrainerPlan) => {
      if (!profile?.id) throw new Error("User not authenticated");
      return paymentService.updateTrainerPlan(profile.id, plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plano atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar plano: " + error.message);
    },
  });
}

export function useCheckPlanLimits() {
  const { profile } = useAuth();
  const paymentService = getPaymentService();

  return useQuery({
    queryKey: ["plan-limits", profile?.id],
    queryFn: () => {
      if (!profile?.id) throw new Error("User not authenticated");
      return paymentService.checkPlanLimits(profile.id);
    },
    enabled: !!profile?.id,
  });
}

// Plan limits hook (migrated from usePlanLimits.ts)
export function usePlanLimits() {
  const { trainerProfile } = useAuth();

  const planLimits = {
    free: {
      maxStudents: 3,
      aiCredits: 0,
      features: ["Gestão básica de alunos", "Agendamento simples"],
      feePercentage: 1.5, // 1.5% platform fee
      monthlyPrice: 0,
      yearlyPrice: 0,
    },
    pro: {
      maxStudents: 40,
      aiCredits: 50,
      features: [
        "Até 40 alunos",
        "50 créditos IA/mês",
        "Planos de dieta com IA",
      ],
      feePercentage: 1.0, // 1.0% platform fee
      monthlyPrice: 2900, // R$ 29.90 in cents
      yearlyPrice: 29000, // R$ 290.00 in cents (2 months free)
    },
    elite: {
      maxStudents: 0, // Unlimited
      aiCredits: 100,
      features: [
        "Alunos ilimitados",
        "100 créditos IA/mês",
        "Recursos avançados",
      ],
      feePercentage: 0.5, // 0.5% platform fee
      monthlyPrice: 4900, // R$ 49.90 in cents
      yearlyPrice: 49000, // R$ 490.00 in cents (2 months free)
    },
  };

  const currentPlan = trainerProfile?.plan || "free";
  const limits = planLimits[currentPlan];

  return {
    currentPlan,
    limits,
    planLimits,
    maxStudents: trainerProfile?.max_students || limits.maxStudents,
    aiCredits: trainerProfile?.ai_credits || limits.aiCredits,
    canAddStudents: (currentStudentCount: number) => {
      if (currentPlan === "elite") return true;
      return (
        currentStudentCount <
        (trainerProfile?.max_students || limits.maxStudents)
      );
    },
    canUseAI: () => (trainerProfile?.ai_credits || 0) > 0,
    getPlatformFee: () => limits.feePercentage || 1.5,
  };
}

// Payment intent hooks
export function useCreatePaymentIntent() {
  const paymentService = getPaymentService();

  return useMutation({
    mutationFn: ({
      amount,
      currency,
      metadata,
    }: {
      amount: number;
      currency: string;
      metadata?: Record<string, string>;
    }) => paymentService.createPaymentIntent(amount, currency, metadata),
    onError: (error) => {
      toast.error("Erro ao criar intenção de pagamento: " + error.message);
    },
  });
}

import type { TrainerPlan, PlanLimits } from '../types';

/**
 * Format price in cents to Brazilian Real
 */
export function formatPrice(priceInCents: number): string {
  const priceInReais = priceInCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceInReais);
}

/**
 * Calculate yearly savings compared to monthly plan
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyYearTotal = monthlyPrice * 12;
  return monthlyYearTotal - yearlyPrice;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: TrainerPlan): string {
  const planNames = {
    free: 'Plano Gratuito',
    pro: 'Plano Pro',
    elite: 'Plano Elite',
  };
  
  return planNames[plan] || 'Plano Desconhecido';
}

/**
 * Get plan color for UI
 */
export function getPlanColor(plan: TrainerPlan): string {
  const planColors = {
    free: 'gray',
    pro: 'blue',
    elite: 'purple',
  };
  
  return planColors[plan] || 'gray';
}

/**
 * Check if plan is upgrade from current plan
 */
export function isUpgrade(currentPlan: TrainerPlan, targetPlan: TrainerPlan): boolean {
  const planHierarchy = { free: 0, pro: 1, elite: 2 };
  return planHierarchy[targetPlan] > planHierarchy[currentPlan];
}

/**
 * Check if plan is downgrade from current plan
 */
export function isDowngrade(currentPlan: TrainerPlan, targetPlan: TrainerPlan): boolean {
  const planHierarchy = { free: 0, pro: 1, elite: 2 };
  return planHierarchy[targetPlan] < planHierarchy[currentPlan];
}

/**
 * Calculate platform fee for a transaction amount
 */
export function calculatePlatformFee(amount: number, feePercentage: number): number {
  return Math.round(amount * (feePercentage / 100));
}

/**
 * Calculate trainer's net amount after platform fee
 */
export function calculateNetAmount(grossAmount: number, feePercentage: number): number {
  const fee = calculatePlatformFee(grossAmount, feePercentage);
  return grossAmount - fee;
}

/**
 * Validate if student count is within plan limits
 */
export function validateStudentLimit(currentCount: number, plan: TrainerPlan, limits: PlanLimits): boolean {
  if (plan === 'elite') return true; // Elite has unlimited students
  return currentCount < limits.maxStudents;
}

/**
 * Get features comparison between plans
 */
export function getFeatureComparison(): Record<string, Record<TrainerPlan, boolean | string>> {
  return {
    'Gestão de alunos': {
      free: 'Até 3 alunos',
      pro: 'Até 40 alunos',
      elite: 'Ilimitado',
    },
    'Criação de treinos': {
      free: true,
      pro: true,
      elite: true,
    },
    'Agendamento': {
      free: true,
      pro: true,
      elite: true,
    },
    'Planos de dieta com IA': {
      free: false,
      pro: '50 créditos/mês',
      elite: '100 créditos/mês',
    },
    'Taxa da plataforma': {
      free: '1.5%',
      pro: '1.0%',
      elite: '0.5%',
    },
    'Suporte prioritário': {
      free: false,
      pro: true,
      elite: true,
    },
    'Recursos avançados': {
      free: false,
      pro: false,
      elite: true,
    },
  };
}

/**
 * Get recommended plan based on student count
 */
export function getRecommendedPlan(studentCount: number): TrainerPlan {
  if (studentCount <= 3) return 'free';
  if (studentCount <= 40) return 'pro';
  return 'elite';
}

/**
 * Check if subscription is in trial period
 */
export function isTrialPeriod(subscription: Record<string, unknown>): boolean {
  if (!subscription) return false;
  return subscription.status === 'trialing';
}

/**
 * Check if subscription is active
 */
export function isActiveSubscription(subscription: Record<string, unknown>): boolean {
  if (!subscription) return false;
  return ['active', 'trialing'].includes(subscription.status as string);
}

/**
 * Get days remaining in trial or subscription
 */
export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
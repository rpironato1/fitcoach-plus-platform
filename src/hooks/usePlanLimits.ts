
import { useAuth } from '@/components/auth/AuthProvider';

export function usePlanLimits() {
  const { trainerProfile } = useAuth();

  const planLimits = {
    free: {
      maxStudents: 3,
      aiCredits: 0,
      features: ['Gestão básica de alunos', 'Agendamento simples']
    },
    pro: {
      maxStudents: 40,
      aiCredits: 50,
      features: ['Até 40 alunos', '50 créditos IA/mês', 'Planos de dieta com IA']
    },
    elite: {
      maxStudents: 0, // Ilimitado
      aiCredits: 100,
      features: ['Alunos ilimitados', '100 créditos IA/mês', 'Recursos avançados']
    }
  };

  const currentPlan = trainerProfile?.plan || 'free';
  const limits = planLimits[currentPlan];

  return {
    currentPlan,
    limits,
    maxStudents: trainerProfile?.max_students || limits.maxStudents,
    aiCredits: trainerProfile?.ai_credits || limits.aiCredits,
    canAddStudents: (currentStudentCount: number) => {
      if (currentPlan === 'elite') return true;
      return currentStudentCount < (trainerProfile?.max_students || limits.maxStudents);
    },
    canUseAI: () => (trainerProfile?.ai_credits || 0) > 0
  };
}

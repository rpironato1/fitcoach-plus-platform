
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePlanLimits() {
  const { profile, trainerProfile } = useAuth();

  const { data: limits } = useQuery({
    queryKey: ['plan-limits', profile?.id],
    queryFn: async () => {
      if (!profile?.id || !trainerProfile) return null;

      // Buscar número atual de alunos ativos
      const { data: activeStudents } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('trainer_id', profile.id)
        .eq('status', 'active');

      const currentStudents = activeStudents?.length || 0;

      // Verificar limites baseados no plano
      const limits = {
        free: { maxStudents: 3, aiCredits: 0 },
        pro: { maxStudents: 40, aiCredits: 50 },
        elite: { maxStudents: 0, aiCredits: 0 }, // 0 = ilimitado
      };

      const planLimits = limits[trainerProfile.plan];

      return {
        currentStudents,
        maxStudents: planLimits.maxStudents,
        canAddStudents: planLimits.maxStudents === 0 || currentStudents < planLimits.maxStudents,
        studentsLimitReached: planLimits.maxStudents > 0 && currentStudents >= planLimits.maxStudents,
        aiCredits: trainerProfile.ai_credits,
        hasAiCredits: trainerProfile.plan === 'elite' || trainerProfile.ai_credits > 0,
        plan: trainerProfile.plan,
      };
    },
    enabled: !!profile?.id && !!trainerProfile,
  });

  return limits;
}

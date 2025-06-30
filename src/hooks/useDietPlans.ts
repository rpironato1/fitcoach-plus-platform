
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface DietPlan {
  id: string;
  name: string;
  total_calories: number | null;
  is_paid: boolean;
  content: any;
  created_at: string;
  student: {
    first_name: string;
    last_name: string;
  };
}

export function useDietPlans() {
  const { profile, trainerProfile } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar alunos
  const { data: students } = useQuery({
    queryKey: ['students-for-diet', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Primeiro buscar os student_profiles ativos
      const { data: studentProfiles, error } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('trainer_id', profile.id)
        .eq('status', 'active');

      if (error) throw error;

      if (!studentProfiles || studentProfiles.length === 0) return [];

      // Buscar os perfis dos alunos
      const studentIds = studentProfiles.map(sp => sp.id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      return profiles?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      })) || [];
    },
    enabled: !!profile?.id,
  });

  // Query para buscar planos de dieta
  const { data: dietPlans, isLoading } = useQuery({
    queryKey: ['diet-plans', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Buscar planos de dieta
      const { data: plansData, error } = await supabase
        .from('diet_plans')
        .select(`
          id,
          name,
          total_calories,
          is_paid,
          content,
          created_at,
          student_id
        `)
        .eq('trainer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!plansData || plansData.length === 0) return [];

      // Buscar perfis dos estudantes
      const studentIds = [...new Set(plansData.map(p => p.student_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      return plansData.map(plan => {
        const studentProfile = profiles?.find(p => p.id === plan.student_id);
        return {
          id: plan.id,
          name: plan.name,
          total_calories: plan.total_calories,
          is_paid: plan.is_paid,
          content: plan.content,
          created_at: plan.created_at,
          student: {
            first_name: studentProfile?.first_name || '',
            last_name: studentProfile?.last_name || '',
          },
        };
      });
    },
    enabled: !!profile?.id,
  });

  // Mutation para criar plano de dieta com IA
  const createDietPlanMutation = useMutation({
    mutationFn: async (dietData: {
      student_id: string;
      name: string;
      target_calories: number;
      goal: string;
      restrictions: string;
      preferences: string;
    }) => {
      // Verificar se precisa de pagamento (plano Free)
      const needsPayment = trainerProfile?.plan === 'free';
      
      if (needsPayment) {
        // Criar PaymentIntent para dieta avulsa
        const { data: paymentIntent, error: paymentError } = await supabase
          .from('payment_intents')
          .insert({
            student_id: dietData.student_id,
            trainer_id: profile!.id,
            amount: 7.90,
            method: 'pix',
            fee_percent: 0,
            status: 'pending',
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // Simular pagamento aprovado para demonstração
        await supabase
          .from('payment_intents')
          .update({ status: 'succeeded' })
          .eq('id', paymentIntent.id);
      }

      // Verificar créditos de IA
      if (trainerProfile?.ai_credits === 0 && trainerProfile?.plan !== 'elite') {
        throw new Error('Você não possui créditos de IA suficientes. Faça upgrade do seu plano.');
      }

      // Gerar conteúdo da dieta com IA (simulado)
      const dietContent = {
        goal: dietData.goal,
        target_calories: dietData.target_calories,
        restrictions: dietData.restrictions,
        preferences: dietData.preferences,
        meals: [
          {
            name: 'Café da Manhã',
            calories: Math.round(dietData.target_calories * 0.25),
            foods: [
              { name: 'Aveia com frutas', calories: 200, portion: '1 xícara' },
              { name: 'Iogurte grego', calories: 100, portion: '1 pote' },
            ]
          },
          {
            name: 'Almoço',
            calories: Math.round(dietData.target_calories * 0.35),
            foods: [
              { name: 'Peito de frango grelhado', calories: 250, portion: '150g' },
              { name: 'Arroz integral', calories: 150, portion: '1 xícara' },
              { name: 'Brócolis no vapor', calories: 50, portion: '1 xícara' },
            ]
          },
          {
            name: 'Lanche da Tarde',
            calories: Math.round(dietData.target_calories * 0.15),
            foods: [
              { name: 'Castanhas', calories: 120, portion: '30g' },
              { name: 'Maçã', calories: 80, portion: '1 unidade' },
            ]
          },
          {
            name: 'Jantar',
            calories: Math.round(dietData.target_calories * 0.25),
            foods: [
              { name: 'Salmão grelhado', calories: 200, portion: '120g' },
              { name: 'Batata doce', calories: 150, portion: '1 unidade média' },
              { name: 'Salada verde', calories: 30, portion: '1 prato' },
            ]
          },
        ]
      };

      // Criar plano de dieta
      const { data, error } = await supabase
        .from('diet_plans')
        .insert({
          student_id: dietData.student_id,
          trainer_id: profile!.id,
          name: dietData.name,
          total_calories: dietData.target_calories,
          is_paid: needsPayment,
          content: dietContent,
        })
        .select()
        .single();

      if (error) throw error;

      // Descontar crédito de IA (se não for Elite)
      if (trainerProfile?.plan !== 'elite') {
        await supabase
          .from('ai_credit_ledger')
          .insert({
            trainer_id: profile!.id,
            amount: -1,
            type: 'genDiet',
          });

        // Atualizar saldo de créditos
        await supabase
          .from('trainer_profiles')
          .update({
            ai_credits: Math.max(0, (trainerProfile?.ai_credits || 0) - 1)
          })
          .eq('id', profile!.id);
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Plano de dieta criado com sucesso!",
        description: "A dieta foi gerada com IA e está disponível para o aluno.",
      });
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar plano de dieta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    students,
    dietPlans,
    isLoading,
    createDietPlan: createDietPlanMutation.mutate,
    isCreatingDiet: createDietPlanMutation.isPending,
  };
}

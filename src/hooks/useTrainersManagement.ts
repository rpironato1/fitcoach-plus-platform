
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Trainer {
  id: string;
  plan: 'free' | 'pro' | 'elite';
  max_students: number;
  ai_credits: number;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
  _count?: {
    students: number;
  };
}

export function useTrainersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: async () => {
      // Buscar trainer_profiles primeiro
      const { data: trainersData, error: trainersError } = await supabase
        .from('trainer_profiles')
        .select('*');

      if (trainersError) {
        console.error('Erro ao buscar trainers:', trainersError);
        throw trainersError;
      }

      // Buscar profiles separadamente
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      // Combinar os dados
      const trainersWithProfiles = await Promise.all(
        (trainersData || []).map(async (trainer) => {
          // Encontrar o profile correspondente
          const profile = profilesData?.find(p => p.id === trainer.id);

          // Buscar contagem de alunos
          const { count } = await supabase
            .from('student_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('trainer_id', trainer.id)
            .eq('status', 'active');

          return {
            ...trainer,
            profiles: profile || null,
            _count: { students: count || 0 }
          };
        })
      );

      return trainersWithProfiles;
    }
  });

  const updateTrainerPlan = useMutation({
    mutationFn: async ({ trainerId, plan }: { trainerId: string; plan: 'free' | 'pro' | 'elite' }) => {
      const { error } = await supabase
        .from('trainer_profiles')
        .update({ 
          plan,
          max_students: plan === 'free' ? 3 : plan === 'pro' ? 40 : 0,
          ai_credits: plan === 'free' ? 0 : plan === 'pro' ? 50 : 100
        })
        .eq('id', trainerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Plano do trainer atualizado com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar plano do trainer.',
        variant: 'destructive'
      });
    }
  });

  const deleteTrainer = useMutation({
    mutationFn: async (trainerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', trainerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Trainer removido com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover trainer.',
        variant: 'destructive'
      });
    }
  });

  const filteredTrainers = trainers?.filter(trainer => {
    if (!trainer.profiles) return false;
    
    const matchesSearch = `${trainer.profiles.first_name} ${trainer.profiles.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || trainer.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return {
    trainers,
    filteredTrainers,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    updateTrainerPlan,
    deleteTrainer
  };
}

export type { Trainer };

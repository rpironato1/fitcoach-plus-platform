
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  student: {
    first_name: string;
    last_name: string;
  };
  payment_intent_id: string | null;
}

interface CreateSessionData {
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

export function useSessions() {
  const { profile, trainerProfile } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar alunos
  const { data: students } = useQuery({
    queryKey: ['students-for-sessions', profile?.id],
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

  // Query para buscar sessões
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Buscar sessões
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          notes,
          payment_intent_id,
          student_id
        `)
        .eq('trainer_id', profile.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      if (!sessionsData || sessionsData.length === 0) return [];

      // Buscar perfis dos estudantes
      const studentIds = [...new Set(sessionsData.map(s => s.student_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      return sessionsData.map(session => {
        const studentProfile = profiles?.find(p => p.id === session.student_id);
        return {
          id: session.id,
          scheduled_at: session.scheduled_at,
          duration_minutes: session.duration_minutes,
          status: session.status,
          notes: session.notes,
          payment_intent_id: session.payment_intent_id,
          student: {
            first_name: studentProfile?.first_name || '',
            last_name: studentProfile?.last_name || '',
          },
        };
      });
    },
    enabled: !!profile?.id,
  });

  // Mutation para criar sessão
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: CreateSessionData) => {
      // Verificar se precisa de pagamento (plano Free)
      if (trainerProfile?.plan === 'free') {
        // Criar PaymentIntent primeiro
        const { data: paymentIntent, error: paymentError } = await supabase
          .from('payment_intents')
          .insert({
            student_id: sessionData.student_id,
            trainer_id: profile!.id,
            amount: 50.00, // Valor exemplo
            method: 'credit_card',
            fee_percent: 1.5,
            status: 'pending',
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // Criar sessão com payment_intent_id
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            ...sessionData,
            trainer_id: profile!.id,
            payment_intent_id: paymentIntent.id,
            status: 'payment_pending',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar sessão direto (Pro/Elite)
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            ...sessionData,
            trainer_id: profile!.id,
            status: 'scheduled',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Sessão agendada com sucesso!",
        description: trainerProfile?.plan === 'free' 
          ? "Aguardando pagamento do aluno para confirmação."
          : "A sessão foi confirmada.",
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao agendar sessão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    students,
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    isCreatingSession: createSessionMutation.isPending,
  };
}

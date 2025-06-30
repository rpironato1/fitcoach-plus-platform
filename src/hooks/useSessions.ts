
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  trainer_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string;
}

interface Student {
  id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export function useSessions() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-for-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: studentsData, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('trainer_id', profile.id)
        .eq('status', 'active');

      if (error) throw error;

      // Buscar profiles dos estudantes
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      // Combinar os dados
      const studentsWithProfiles = studentsData?.map(student => ({
        ...student,
        profiles: profilesData?.find(p => p.id === student.id) || null
      }));

      return studentsWithProfiles as Student[];
    },
    enabled: !!profile?.id
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('trainer_id', profile.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Buscar nomes dos estudantes
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      // Combinar dados das sessões com nomes dos estudantes
      const sessionsWithNames = sessionsData?.map(session => ({
        ...session,
        student_name: profilesData?.find(p => p.id === session.student_id)
          ? `${profilesData.find(p => p.id === session.student_id)?.first_name} ${profilesData.find(p => p.id === session.student_id)?.last_name}`
          : 'Aluno não encontrado'
      }));

      return sessionsWithNames as Session[];
    },
    enabled: !!profile?.id
  });

  const createSession = useMutation({
    mutationFn: async (sessionData: {
      studentId: string;
      scheduledAt: string;
      durationMinutes: number;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('sessions')
        .insert({
          trainer_id: profile!.id,
          student_id: sessionData.studentId,
          scheduled_at: sessionData.scheduledAt,
          duration_minutes: sessionData.durationMinutes,
          notes: sessionData.notes,
          status: 'scheduled'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Sessão agendada com sucesso!'
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao agendar sessão.',
        variant: 'destructive'
      });
    }
  });

  return {
    students,
    sessions,
    isLoading: studentsLoading || sessionsLoading,
    createSession: createSession.mutate,
    isCreatingSession: createSession.isPending
  };
}


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  start_date: string;
  status: 'active' | 'paused' | 'cancelled';
}

export function useStudents(profileId?: string) {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data: studentProfiles, error } = await supabase
        .from('student_profiles')
        .select('id, start_date, status')
        .eq('trainer_id', profileId);

      if (error) throw error;

      if (!studentProfiles || studentProfiles.length === 0) return [];

      const studentIds = studentProfiles.map(sp => sp.id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      const studentData = await Promise.all(
        studentProfiles.map(async (studentProfile) => {
          const studentProfileData = profiles?.find(p => p.id === studentProfile.id);
          const { data: userData } = await supabase.auth.admin.getUserById(studentProfile.id);
          
          return {
            id: studentProfile.id,
            first_name: studentProfileData?.first_name || '',
            last_name: studentProfileData?.last_name || '',
            phone: studentProfileData?.phone || null,
            email: userData.user?.email || '',
            start_date: studentProfile.start_date,
            status: studentProfile.status,
          };
        })
      );

      return studentData;
    },
    enabled: !!profileId,
  });

  const addStudentMutation = useMutation({
    mutationFn: async (studentData: { email: string; firstName: string; lastName: string; phone: string }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: 'temp123456',
        options: {
          data: {
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            role: 'student',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            id: authData.user.id,
            trainer_id: profileId!,
            status: 'active',
          });

        if (profileError) throw profileError;

        if (studentData.phone) {
          await supabase
            .from('profiles')
            .update({ phone: studentData.phone })
            .eq('id', authData.user.id);
        }
      }

      return authData;
    },
    onSuccess: () => {
      toast({
        title: "Aluno adicionado com sucesso!",
        description: "O aluno foi cadastrado e pode fazer login com a senha temporária.",
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar aluno",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: 'active' | 'paused' | 'cancelled' }) => {
      const { error } = await supabase
        .from('student_profiles')
        .update({ status })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    students,
    isLoading,
    addStudent: addStudentMutation.mutate,
    isAddingStudent: addStudentMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
  };
}

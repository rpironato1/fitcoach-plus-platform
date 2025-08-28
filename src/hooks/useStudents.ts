import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  trainer_id: string;
  status: "active" | "paused" | "cancelled";
  start_date: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
}

export function useStudents(trainerId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ["students", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];

      const { data: studentsData, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("trainer_id", trainerId);

      if (error) throw error;

      // Buscar profiles separadamente
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone");

      // Combinar os dados
      const studentsWithProfiles = studentsData?.map((student) => ({
        ...student,
        profiles: profilesData?.find((p) => p.id === student.id) || null,
      }));

      return studentsWithProfiles as Student[];
    },
    enabled: !!trainerId,
  });

  const addStudent = useMutation({
    mutationFn: async (studentData: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    }) => {
      // Primeiro criar o usuário
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: studentData.email,
          password: "tempPassword123!",
          options: {
            data: {
              first_name: studentData.firstName,
              last_name: studentData.lastName,
              phone: studentData.phone,
              role: "student",
            },
          },
        });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Criar o perfil de estudante
        const { error: studentError } = await supabase
          .from("student_profiles")
          .insert({
            id: signUpData.user.id,
            trainer_id: trainerId!,
            status: "active",
          });

        if (studentError) throw studentError;
      }

      return signUpData;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar aluno.",
        variant: "destructive",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      studentId,
      status,
    }: {
      studentId: string;
      status: "active" | "paused" | "cancelled";
    }) => {
      const { error } = await supabase
        .from("student_profiles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Status do aluno atualizado!",
      });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do aluno.",
        variant: "destructive",
      });
    },
  });

  return {
    students,
    isLoading,
    addStudent: addStudent.mutate,
    isAddingStudent: addStudent.isPending,
    updateStatus: updateStatus.mutate,
  };
}

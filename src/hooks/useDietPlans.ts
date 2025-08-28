import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorageAuth as useAuth } from "@/components/auth/LocalStorageAuthProvider";
import { useToast } from "@/hooks/use-toast";

interface DietPlan {
  id: string;
  name: string;
  student_id: string;
  trainer_id: string;
  content: unknown;
  total_calories: number | null;
  is_paid: boolean;
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

export function useDietPlans() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students-for-diets", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: studentsData, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("trainer_id", profile.id)
        .eq("status", "active");

      if (error) throw error;

      // Buscar profiles dos estudantes
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");

      // Combinar os dados
      const studentsWithProfiles = studentsData?.map((student) => ({
        ...student,
        profiles: profilesData?.find((p) => p.id === student.id) || null,
      }));

      return studentsWithProfiles as Student[];
    },
    enabled: !!profile?.id,
  });

  const { data: dietPlans, isLoading: dietsLoading } = useQuery({
    queryKey: ["diet-plans", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: dietsData, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar nomes dos estudantes
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");

      // Combinar dados dos planos com nomes dos estudantes
      const dietsWithNames = dietsData?.map((diet) => ({
        ...diet,
        student_name: profilesData?.find((p) => p.id === diet.student_id)
          ? `${profilesData.find((p) => p.id === diet.student_id)?.first_name} ${profilesData.find((p) => p.id === diet.student_id)?.last_name}`
          : "Aluno não encontrado",
      }));

      return dietsWithNames as DietPlan[];
    },
    enabled: !!profile?.id,
  });

  const createDietPlan = useMutation({
    mutationFn: async (dietData: {
      studentId: string;
      name: string;
      goals: string;
      restrictions: string;
      preferences: string;
    }) => {
      // Simular criação de plano com IA (sem integração real)
      const mockDietContent = {
        breakfast: ["Aveia com frutas", "Café preto"],
        lunch: ["Peito de frango grelhado", "Arroz integral", "Salada verde"],
        dinner: ["Salmão assado", "Batata doce", "Brócolis"],
        snacks: ["Castanhas", "Iogurte natural"],
      };

      const { error } = await supabase.from("diet_plans").insert({
        trainer_id: profile!.id,
        student_id: dietData.studentId,
        name: dietData.name,
        content: mockDietContent,
        total_calories: 2200,
        is_paid: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Plano de dieta criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["diet-plans"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar plano de dieta.",
        variant: "destructive",
      });
    },
  });

  return {
    students,
    dietPlans,
    isLoading: studentsLoading || dietsLoading,
    createDietPlan: createDietPlan.mutate,
    isCreatingDiet: createDietPlan.isPending,
  };
}

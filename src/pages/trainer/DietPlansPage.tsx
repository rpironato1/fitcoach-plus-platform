import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, Plus, Zap, DollarSign, User, Calendar } from 'lucide-react';
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

export default function DietPlansPage() {
  const { profile, trainerProfile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dietName, setDietName] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [dietGoal, setDietGoal] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
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
      setIsCreating(false);
      setSelectedStudent('');
      setDietName('');
      setTargetCalories('');
      setDietGoal('');
      setRestrictions('');
      setPreferences('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar plano de dieta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateDiet = () => {
    if (!selectedStudent || !dietName || !targetCalories || !dietGoal) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createDietPlanMutation.mutate({
      student_id: selectedStudent,
      name: dietName,
      target_calories: parseInt(targetCalories),
      goal: dietGoal,
      restrictions: restrictions,
      preferences: preferences,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Dieta</h1>
          <p className="text-gray-600">
            Crie e gerencie planos de dieta personalizados com IA
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Dieta com IA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Plano de Dieta com IA</DialogTitle>
              <DialogDescription>
                Use inteligência artificial para gerar um plano de dieta personalizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student">Aluno *</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calories">Calorias Alvo *</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder="2000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dietName">Nome da Dieta *</Label>
                <Input
                  id="dietName"
                  value={dietName}
                  onChange={(e) => setDietName(e.target.value)}
                  placeholder="Ex: Dieta para Ganho de Massa"
                />
              </div>
              <div>
                <Label htmlFor="goal">Objetivo *</Label>
                <Select value={dietGoal} onValueChange={setDietGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                    <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="restrictions">Restrições Alimentares</Label>
                <Textarea
                  id="restrictions"
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  placeholder="Ex: Intolerância à lactose, vegetariano, etc."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="preferences">Preferências</Label>
                <Textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="Ex: Gosta de peixes, não gosta de brócolis, etc."
                  rows={2}
                />
              </div>
              
              {/* Avisos baseados no plano */}
              {trainerProfile?.plan === 'free' && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Plano Free: Será cobrado R$ 7,90 do aluno por esta dieta personalizada.
                  </p>
                </div>
              )}
              
              {trainerProfile?.ai_credits === 0 && trainerProfile?.plan !== 'elite' && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Você não possui créditos de IA. Faça upgrade do seu plano para continuar.
                  </p>
                </div>
              )}
              
              {trainerProfile?.ai_credits! > 0 && trainerProfile?.plan !== 'elite' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Você possui {trainerProfile?.ai_credits} créditos de IA restantes.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateDiet}
                  disabled={createDietPlanMutation.isPending || (trainerProfile?.ai_credits === 0 && trainerProfile?.plan !== 'elite')}
                >
                  {createDietPlanMutation.isPending ? 'Gerando...' : 'Gerar Dieta com IA'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Dietas</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dietPlans?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainerProfile?.plan === 'elite' ? '∞' : trainerProfile?.ai_credits || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dietas Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dietPlans?.filter(d => d.is_paid).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos de Dieta */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Dieta Criados</CardTitle>
          <CardDescription>
            Gerencie todos os planos de dieta criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dietPlans && dietPlans.length > 0 ? (
            <div className="space-y-4">
              {dietPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {plan.student.first_name} {plan.student.last_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {plan.total_calories && (
                          <div className="flex items-center gap-1">
                            <Utensils className="h-4 w-4" />
                            {plan.total_calories} kcal
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.is_paid && (
                      <Badge className="bg-green-100 text-green-800">
                        Pago
                      </Badge>
                    )}
                    <Badge variant="outline">
                      Gerado com IA
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum plano de dieta criado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando planos de dieta personalizados com IA para seus alunos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

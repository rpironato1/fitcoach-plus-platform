
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Filter, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

export default function TrainersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: async () => {
      const { data: trainersData, error } = await supabase
        .from('trainer_profiles')
        .select(`
          *,
          profiles(first_name, last_name, phone)
        `);

      if (error) {
        console.error('Erro ao buscar trainers:', error);
        throw error;
      }

      // Buscar contagem de alunos para cada trainer
      const trainersWithCounts = await Promise.all(
        (trainersData || []).map(async (trainer) => {
          const { count } = await supabase
            .from('student_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('trainer_id', trainer.id)
            .eq('status', 'active');

          return {
            ...trainer,
            _count: { students: count || 0 }
          };
        })
      );

      return trainersWithCounts;
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

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-blue-100 text-blue-800',
    elite: 'bg-purple-100 text-purple-800',
  };

  const planNames = {
    free: 'Free',
    pro: 'Pro', 
    elite: 'Elite',
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Trainers</h1>
        <p className="text-gray-600">Administre todos os trainers cadastrados na plataforma</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar trainers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <CardTitle>Trainers Cadastrados</CardTitle>
          <CardDescription>
            Total: {filteredTrainers?.length || 0} trainers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainers?.map((trainer) => (
              <div key={trainer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {trainer.profiles ? `${trainer.profiles.first_name} ${trainer.profiles.last_name}` : 'Nome não disponível'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{trainer.profiles?.phone || 'Telefone não informado'}</span>
                      <span>{trainer._count?.students || 0} alunos</span>
                      <span>{trainer.ai_credits} créditos IA</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={planColors[trainer.plan]}>
                    {planNames[trainer.plan]}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => updateTrainerPlan.mutate({ trainerId: trainer.id, plan: 'free' })}
                      >
                        Alterar para Free
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateTrainerPlan.mutate({ trainerId: trainer.id, plan: 'pro' })}
                      >
                        Alterar para Pro
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateTrainerPlan.mutate({ trainerId: trainer.id, plan: 'elite' })}
                      >
                        Alterar para Elite
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteTrainer.mutate(trainer.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

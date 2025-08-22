
import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Users, CreditCard, Crown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'students_limit' | 'ai_credits' | 'manual';
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { profile, trainerProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite' | null>(null);
  const queryClient = useQueryClient();

  const upgradePlanMutation = useMutation({
    mutationFn: async (plan: 'pro' | 'elite') => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      // Simular upgrade (em produção, integraria com Stripe)
      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + 30); // 30 dias

      const maxStudents = plan === 'pro' ? 40 : 0; // 0 = ilimitado
      const aiCredits = plan === 'pro' ? 50 : 150;

      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          plan,
          active_until: activeUntil.toISOString(),
          max_students: maxStudents,
          ai_credits: aiCredits,
        })
        .eq('id', profile.id);

      if (error) throw error;

      return { plan, maxStudents, aiCredits };
    },
    onSuccess: (data) => {
      toast({
        title: "Plano atualizado com sucesso!",
        description: `Bem-vindo ao plano ${data.plan === 'pro' ? 'Pro' : 'Elite'}! Aproveite os novos recursos.`,
      });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startTrialMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14); // 14 dias de trial

      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          plan: 'pro',
          active_until: trialEnd.toISOString(),
          max_students: 40,
          ai_credits: 50,
        })
        .eq('id', profile.id);

      if (error) throw error;

      return trialEnd;
    },
    onSuccess: (trialEnd) => {
      toast({
        title: "Trial iniciado com sucesso!",
        description: `Você tem 14 dias para testar o plano Pro até ${trialEnd.toLocaleDateString('pt-BR')}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao iniciar trial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    if (selectedPlan) {
      upgradePlanMutation.mutate(selectedPlan);
    }
  };

  const handleStartTrial = () => {
    startTrialMutation.mutate();
  };

  const getReasonMessage = () => {
    switch (reason) {
      case 'students_limit':
        return 'Você atingiu o limite de 3 alunos do plano Free. Faça upgrade para continuar crescendo!';
      case 'ai_credits':
        return 'Você não possui créditos de IA suficientes. Faça upgrade para acessar recursos de inteligência artificial!';
      default:
        return 'Desbloqueie todo o potencial do FitCoach com nossos planos premium!';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Faça Upgrade do Seu Plano</DialogTitle>
          <DialogDescription className="text-lg">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Plano Pro */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'pro' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('pro')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Plano Pro
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
              </div>
              <CardDescription>
                Ideal para personal trainers estabelecidos
              </CardDescription>
              <div className="text-3xl font-bold">
                R$ 49,90<span className="text-sm font-normal text-gray-600">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Até 40 alunos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>50 créditos de IA/mês</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Sem taxas de pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Dietas ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Suporte prioritário</span>
              </div>
            </CardContent>
          </Card>

          {/* Plano Elite */}
          <Card 
            className={`cursor-pointer transition-all relative ${
              selectedPlan === 'elite' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('elite')}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Mais Vantajoso
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Plano Elite
                </CardTitle>
              </div>
              <CardDescription>
                Para personal trainers que querem maximizar resultados
              </CardDescription>
              <div className="text-3xl font-bold">
                R$ 99,90<span className="text-sm font-normal text-gray-600">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Alunos ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>IA ilimitada</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Cashback de 0,5% nas transações</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Relatórios avançados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Suporte VIP 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Acesso a recursos beta</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {trainerProfile?.plan === 'free' && (
              <span>Experimente grátis por 14 dias sem compromisso</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {trainerProfile?.plan === 'free' && (
              <Button
                variant="outline"
                onClick={handleStartTrial}
                disabled={startTrialMutation.isPending}
              >
                {startTrialMutation.isPending ? 'Iniciando...' : 'Trial Grátis 14 dias'}
              </Button>
            )}
            <Button
              onClick={handleUpgrade}
              disabled={!selectedPlan || upgradePlanMutation.isPending}
              className={selectedPlan === 'elite' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
            >
              {upgradePlanMutation.isPending ? 'Processando...' : 'Fazer Upgrade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

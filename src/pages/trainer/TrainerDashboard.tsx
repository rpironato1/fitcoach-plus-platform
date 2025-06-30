
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, DollarSign, Zap, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpgradeModal } from '@/components/trainer/UpgradeModal';

export default function TrainerDashboard() {
  const { profile, trainerProfile } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'students_limit' | 'ai_credits' | 'manual'>('manual');

  // Query para buscar estatísticas do trainer
  const { data: stats } = useQuery({
    queryKey: ['trainer-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const [studentsResult, sessionsResult, paymentsResult] = await Promise.all([
        supabase
          .from('student_profiles')
          .select('*')
          .eq('trainer_id', profile.id)
          .eq('status', 'active'),
        supabase
          .from('sessions')
          .select('*')
          .eq('trainer_id', profile.id)
          .gte('scheduled_at', new Date().toISOString()),
        supabase
          .from('payment_intents')
          .select('*')
          .eq('trainer_id', profile.id)
          .eq('status', 'succeeded')
      ]);

      return {
        activeStudents: studentsResult.data?.length || 0,
        upcomingSessions: sessionsResult.data?.length || 0,
        monthlyRevenue: paymentsResult.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0,
      };
    },
    enabled: !!profile?.id,
  });

  // Verificar se deve mostrar modal de upgrade automaticamente
  useEffect(() => {
    if (trainerProfile?.plan === 'free' && stats) {
      // Verificar limite de alunos
      if (stats.activeStudents >= 3) {
        setUpgradeReason('students_limit');
        setShowUpgradeModal(true);
      }
      // Verificar créditos de IA
      else if (trainerProfile.ai_credits === 0) {
        setUpgradeReason('ai_credits');
        setShowUpgradeModal(true);
      }
    }
  }, [trainerProfile, stats]);

  if (!profile || !trainerProfile) {
    return <div>Carregando...</div>;
  }

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

  const maxStudents = trainerProfile.max_students;
  const currentStudents = stats?.activeStudents || 0;
  const studentProgress = maxStudents === 0 ? 0 : (currentStudents / maxStudents) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {profile.first_name}!
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao seu dashboard FitCoach
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={planColors[trainerProfile.plan]}>
            Plano {planNames[trainerProfile.plan]}
          </Badge>
          {trainerProfile.plan === 'free' && (
            <Button onClick={() => {
              setUpgradeReason('manual');
              setShowUpgradeModal(true);
            }}>
              Upgrade para Pro
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStudents}</div>
            <p className="text-xs text-muted-foreground">
              de {maxStudents === 0 ? '∞' : maxStudents} permitidos
            </p>
            {maxStudents > 0 && (
              <Progress value={studentProgress} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.monthlyRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainerProfile.plan === 'elite' ? '∞' : trainerProfile.ai_credits}
            </div>
            <p className="text-xs text-muted-foreground">
              disponíveis este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Novo Aluno</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Agendar Sessão</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Zap className="h-6 w-6" />
              <span>Gerar Dieta</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Limits Warning */}
      {trainerProfile.plan === 'free' && currentStudents >= 3 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Limite de Alunos Atingido</CardTitle>
            <CardDescription className="text-yellow-700">
              Você atingiu o limite de 3 alunos do plano Free. Faça upgrade para continuar crescendo!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => {
                setUpgradeReason('students_limit');
                setShowUpgradeModal(true);
              }}>
                Upgrade para Pro
              </Button>
              <Button variant="outline">
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Credits Warning */}
      {trainerProfile.plan === 'free' && trainerProfile.ai_credits === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Créditos de IA Esgotados</CardTitle>
            <CardDescription className="text-red-700">
              Você não possui créditos de IA. Faça upgrade para acessar recursos de inteligência artificial!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => {
                setUpgradeReason('ai_credits');
                setShowUpgradeModal(true);
              }}>
                Upgrade para Pro
              </Button>
              <Button variant="outline">
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </div>
  );
}

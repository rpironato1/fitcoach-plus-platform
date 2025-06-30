
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { Users, Calendar, CreditCard, TrendingUp, Clock, Star } from 'lucide-react';

export default function TrainerDashboard() {
  const { profile, trainerProfile } = useAuth();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'elite': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'elite': return 'Elite';
      default: return 'Free';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {profile?.first_name}!
          </h1>
          <p className="text-gray-600">Aqui está um resumo da sua atividade hoje</p>
        </div>
        <Badge className={getPlanColor(trainerProfile?.plan || 'free')}>
          Plano {getPlanName(trainerProfile?.plan || 'free')}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              de {trainerProfile?.max_students || 3} permitidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">nenhuma agendada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerProfile?.ai_credits || 0}</div>
            <p className="text-xs text-muted-foreground">disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Sessões</CardTitle>
            <CardDescription>Suas próximas atividades agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma sessão agendada</p>
              <p className="text-sm text-gray-400 mt-2">
                Adicione alunos e agende suas primeiras sessões
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma atividade recente</p>
              <p className="text-sm text-gray-400 mt-2">
                Comece adicionando seus primeiros alunos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Limits Info */}
      <Card>
        <CardHeader>
          <CardTitle>Limites do seu Plano</CardTitle>
          <CardDescription>
            Você está no plano {getPlanName(trainerProfile?.plan || 'free')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">
                {trainerProfile?.max_students || 3}
              </div>
              <p className="text-sm text-gray-600">Alunos máximos</p>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">
                {trainerProfile?.ai_credits || 0}
              </div>
              <p className="text-sm text-gray-600">Créditos IA</p>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">
                {trainerProfile?.plan === 'free' ? '0%' : trainerProfile?.plan === 'pro' ? '1%' : '0.5%'}
              </div>
              <p className="text-sm text-gray-600">Taxa de processamento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

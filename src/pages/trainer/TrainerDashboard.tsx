
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocalStorageAuth as useAuth } from '@/components/auth/LocalStorageAuthProvider';
import { useDashboardStats, useUpcomingSessions, useRecentActivity } from '@/hooks/useDashboardData';
import { useLocalStorageDashboardStats, useLocalStorageUpcomingSessions, useLocalStorageRecentActivity } from '@/hooks/useLocalStorageDashboardData';
import { DataSourceManager } from '@/components/trainer/DataSourceManager';
import { Users, Calendar, CreditCard, TrendingUp, Clock, Star, Dumbbell, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function TrainerDashboard() {
  const { profile, trainerProfile } = useAuth();
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Use appropriate hooks based on data source selection
  const { data: supabaseStats, isLoading: supabaseStatsLoading } = useDashboardStats();
  const { data: supabaseSessions, isLoading: supabaseSessionsLoading } = useUpcomingSessions();
  const { data: supabaseActivity, isLoading: supabaseActivityLoading } = useRecentActivity();
  
  const { data: localStats, isLoading: localStatsLoading } = useLocalStorageDashboardStats();
  const { data: localSessions, isLoading: localSessionsLoading } = useLocalStorageUpcomingSessions();
  const { data: localActivity, isLoading: localActivityLoading } = useLocalStorageRecentActivity();

  // Select data source
  const stats = useLocalStorage ? localStats : supabaseStats;
  const upcomingSessions = useLocalStorage ? localSessions : supabaseSessions;
  const recentActivity = useLocalStorage ? localActivity : supabaseActivity;
  
  const statsLoading = useLocalStorage ? localStatsLoading : supabaseStatsLoading;
  const sessionsLoading = useLocalStorage ? localSessionsLoading : supabaseSessionsLoading;
  const activityLoading = useLocalStorage ? localActivityLoading : supabaseActivityLoading;

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_completed': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'student_added': return <Users className="h-4 w-4 text-blue-600" />;
      case 'workout_assigned': return <Dumbbell className="h-4 w-4 text-purple-600" />;
      case 'diet_created': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Data Source Manager */}
      <DataSourceManager 
        useLocalStorage={useLocalStorage}
        onToggleDataSource={setUseLocalStorage}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {profile?.first_name}!
          </h1>
          <p className="text-gray-600">Aqui está um resumo da sua atividade hoje</p>
          {useLocalStorage && (
            <Badge variant="outline" className="mt-2">
              📊 Usando dados localStorage para teste
            </Badge>
          )}
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
            <div className="text-2xl font-bold">{stats?.activeStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {stats?.maxStudents || 3} permitidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sessionsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sessionsToday === 0 ? 'nenhuma agendada' : 'agendadas para hoje'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiCredits || 0}</div>
            <p className="text-xs text-muted-foreground">disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximas Sessões</CardTitle>
              <CardDescription>Suas próximas atividades agendadas</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/trainer/sessions">
                <Plus className="h-4 w-4 mr-2" />
                Nova Sessão
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{session.student_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(session.scheduled_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{session.duration_minutes}min</p>
                      <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                        {session.status === 'scheduled' ? 'Agendado' : session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma sessão agendada</p>
                <p className="text-sm text-gray-400 mt-2">
                  Adicione alunos e agende suas primeiras sessões
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações realizadas</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/trainer/workouts">
                <Dumbbell className="h-4 w-4 mr-2" />
                Treinos
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
                <p className="text-sm text-gray-400 mt-2">
                  Comece adicionando seus primeiros alunos
                </p>
              </div>
            )}
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
                {stats?.activeStudents || 0}/{stats?.maxStudents || 3}
              </div>
              <p className="text-sm text-gray-600">Alunos ativos</p>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.aiCredits || 0}
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

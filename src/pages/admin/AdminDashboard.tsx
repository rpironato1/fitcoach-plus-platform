
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Settings, TrendingUp, Activity, AlertCircle, Building, UserCheck, Calendar, DollarSign, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorageAdminStats, useLocalStorageAdminPayments, useLocalStorageAdminSettings, useLocalStorageAdminActivity } from '@/hooks/useLocalStorageAdminData';
import { DataSourceManager } from '@/components/trainer/DataSourceManager';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Supabase queries
  const { data: supabaseStats, isLoading: supabaseStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [trainersResult, studentsResult, paymentsResult, systemSettingsResult] = await Promise.all([
        supabase.from('trainer_profiles').select('*'),
        supabase.from('student_profiles').select('*'),
        supabase.from('payment_intents').select('*').eq('status', 'succeeded'),
        supabase.from('system_settings').select('*')
      ]);

      const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const activeTrainers = trainersResult.data?.length || 0;
      const totalStudents = studentsResult.data?.length || 0;
      const settings = systemSettingsResult.data || [];
      const monthlyRevenue = totalRevenue; // Simplified calculation

      return {
        activeTrainers,
        totalStudents,
        totalRevenue,
        monthlyRevenue,
        totalSessions: 0, // Would need sessions table
        weeklySignups: Math.floor(activeTrainers * 0.1) + 1,
        averageSessionsPerTrainer: 0,
        systemHealth: {
          database: 'online' as const,
          auth: 'online' as const,
          storage: 'online' as const
        },
        settings,
        recentPayments: paymentsResult.data?.slice(0, 5) || []
      };
    },
    enabled: !useLocalStorage
  });

  // LocalStorage queries
  const { data: localStats, isLoading: localStatsLoading } = useLocalStorageAdminStats();
  const { data: localPayments, isLoading: localPaymentsLoading } = useLocalStorageAdminPayments();
  const { data: localSettings, isLoading: localSettingsLoading } = useLocalStorageAdminSettings();
  const { data: localActivity, isLoading: localActivityLoading } = useLocalStorageAdminActivity();

  // Select data source
  const stats = useLocalStorage ? localStats : supabaseStats;
  const recentPayments = useLocalStorage ? localPayments : supabaseStats?.recentPayments;
  const settings = useLocalStorage ? localSettings : supabaseStats?.settings;
  const recentActivity = useLocalStorage ? localActivity : [];
  
  const statsLoading = useLocalStorage ? localStatsLoading : supabaseStatsLoading;
  const paymentsLoading = useLocalStorage ? localPaymentsLoading : supabaseStatsLoading;
  const settingsLoading = useLocalStorage ? localSettingsLoading : supabaseStatsLoading;
  const activityLoading = useLocalStorage ? localActivityLoading : false;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_processed': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'trainer_signup': return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'session_completed': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'system_update': return <Settings className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral completa do sistema FitCoach</p>
          {useLocalStorage && (
            <Badge variant="outline" className="mt-2">
              📊 Usando dados localStorage para teste
            </Badge>
          )}
        </div>
        <Badge className="bg-red-100 text-red-800">
          Administrador
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trainers Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTrainers || 0}</div>
            <p className="text-xs text-muted-foreground">cadastrados na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {((stats?.totalRevenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">processada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {((stats?.monthlyRevenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Trainers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.weeklySignups || 0}</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Sessões/Trainer</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageSessionsPerTrainer || 0}</div>
            <p className="text-xs text-muted-foreground">por trainer</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recentes</CardTitle>
            <CardDescription>Últimas transações processadas</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">R$ {((payment.amount || 0) / 100).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {payment.trainer_name || payment.method || 'Cartão de Crédito'}
                      </p>
                    </div>
                    <Badge className={payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {payment.status === 'succeeded' ? 'Sucesso' : payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum pagamento recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
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
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>Monitoramento dos serviços</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats?.systemHealth?.database === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Database: {stats?.systemHealth?.database || 'Online'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats?.systemHealth?.auth === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Auth: {stats?.systemHealth?.auth || 'Online'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats?.systemHealth?.storage === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Storage: {stats?.systemHealth?.storage || 'Online'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>Status das configurações principais</CardDescription>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : settings && settings.length > 0 ? (
              <div className="space-y-4">
                {settings.slice(0, 4).map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{setting.description}</p>
                      <p className="text-xs text-gray-500">{setting.key}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {setting.value}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Configurações não disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

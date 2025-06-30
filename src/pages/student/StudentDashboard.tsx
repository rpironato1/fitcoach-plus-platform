
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Target, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function StudentDashboard() {
  const { profile, studentProfile } = useAuth();

  // Query para buscar informações do trainer
  const { data: trainerInfo } = useQuery({
    queryKey: ['trainer-info', studentProfile?.trainer_id],
    queryFn: async () => {
      if (!studentProfile?.trainer_id) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentProfile.trainer_id)
        .single();

      return data;
    },
    enabled: !!studentProfile?.trainer_id,
  });

  // Query para buscar próximas sessões
  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', profile.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);

      return data || [];
    },
    enabled: !!profile?.id,
  });

  if (!profile || !studentProfile) {
    return <div>Carregando...</div>;
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusNames = {
    active: 'Ativo',
    paused: 'Pausado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {profile.first_name}!
          </h1>
          <p className="text-gray-600">
            Acompanhe seu progresso e próximas sessões
          </p>
        </div>
        <Badge className={statusColors[studentProfile.status]}>
          {statusNames[studentProfile.status]}
        </Badge>
      </div>

      {/* Trainer Info */}
      {trainerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seu Personal Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">
                  {trainerInfo.first_name} {trainerInfo.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  Personal desde {new Date(studentProfile.start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Ativo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((new Date().getTime() - new Date(studentProfile.start_date).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <p className="text-xs text-muted-foreground">
              desde o início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Sessões</CardTitle>
          <CardDescription>
            Suas sessões agendadas com o personal trainer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(session.scheduled_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {session.duration_minutes} minutos
                    </p>
                  </div>
                  <Badge variant="outline">
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Nenhuma sessão agendada no momento.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

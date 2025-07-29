
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  student_name?: string;
}

interface SessionsListProps {
  sessions: Session[];
  title: string;
  description: string;
  filterType: 'upcoming' | 'past';
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  missed: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  missed: 'Perdido',
};

export function SessionsList({ sessions, title, description, filterType }: SessionsListProps) {
  const now = new Date();
  
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at);
    return filterType === 'upcoming' ? sessionDate >= now : sessionDate < now;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={filterType === 'upcoming' ? 'Nenhuma sessão agendada' : 'Nenhuma sessão realizada'}
              description={
                filterType === 'upcoming' 
                  ? 'Clique em "Agendar Sessão" para começar'
                  : 'Suas sessões passadas aparecerão aqui'
              }
            />
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {session.student_name || 'Aluno não encontrado'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.scheduled_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <span>{session.duration_minutes} min</span>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                    )}
                  </div>
                </div>
                <Badge className={statusColors[session.status as keyof typeof statusColors] || statusColors.scheduled}>
                  {statusLabels[session.status as keyof typeof statusLabels] || 'Agendado'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

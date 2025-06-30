
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  student: {
    first_name: string;
    last_name: string;
  };
  payment_intent_id: string | null;
}

interface SessionsListProps {
  sessions: Session[];
  title: string;
  description: string;
  filterType: 'upcoming' | 'past';
}

export function SessionsList({ sessions, title, description, filterType }: SessionsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'payment_pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'payment_pending': return 'Pagamento Pendente';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const filteredSessions = sessions?.filter(session => {
    const sessionDate = new Date(session.scheduled_at);
    const now = new Date();
    return filterType === 'upcoming' ? sessionDate >= now : sessionDate < now;
  }) || [];

  const displaySessions = filterType === 'upcoming' 
    ? filteredSessions.slice(0, 5)
    : filteredSessions.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {displaySessions.length > 0 ? (
          <div className="space-y-4">
            {displaySessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    filterType === 'upcoming' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`h-5 w-5 ${
                      filterType === 'upcoming' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {session.student.first_name} {session.student.last_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduled_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(session.scheduled_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} ({session.duration_minutes}min)
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusText(session.status)}
                  </Badge>
                  {session.payment_intent_id && (
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterType === 'upcoming' ? 'Nenhuma sessão agendada' : 'Nenhuma sessão no histórico'}
            </h3>
            <p className="text-gray-600">
              {filterType === 'upcoming' 
                ? 'Comece agendando sessões com seus alunos.'
                : 'Sessões realizadas aparecerão aqui.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

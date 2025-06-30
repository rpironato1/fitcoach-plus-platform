
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, User, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

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

export default function SessionsPage() {
  const { profile, trainerProfile } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Query para buscar alunos
  const { data: students } = useQuery({
    queryKey: ['students-for-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          id,
          profiles(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .eq('status', 'active');

      if (error) throw error;

      return data.map(student => ({
        id: student.id,
        first_name: student.profiles?.first_name || '',
        last_name: student.profiles?.last_name || '',
      }));
    },
    enabled: !!profile?.id,
  });

  // Query para buscar sessões
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          notes,
          payment_intent_id,
          profiles(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
        notes: session.notes,
        payment_intent_id: session.payment_intent_id,
        student: {
          first_name: session.profiles?.first_name || '',
          last_name: session.profiles?.last_name || '',
        },
      }));
    },
    enabled: !!profile?.id,
  });

  // Mutation para criar sessão
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      student_id: string;
      scheduled_at: string;
      duration_minutes: number;
      notes?: string;
    }) => {
      // Verificar se precisa de pagamento (plano Free)
      if (trainerProfile?.plan === 'free') {
        // Criar PaymentIntent primeiro
        const { data: paymentIntent, error: paymentError } = await supabase
          .from('payment_intents')
          .insert({
            student_id: sessionData.student_id,
            trainer_id: profile!.id,
            amount: 50.00, // Valor exemplo
            method: 'credit_card',
            fee_percent: 1.5,
            status: 'pending',
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // Criar sessão com payment_intent_id
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            ...sessionData,
            trainer_id: profile!.id,
            payment_intent_id: paymentIntent.id,
            status: 'payment_pending',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar sessão direto (Pro/Elite)
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            ...sessionData,
            trainer_id: profile!.id,
            status: 'scheduled',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Sessão agendada com sucesso!",
        description: trainerProfile?.plan === 'free' 
          ? "Aguardando pagamento do aluno para confirmação."
          : "A sessão foi confirmada.",
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsScheduling(false);
      setSelectedStudent('');
      setScheduledDate('');
      setScheduledTime('');
      setDuration('60');
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao agendar sessão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScheduleSession = () => {
    if (!selectedStudent || !scheduledDate || !scheduledTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    createSessionMutation.mutate({
      student_id: selectedStudent,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(duration),
      notes: notes || undefined,
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Sessões</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe suas sessões de treino
          </p>
        </div>
        <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agendar Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
              <DialogDescription>
                Agende uma sessão de treino com um aluno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre a sessão..."
                />
              </div>
              {trainerProfile?.plan === 'free' && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Plano Free: O aluno precisará efetuar o pagamento para confirmar a sessão.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduling(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleScheduleSession}
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? 'Agendando...' : 'Agendar Sessão'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Próximas Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Sessões</CardTitle>
          <CardDescription>
            Suas sessões agendadas para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions
                .filter(session => new Date(session.scheduled_at) >= new Date())
                .slice(0, 5)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
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
                Nenhuma sessão agendada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece agendando sessões com seus alunos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
          <CardDescription>
            Sessões realizadas recentemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions
                .filter(session => new Date(session.scheduled_at) < new Date())
                .slice(0, 10)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
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
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusText(session.status)}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma sessão no histórico
              </h3>
              <p className="text-gray-600">
                Sessões realizadas aparecerão aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

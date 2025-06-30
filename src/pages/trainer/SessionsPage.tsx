
import { ScheduleSessionDialog } from '@/components/trainer/ScheduleSessionDialog';
import { SessionsList } from '@/components/trainer/SessionsList';
import { useSessions } from '@/hooks/useSessions';

export default function SessionsPage() {
  const { students, sessions, isLoading, createSession, isCreatingSession } = useSessions();

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
        <ScheduleSessionDialog
          students={students || []}
          onScheduleSession={createSession}
          isCreatingSession={isCreatingSession}
        />
      </div>

      <SessionsList
        sessions={sessions || []}
        title="Próximas Sessões"
        description="Suas sessões agendadas para os próximos dias"
        filterType="upcoming"
      />

      <SessionsList
        sessions={sessions || []}
        title="Histórico de Sessões"
        description="Sessões realizadas recentemente"
        filterType="past"
      />
    </div>
  );
}

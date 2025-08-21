import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkoutPlans, useWorkoutSessions } from '@/hooks/useWorkouts';
import { Plus, Dumbbell, Users, Calendar, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CreateWorkoutPlanDialog from '@/components/workouts/CreateWorkoutPlanDialog';

export default function WorkoutsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: workoutPlans, isLoading: plansLoading } = useWorkoutPlans();
  const { data: workoutSessions, isLoading: sessionsLoading } = useWorkoutSessions();

  const templates = workoutPlans?.filter(plan => plan.is_template) || [];
  const assignedWorkouts = workoutPlans?.filter(plan => !plan.is_template) || [];
  const upcomingSessions = workoutSessions?.filter(session => 
    session.status === 'scheduled' && new Date(session.scheduled_date) >= new Date()
  ) || [];

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Iniciante';
      case 2: return 'Básico';
      case 3: return 'Intermediário';
      case 4: return 'Avançado';
      case 5: return 'Expert';
      default: return 'Não definido';
    }
  };

  if (plansLoading || sessionsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Treinos</h1>
          <p className="text-gray-600">Crie, edite e atribua planos de treino para seus alunos</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano de Treino
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-gray-600">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{assignedWorkouts.length}</p>
                <p className="text-sm text-gray-600">Treinos Atribuídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-sm text-gray-600">Sessões Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {workoutSessions?.filter(s => s.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-gray-600">Treinos Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de Treino</CardTitle>
          <CardDescription>
            Seus modelos de treino prontos para serem atribuídos aos alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum template criado ainda</p>
              <p className="text-sm text-gray-400 mt-2">
                Crie seu primeiro template de treino
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getDifficultyColor(template.difficulty_level || 1)}>
                        {getDifficultyText(template.difficulty_level || 1)}
                      </Badge>
                    </div>
                    {template.description && (
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimated_duration_minutes} minutos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>{template.muscle_groups.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="h-4 w-4" />
                        <span>{template.exercises?.length || 0} exercícios</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" className="flex-1">
                        Atribuir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Workouts Section */}
      {assignedWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Treinos Atribuídos</CardTitle>
            <CardDescription>
              Treinos em andamento com seus alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <Badge variant="secondary">Atribuído</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      Criado em {format(new Date(workout.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{workout.estimated_duration_minutes} minutos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>{workout.muscle_groups.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Ver Progresso
                      </Button>
                      <Button size="sm" className="flex-1">
                        Agendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Sessões de Treino</CardTitle>
            <CardDescription>
              Sessões agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.student.first_name} {session.student.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{session.workout_plan.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(session.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.workout_plan.estimated_duration_minutes} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateWorkoutPlanDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
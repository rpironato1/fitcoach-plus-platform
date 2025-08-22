
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth';
import { Calendar, User, Activity, Trophy } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {profile?.first_name}!
        </h1>
        <p className="text-gray-600">Acompanhe seu progresso e próximas atividades</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">15:30</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões este mês</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 vs mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">metas alcançadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Sessões</CardTitle>
            <CardDescription>Suas próximas atividades agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Treino de Força</p>
                  <p className="text-sm text-gray-500">Hoje, 15:30</p>
                </div>
                <Badge variant="outline">Agendado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Treino Cardio</p>
                  <p className="text-sm text-gray-500">Amanhã, 16:00</p>
                </div>
                <Badge variant="outline">Agendado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plano de Dieta Atual</CardTitle>
            <CardDescription>Seu plano alimentar personalizado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Calorias diárias</span>
                <span className="font-semibold">2,200 kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Proteínas</span>
                <span className="font-semibold">150g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Carboidratos</span>
                <span className="font-semibold">220g</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gorduras</span>
                <span className="font-semibold">80g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Mensal</CardTitle>
          <CardDescription>Sua evolução no último mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Gráfico de progresso em desenvolvimento</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá acompanhar sua evolução com gráficos detalhados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

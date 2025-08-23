
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth';
import { Calendar, User, Activity, Trophy, Clock, Target, Utensils, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {profile?.first_name}!
          </h1>
          <p className="text-gray-600">Acompanhe seu progresso e próximas atividades</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          Aluno Ativo
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">plano em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">15:30 - Treino de Força</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/4</div>
            <p className="text-xs text-muted-foreground">sessões completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs mês anterior</p>
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
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Treino de Força</p>
                  <p className="text-sm text-gray-500">Hoje, 15:30</p>
                </div>
                <Badge variant="default" className="text-xs">Agendado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Treino Cardio</p>
                  <p className="text-sm text-gray-500">Amanhã, 16:00</p>
                </div>
                <Badge variant="outline" className="text-xs">Agendado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Treino Funcional</p>
                  <p className="text-sm text-gray-500">Quinta-feira, 18:00</p>
                </div>
                <Badge variant="outline" className="text-xs">Agendado</Badge>
              </div>
            </div>
            {/* Empty state */}
            {false && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma sessão agendada</p>
                <p className="text-sm text-gray-400 mt-2">
                  Entre em contato com seu personal trainer para agendar
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Plano de Dieta Atual</CardTitle>
              <CardDescription>Seu plano alimentar personalizado</CardDescription>
            </div>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Calorias diárias</span>
                <span className="font-semibold">2,200 kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proteínas</span>
                <span className="font-semibold">150g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Carboidratos</span>
                <span className="font-semibold">220g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gorduras</span>
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
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Gráfico de progresso em desenvolvimento</p>
            <p className="text-sm text-gray-400 mt-2">
              Em breve você poderá acompanhar sua evolução com gráficos detalhados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Personal Trainer</CardTitle>
          <CardDescription>Informações de contato e suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Carlos Eduardo Silva</p>
              <p className="text-sm text-gray-500">Personal Trainer Certificado</p>
              <p className="text-xs text-gray-400 mt-1">📧 carlos@fitcoach.com | 📱 (11) 99999-9999</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

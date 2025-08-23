
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth';
import { Calendar, User, Activity, Trophy, Clock, Target, Utensils, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Olá, {profile?.first_name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Acompanhe seu progresso e próximas atividades</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 self-start sm:self-auto">
          Aluno Ativo
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">plano em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">15:30 - Treino de Força</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões este mês</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 vs mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">metas alcançadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">3/4</div>
            <p className="text-xs text-muted-foreground">sessões completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Próximas Sessões</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Suas próximas atividades agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">Treino de Força</p>
                  <p className="text-xs sm:text-sm text-gray-500">Hoje, 15:30</p>
                </div>
                <Badge variant="default" className="text-xs">Agendado</Badge>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">Treino Cardio</p>
                  <p className="text-xs sm:text-sm text-gray-500">Amanhã, 16:00</p>
                </div>
                <Badge variant="outline" className="text-xs">Agendado</Badge>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">Treino Funcional</p>
                  <p className="text-xs sm:text-sm text-gray-500">Quinta-feira, 18:00</p>
                </div>
                <Badge variant="outline" className="text-xs">Agendado</Badge>
              </div>
            </div>
            {/* Empty state - disabled for demo */}
            {/* {!hasUpcomingSessions && (
              <div className="text-center py-6 sm:py-8">
                <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">Nenhuma sessão agendada</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Entre em contato com seu personal trainer para agendar
                </p>
              </div>
            )} */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Plano de Dieta Atual</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Seu plano alimentar personalizado</CardDescription>
            </div>
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Calorias diárias</span>
                <span className="font-semibold text-sm sm:text-base">2,200 kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Proteínas</span>
                <span className="font-semibold text-sm sm:text-base">150g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Carboidratos</span>
                <span className="font-semibold text-sm sm:text-base">220g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Gorduras</span>
                <span className="font-semibold text-sm sm:text-base">80g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Progresso Mensal</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Sua evolução no último mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Gráfico de progresso em desenvolvimento</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Em breve você poderá acompanhar sua evolução com gráficos detalhados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Seu Personal Trainer</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Informações de contato e suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base">Carlos Eduardo Silva</p>
              <p className="text-xs sm:text-sm text-gray-500">Personal Trainer Certificado</p>
              <p className="text-xs text-gray-400 mt-1 truncate">📧 carlos@fitcoach.com | 📱 (11) 99999-9999</p>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

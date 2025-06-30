
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Users, Calendar } from 'lucide-react';

interface DietPlan {
  id: string;
  created_at: string;
  student_id: string;
}

interface DietStatsCardsProps {
  dietPlans: DietPlan[];
}

export function DietStatsCards({ dietPlans }: DietStatsCardsProps) {
  const totalPlans = dietPlans.length;
  const uniqueStudents = new Set(dietPlans.map(plan => plan.student_id)).size;
  const thisMonth = dietPlans.filter(plan => {
    const createdDate = new Date(plan.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
          <ChefHat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlans}</div>
          <p className="text-xs text-muted-foreground">
            planos criados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alunos com Planos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueStudents}</div>
          <p className="text-xs text-muted-foreground">
            alunos atendidos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonth}</div>
          <p className="text-xs text-muted-foreground">
            novos planos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

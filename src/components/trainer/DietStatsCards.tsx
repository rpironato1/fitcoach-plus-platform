
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Zap, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface DietPlan {
  id: string;
  is_paid: boolean;
}

interface DietStatsCardsProps {
  dietPlans: DietPlan[];
}

export function DietStatsCards({ dietPlans }: DietStatsCardsProps) {
  const { trainerProfile } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Dietas</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dietPlans?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {trainerProfile?.plan === 'elite' ? '∞' : trainerProfile?.ai_credits || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dietas Pagas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dietPlans?.filter(d => d.is_paid).length || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

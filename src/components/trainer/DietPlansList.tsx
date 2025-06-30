
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, User, Calendar } from 'lucide-react';

interface DietPlan {
  id: string;
  name: string;
  total_calories: number | null;
  is_paid: boolean;
  created_at: string;
  student: {
    first_name: string;
    last_name: string;
  };
}

interface DietPlansListProps {
  dietPlans: DietPlan[];
}

export function DietPlansList({ dietPlans }: DietPlansListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planos de Dieta Criados</CardTitle>
        <CardDescription>
          Gerencie todos os planos de dieta criados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dietPlans && dietPlans.length > 0 ? (
          <div className="space-y-4">
            {dietPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {plan.student.first_name} {plan.student.last_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {plan.total_calories && (
                        <div className="flex items-center gap-1">
                          <Utensils className="h-4 w-4" />
                          {plan.total_calories} kcal
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan.is_paid && (
                    <Badge className="bg-green-100 text-green-800">
                      Pago
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Gerado com IA
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum plano de dieta criado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando planos de dieta personalizados com IA para seus alunos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, User, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface DietPlan {
  id: string;
  name: string;
  total_calories: number | null;
  is_paid: boolean;
  created_at: string;
  student_name?: string;
  content: unknown;
}

interface DietPlansListProps {
  dietPlans: DietPlan[];
}

export function DietPlansList({ dietPlans }: DietPlansListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planos de Dieta</CardTitle>
        <CardDescription>
          Todos os planos alimentares criados para seus alunos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dietPlans.length === 0 ? (
            <EmptyState
              icon={ChefHat}
              title="Nenhum plano de dieta criado ainda"
              description='Clique em "Criar Plano de Dieta" para começar'
            />
          ) : (
            dietPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {plan.student_name || "Aluno não encontrado"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(plan.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      {plan.total_calories && (
                        <span>{plan.total_calories} kcal</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      plan.is_paid
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {plan.is_paid ? "Pago" : "Gratuito"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


import { useLocalStorageAuth as useAuth } from '@/components/auth/LocalStorageAuthProvider';
import { DietStatsCards } from '@/components/trainer/DietStatsCards';
import { CreateDietDialog } from '@/components/trainer/CreateDietDialog';
import { DietPlansList } from '@/components/trainer/DietPlansList';
import { useDietPlans } from '@/hooks/useDietPlans';

export default function DietPlansPage() {
  const { profile } = useAuth();
  const { students, dietPlans, isLoading, createDietPlan, isCreatingDiet } = useDietPlans();

  if (isLoading || !profile) {
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
          <h1 className="text-3xl font-bold text-gray-900">Planos de Dieta</h1>
          <p className="text-gray-600">
            Crie e gerencie planos de dieta personalizados com IA
          </p>
        </div>
        <CreateDietDialog
          students={students || []}
          onCreateDiet={createDietPlan}
          isCreating={isCreatingDiet}
        />
      </div>

      <DietStatsCards dietPlans={dietPlans || []} />

      <DietPlansList dietPlans={dietPlans || []} />
    </div>
  );
}

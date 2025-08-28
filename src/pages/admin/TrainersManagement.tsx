import { useTrainersManagement } from "@/hooks/useTrainersManagement";
import { TrainersFilters } from "@/components/admin/TrainersFilters";
import { TrainersList } from "@/components/admin/TrainersList";

export default function TrainersManagement() {
  const {
    filteredTrainers,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    updateTrainerPlan,
    deleteTrainer,
  } = useTrainersManagement();

  const handleUpdatePlan = (
    trainerId: string,
    plan: "free" | "pro" | "elite"
  ) => {
    updateTrainerPlan.mutate({ trainerId, plan });
  };

  const handleDeleteTrainer = (trainerId: string) => {
    deleteTrainer.mutate(trainerId);
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Trainers</h1>
        <p className="text-gray-600">
          Administre todos os trainers cadastrados na plataforma
        </p>
      </div>

      <TrainersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPlan={filterPlan}
        setFilterPlan={setFilterPlan}
      />

      <TrainersList
        trainers={filteredTrainers || []}
        onUpdatePlan={handleUpdatePlan}
        onDeleteTrainer={handleDeleteTrainer}
      />
    </div>
  );
}

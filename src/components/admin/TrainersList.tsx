
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainerCard } from './TrainerCard';
import { Trainer } from '@/hooks/useTrainersManagement';

interface TrainersListProps {
  trainers: Trainer[];
  onUpdatePlan: (trainerId: string, plan: 'free' | 'pro' | 'elite') => void;
  onDeleteTrainer: (trainerId: string) => void;
}

export function TrainersList({ trainers, onUpdatePlan, onDeleteTrainer }: TrainersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainers Cadastrados</CardTitle>
        <CardDescription>
          Total: {trainers?.length || 0} trainers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trainers?.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              onUpdatePlan={onUpdatePlan}
              onDeleteTrainer={onDeleteTrainer}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

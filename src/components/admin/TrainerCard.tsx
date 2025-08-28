import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreHorizontal, Trash2 } from "lucide-react";
import { Trainer } from "@/hooks/useTrainersManagement";

interface TrainerCardProps {
  trainer: Trainer;
  onUpdatePlan: (trainerId: string, plan: "free" | "pro" | "elite") => void;
  onDeleteTrainer: (trainerId: string) => void;
}

const planColors = {
  free: "bg-gray-100 text-gray-800",
  pro: "bg-blue-100 text-blue-800",
  elite: "bg-purple-100 text-purple-800",
};

const planNames = {
  free: "Free",
  pro: "Pro",
  elite: "Elite",
};

export function TrainerCard({
  trainer,
  onUpdatePlan,
  onDeleteTrainer,
}: TrainerCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold">
            {trainer.profiles
              ? `${trainer.profiles.first_name} ${trainer.profiles.last_name}`
              : "Nome não disponível"}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{trainer.profiles?.phone || "Telefone não informado"}</span>
            <span>{trainer._count?.students || 0} alunos</span>
            <span>{trainer.ai_credits} créditos IA</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={planColors[trainer.plan]}>
          {planNames[trainer.plan]}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onUpdatePlan(trainer.id, "free")}>
              Alterar para Free
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdatePlan(trainer.id, "pro")}>
              Alterar para Pro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdatePlan(trainer.id, "elite")}>
              Alterar para Elite
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteTrainer(trainer.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

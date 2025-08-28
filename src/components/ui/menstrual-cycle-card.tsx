import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MenstrualCycleCardProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function MenstrualCycleCard({
  isEnabled,
  onToggle,
}: MenstrualCycleCardProps) {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    setLocalEnabled(checked);
    onToggle(checked);

    if (checked) {
      toast({
        title: "Treino adaptado ativado! 💪",
        description:
          "Seus treinos e dietas serão personalizados considerando seu ciclo menstrual para melhor performance.",
      });
    } else {
      toast({
        title: "Configuração desativada",
        description:
          "Os treinos voltarão ao padrão sem considerar o ciclo menstrual.",
      });
    }
  };

  return (
    <Card className="border-pink-200 bg-gradient-to-r from-pink-50/50 to-purple-50/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <div>
            <CardTitle className="text-sm sm:text-base">
              Treino Adaptado ao Ciclo
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Personalize treinos e dietas baseado no seu ciclo menstrual
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Treino Adaptado ao Ciclo</span>
                </DialogTitle>
                <DialogDescription className="space-y-3 text-sm">
                  <p>
                    <strong>Como funciona:</strong> Nossa IA considera as
                    diferentes fases do seu ciclo menstrual para criar treinos
                    mais eficazes.
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>🌙 Fase Menstrual (dias 1-5):</strong>
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Treinos mais leves, foco em alongamento e yoga
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Dieta rica em ferro e magnésio
                    </p>

                    <p>
                      <strong>🌱 Fase Folicular (dias 6-14):</strong>
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Energia crescente, treinos de intensidade moderada
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Boa fase para novos exercícios
                    </p>

                    <p>
                      <strong>🌸 Ovulação (dias 14-16):</strong>
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Pico de energia, treinos intensos e força
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Máxima performance física
                    </p>

                    <p>
                      <strong>🍂 Fase Lútea (dias 17-28):</strong>
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Redução gradual, foco em resistência
                    </p>
                    <p className="text-xs text-gray-600 ml-4">
                      • Dieta com redução de sódio e açúcar
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Switch
            checked={localEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-pink-500"
          />
        </div>
      </CardHeader>
      <CardContent>
        {localEnabled ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Status</span>
              <Badge className="bg-pink-100 text-pink-800 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
            <div className="text-xs text-gray-500 bg-pink-50/50 p-2 rounded-lg">
              <strong>💡 Dica:</strong> A IA considerará sua fase do ciclo ao
              gerar treinos e dietas nos planos pagos. Mantenha um calendário
              menstrual atualizado para melhores resultados.
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">
            Ative para treinos personalizados baseados no seu ciclo menstrual
          </div>
        )}
      </CardContent>
    </Card>
  );
}

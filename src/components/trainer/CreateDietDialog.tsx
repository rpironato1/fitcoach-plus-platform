
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface CreateDietDialogProps {
  students: Student[];
  onCreateDiet: (dietData: {
    student_id: string;
    name: string;
    target_calories: number;
    goal: string;
    restrictions: string;
    preferences: string;
  }) => void;
  isCreating: boolean;
}

export function CreateDietDialog({ students, onCreateDiet, isCreating }: CreateDietDialogProps) {
  const { trainerProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dietName, setDietName] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [dietGoal, setDietGoal] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');

  const handleCreateDiet = () => {
    if (!selectedStudent || !dietName || !targetCalories || !dietGoal) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onCreateDiet({
      student_id: selectedStudent,
      name: dietName,
      target_calories: parseInt(targetCalories),
      goal: dietGoal,
      restrictions: restrictions,
      preferences: preferences,
    });

    // Reset form
    setSelectedStudent('');
    setDietName('');
    setTargetCalories('');
    setDietGoal('');
    setRestrictions('');
    setPreferences('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Criar Dieta com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Plano de Dieta com IA</DialogTitle>
          <DialogDescription>
            Use inteligência artificial para gerar um plano de dieta personalizado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Aluno *</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calories">Calorias Alvo *</Label>
              <Input
                id="calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder="2000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dietName">Nome da Dieta *</Label>
            <Input
              id="dietName"
              value={dietName}
              onChange={(e) => setDietName(e.target.value)}
              placeholder="Ex: Dieta para Ganho de Massa"
            />
          </div>
          <div>
            <Label htmlFor="goal">Objetivo *</Label>
            <Select value={dietGoal} onValueChange={setDietGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="restrictions">Restrições Alimentares</Label>
            <Textarea
              id="restrictions"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ex: Intolerância à lactose, vegetariano, etc."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="preferences">Preferências</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Ex: Gosta de peixes, não gosta de brócolis, etc."
              rows={2}
            />
          </div>
          
          {/* Avisos baseados no plano */}
          {trainerProfile?.plan === 'free' && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Plano Free: Será cobrado R$ 7,90 do aluno por esta dieta personalizada.
              </p>
            </div>
          )}
          
          {trainerProfile?.ai_credits === 0 && trainerProfile?.plan !== 'elite' && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                <Zap className="h-4 w-4 inline mr-1" />
                Você não possui créditos de IA. Faça upgrade do seu plano para continuar.
              </p>
            </div>
          )}
          
          {trainerProfile?.ai_credits! > 0 && trainerProfile?.plan !== 'elite' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <Zap className="h-4 w-4 inline mr-1" />
                Você possui {trainerProfile?.ai_credits} créditos de IA restantes.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDiet}
              disabled={isCreating || (trainerProfile?.ai_credits === 0 && trainerProfile?.plan !== 'elite')}
            >
              {isCreating ? 'Gerando...' : 'Gerar Dieta com IA'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

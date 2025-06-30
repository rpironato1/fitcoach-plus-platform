
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChefHat } from 'lucide-react';

interface Student {
  id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface CreateDietDialogProps {
  students: Student[];
  onCreateDiet: (data: {
    studentId: string;
    name: string;
    goals: string;
    restrictions: string;
    preferences: string;
  }) => void;
  isCreating: boolean;
}

export function CreateDietDialog({ students, onCreateDiet, isCreating }: CreateDietDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    goals: '',
    restrictions: '',
    preferences: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateDiet(formData);
    setFormData({ studentId: '', name: '', goals: '', restrictions: '', preferences: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ChefHat className="h-4 w-4 mr-2" />
          Criar Plano de Dieta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Plano de Dieta com IA</DialogTitle>
          <DialogDescription>
            Crie um plano alimentar personalizado usando inteligência artificial
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Aluno</Label>
            <Select value={formData.studentId} onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.profiles 
                      ? `${student.profiles.first_name} ${student.profiles.last_name}`
                      : 'Nome não disponível'
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Plano para Hipertrofia"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals">Objetivos</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="Ex: Ganho de massa muscular, perda de peso..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restrictions">Restrições Alimentares (opcional)</Label>
            <Textarea
              id="restrictions"
              value={formData.restrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, restrictions: e.target.value }))}
              placeholder="Ex: Lactose, glúten, vegetariano..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferências (opcional)</Label>
            <Textarea
              id="preferences"
              value={formData.preferences}
              onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
              placeholder="Ex: Gosta de frango, não gosta de peixe..."
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !formData.studentId || !formData.name || !formData.goals}>
              {isCreating ? 'Criando...' : 'Criar Plano'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

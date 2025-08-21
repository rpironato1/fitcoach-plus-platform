import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExercises, useCreateWorkoutPlan } from '@/hooks/useWorkouts';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface CreateWorkoutPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  order_in_workout: number;
  target_sets: number;
  target_reps: string;
  target_weight_kg?: number;
  rest_seconds: number;
  notes?: string;
}

export default function CreateWorkoutPlanDialog({ open, onOpenChange }: CreateWorkoutPlanDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty_level: 1,
    estimated_duration_minutes: 60,
    muscle_groups: [] as string[],
    is_template: true,
  });
  
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const { data: availableExercises } = useExercises();
  const { mutate: createWorkoutPlan, isPending } = useCreateWorkoutPlan();

  const muscleGroupOptions = [
    'peito', 'costas', 'ombros', 'triceps', 'biceps', 'quadriceps', 
    'isquiotibiais', 'gluteos', 'panturrilha', 'abdomen', 'lombar', 'core', 'corpo_todo'
  ];

  const handleMuscleGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        muscle_groups: [...prev.muscle_groups, group]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        muscle_groups: prev.muscle_groups.filter(g => g !== group)
      }));
    }
  };

  const addExercise = () => {
    if (!selectedExerciseId) {
      toast.error('Selecione um exercício');
      return;
    }

    const exercise = availableExercises?.find(e => e.id === selectedExerciseId);
    if (!exercise) return;

    const newExercise: WorkoutExercise = {
      exercise_id: selectedExerciseId,
      exercise_name: exercise.name,
      order_in_workout: exercises.length + 1,
      target_sets: 3,
      target_reps: '8-12',
      rest_seconds: 60,
    };

    setExercises(prev => [...prev, newExercise]);
    setSelectedExerciseId('');
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setExercises(prev => prev.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    ));
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= exercises.length) return;
    
    const newExercises = [...exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    
    // Update order_in_workout
    newExercises.forEach((exercise, index) => {
      exercise.order_in_workout = index + 1;
    });
    
    setExercises(newExercises);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }

    if (formData.muscle_groups.length === 0) {
      toast.error('Selecione pelo menos um grupo muscular');
      return;
    }

    if (exercises.length === 0) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    createWorkoutPlan({
      ...formData,
      exercises: exercises.map(({ exercise_name, ...exercise }) => exercise),
    }, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          description: '',
          difficulty_level: 1,
          estimated_duration_minutes: 60,
          muscle_groups: [],
          is_template: true,
        });
        setExercises([]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Plano de Treino</DialogTitle>
          <DialogDescription>
            Configure seu plano de treino com exercícios, séries e repetições
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Treino de Peito e Tríceps"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <Select 
                value={formData.difficulty_level.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Iniciante</SelectItem>
                  <SelectItem value="2">Básico</SelectItem>
                  <SelectItem value="3">Intermediário</SelectItem>
                  <SelectItem value="4">Avançado</SelectItem>
                  <SelectItem value="5">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração Estimada (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimated_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) }))}
                min="10"
                max="180"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Plano</Label>
              <Select 
                value={formData.is_template ? 'template' : 'assigned'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_template: value === 'template' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template (modelo)</SelectItem>
                  <SelectItem value="assigned">Atribuir a aluno específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo e características deste treino..."
              rows={3}
            />
          </div>

          {/* Muscle Groups */}
          <div className="space-y-2">
            <Label>Grupos Musculares *</Label>
            <div className="flex flex-wrap gap-2">
              {muscleGroupOptions.map((group) => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    id={group}
                    checked={formData.muscle_groups.includes(group)}
                    onCheckedChange={(checked) => handleMuscleGroupChange(group, checked as boolean)}
                  />
                  <Label htmlFor={group} className="text-sm capitalize">
                    {group.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
            {formData.muscle_groups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.muscle_groups.map((group) => (
                  <Badge key={group} variant="secondary" className="text-xs">
                    {group.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Add Exercise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Exercícios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExercises?.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} - {exercise.muscle_groups.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addExercise} disabled={!selectedExerciseId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exercises List */}
          {exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exercícios do Plano ({exercises.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div key={`${exercise.exercise_id}-${index}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveExercise(index, index - 1)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveExercise(index, index + 1)}
                          disabled={index === exercises.length - 1}
                        >
                          ↓
                        </Button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Exercício</Label>
                          <p className="font-medium">{exercise.exercise_name}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Séries</Label>
                          <Input
                            type="number"
                            value={exercise.target_sets}
                            onChange={(e) => updateExercise(index, 'target_sets', parseInt(e.target.value))}
                            min="1"
                            max="10"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Repetições</Label>
                          <Input
                            value={exercise.target_reps}
                            onChange={(e) => updateExercise(index, 'target_reps', e.target.value)}
                            placeholder="Ex: 8-12"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Descanso (seg)</Label>
                          <Input
                            type="number"
                            value={exercise.rest_seconds}
                            onChange={(e) => updateExercise(index, 'rest_seconds', parseInt(e.target.value))}
                            min="15"
                            max="300"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Peso (kg)</Label>
                          <Input
                            type="number"
                            value={exercise.target_weight_kg || ''}
                            onChange={(e) => updateExercise(index, 'target_weight_kg', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Opcional"
                            step="0.5"
                          />
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExercise(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar Plano de Treino'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
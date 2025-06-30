
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';

interface Student {
  id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface ScheduleSessionDialogProps {
  students: Student[];
  onScheduleSession: (data: {
    studentId: string;
    scheduledAt: string;
    durationMinutes: number;
    notes?: string;
  }) => void;
  isCreatingSession: boolean;
}

export function ScheduleSessionDialog({ students, onScheduleSession, isCreatingSession }: ScheduleSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    onScheduleSession({
      studentId: formData.studentId,
      scheduledAt,
      durationMinutes: formData.duration,
      notes: formData.notes || undefined
    });
    
    setFormData({ studentId: '', date: '', time: '', duration: 60, notes: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Sessão
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Nova Sessão</DialogTitle>
          <DialogDescription>
            Agende uma sessão de treino com um dos seus alunos
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
                <SelectItem value="120">120 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Adicione observações sobre a sessão..."
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreatingSession || !formData.studentId || !formData.date || !formData.time}>
              {isCreatingSession ? 'Agendando...' : 'Agendar Sessão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

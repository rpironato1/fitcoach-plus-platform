import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GenderSelectionProps {
  currentGender?: string | null;
  onGenderChange: (gender: string) => void;
}

export function GenderSelection({ currentGender, onGenderChange }: GenderSelectionProps) {
  const [selectedGender, setSelectedGender] = useState(currentGender || '');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (selectedGender) {
      onGenderChange(selectedGender);
      setIsDialogOpen(false);
      toast({
        title: "Perfil atualizado! ✅",
        description: `Gênero definido como ${selectedGender === 'female' ? 'Feminino' : selectedGender === 'male' ? 'Masculino' : 'Outro'}. Isto ajudará a personalizar seus treinos.`,
      });
    }
  };

  const getGenderDisplay = (gender: string | null | undefined) => {
    switch (gender) {
      case 'female': return 'Feminino';
      case 'male': return 'Masculino';
      case 'other': return 'Outro';
      default: return 'Não informado';
    }
  };

  const getGenderBadgeVariant = (gender: string | null | undefined) => {
    if (!gender) return 'outline';
    return 'default';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Informações Pessoais</span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="Configurar informações pessoais">
              <Settings className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Definir Gênero</DialogTitle>
              <DialogDescription>
                Esta informação nos ajuda a personalizar melhor seus treinos e dietas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!selectedGender}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Gênero:</span>
          <Badge variant={getGenderBadgeVariant(currentGender)} className="text-xs">
            {getGenderDisplay(currentGender)}
          </Badge>
        </div>
        {!currentGender && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded-lg">
            💡 <strong>Defina seu gênero</strong> para desbloquear recursos personalizados como treinos adaptados ao ciclo menstrual.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
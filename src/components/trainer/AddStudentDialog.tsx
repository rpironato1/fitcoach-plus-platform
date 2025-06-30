
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AddStudentDialogProps {
  onAddStudent: (data: { email: string; firstName: string; lastName: string; phone: string }) => void;
  isLoading: boolean;
  canAddStudent: boolean;
}

export function AddStudentDialog({ onAddStudent, isLoading, canAddStudent }: AddStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    if (!email || !firstName || !lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!canAddStudent) {
      toast({
        title: "Limite de alunos atingido",
        description: "Faça upgrade para Pro para adicionar mais alunos.",
        variant: "destructive",
      });
      return;
    }

    onAddStudent({ email, firstName, lastName, phone });
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Aluno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Aluno</DialogTitle>
          <DialogDescription>
            Cadastre um novo aluno para começar o acompanhamento
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nome do aluno"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sobrenome do aluno"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Aluno'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

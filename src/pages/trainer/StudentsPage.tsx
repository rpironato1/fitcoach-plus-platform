
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  start_date: string;
  status: 'active' | 'paused' | 'cancelled';
}

export default function StudentsPage() {
  const { profile, trainerProfile } = useAuth();
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const queryClient = useQueryClient();

  // Query para buscar alunos
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          id,
          start_date,
          status,
          profiles!inner(first_name, last_name, phone)
        `)
        .eq('trainer_id', profile.id);

      if (error) throw error;

      // Buscar emails dos usuários via auth
      const studentData = await Promise.all(
        data.map(async (student) => {
          const { data: userData } = await supabase.auth.admin.getUserById(student.id);
          return {
            id: student.id,
            first_name: student.profiles.first_name,
            last_name: student.profiles.last_name,
            phone: student.profiles.phone,
            email: userData.user?.email || '',
            start_date: student.start_date,
            status: student.status,
          };
        })
      );

      return studentData;
    },
    enabled: !!profile?.id,
  });

  // Mutation para adicionar aluno
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: { email: string; firstName: string; lastName: string; phone: string }) => {
      // Primeiro, criar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: 'temp123456', // Senha temporária
        options: {
          data: {
            first_name: studentData.firstName,
            last_name: studentData.lastName,
            role: 'student',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar perfil do aluno
        const { error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            id: authData.user.id,
            trainer_id: profile!.id,
            status: 'active',
          });

        if (profileError) throw profileError;

        // Atualizar telefone se fornecido
        if (studentData.phone) {
          await supabase
            .from('profiles')
            .update({ phone: studentData.phone })
            .eq('id', authData.user.id);
        }
      }

      return authData;
    },
    onSuccess: () => {
      toast({
        title: "Aluno adicionado com sucesso!",
        description: "O aluno foi cadastrado e pode fazer login com a senha temporária.",
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddingStudent(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar aluno",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar status do aluno
  const updateStatusMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: 'active' | 'paused' | 'cancelled' }) => {
      const { error } = await supabase
        .from('student_profiles')
        .update({ status })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddStudent = () => {
    if (!email || !firstName || !lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar limite de alunos
    const currentStudents = students?.filter(s => s.status === 'active').length || 0;
    if (trainerProfile?.plan === 'free' && currentStudents >= 3) {
      toast({
        title: "Limite de alunos atingido",
        description: "Faça upgrade para Pro para adicionar mais alunos.",
        variant: "destructive",
      });
      return;
    }

    addStudentMutation.mutate({
      email,
      firstName,
      lastName,
      phone,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Alunos</h1>
          <p className="text-gray-600">
            Gerencie seus alunos e acompanhe seu progresso
          </p>
        </div>
        <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
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
                  onClick={() => setIsAddingStudent(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddStudent}
                  disabled={addStudentMutation.isPending}
                >
                  {addStudentMutation.isPending ? 'Adicionando...' : 'Adicionar Aluno'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students?.filter(s => s.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite do Plano</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainerProfile?.max_students === 0 ? '∞' : trainerProfile?.max_students}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students && students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {student.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Desde {new Date(student.start_date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(student.status)}>
                      {getStatusText(student.status)}
                    </Badge>
                    <Select
                      value={student.status}
                      onValueChange={(value: 'active' | 'paused' | 'cancelled') => 
                        updateStatusMutation.mutate({ studentId: student.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum aluno cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando seu primeiro aluno para gerenciar treinos e dietas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

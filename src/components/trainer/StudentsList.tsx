
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  start_date: string;
  status: 'active' | 'paused' | 'cancelled';
}

interface StudentsListProps {
  students: Student[];
  onUpdateStatus: (studentId: string, status: 'active' | 'paused' | 'cancelled') => void;
}

export function StudentsList({ students, onUpdateStatus }: StudentsListProps) {
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

  return (
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
                      onUpdateStatus(student.id, value)
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
  );
}

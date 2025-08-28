import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, MoreHorizontal, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Student {
  id: string;
  status: "active" | "paused" | "cancelled";
  start_date: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
}

interface StudentsListProps {
  students: Student[];
  onUpdateStatus: (
    studentId: string,
    status: "active" | "paused" | "cancelled"
  ) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  active: "Ativo",
  paused: "Pausado",
  cancelled: "Cancelado",
};

export function StudentsList({ students, onUpdateStatus }: StudentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Alunos</CardTitle>
        <CardDescription>
          Gerencie todos os seus alunos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.length === 0 ? (
            <EmptyState
              icon={User}
              title="Nenhum aluno cadastrado ainda"
              description='Clique em "Adicionar Aluno" para começar'
            />
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {student.profiles
                        ? `${student.profiles.first_name} ${student.profiles.last_name}`
                        : "Nome não disponível"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {student.profiles?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.profiles.phone}
                        </span>
                      )}
                      <span>
                        Desde{" "}
                        {new Date(student.start_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[student.status]}>
                    {statusLabels[student.status]}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(student.id, "active")}
                        className="text-green-600"
                      >
                        Ativar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(student.id, "paused")}
                        className="text-yellow-600"
                      >
                        Pausar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(student.id, "cancelled")}
                        className="text-red-600"
                      >
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

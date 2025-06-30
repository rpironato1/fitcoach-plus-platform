
import { useAuth } from '@/components/auth/AuthProvider';
import { StudentStatsCards } from '@/components/trainer/StudentStatsCards';
import { AddStudentDialog } from '@/components/trainer/AddStudentDialog';
import { StudentsList } from '@/components/trainer/StudentsList';
import { useStudents } from '@/hooks/useStudents';

export default function StudentsPage() {
  const { profile, trainerProfile } = useAuth();
  const { students, isLoading, addStudent, isAddingStudent, updateStatus } = useStudents(profile?.id);

  const handleAddStudent = (studentData: { email: string; firstName: string; lastName: string; phone: string }) => {
    addStudent(studentData);
  };

  const handleUpdateStatus = (studentId: string, status: 'active' | 'paused' | 'cancelled') => {
    updateStatus({ studentId, status });
  };

  const activeStudentsCount = students?.filter(s => s.status === 'active').length || 0;
  const canAddStudent = trainerProfile?.plan !== 'free' || activeStudentsCount < 3;

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
        <AddStudentDialog
          onAddStudent={handleAddStudent}
          isLoading={isAddingStudent}
          canAddStudent={canAddStudent}
        />
      </div>

      <StudentStatsCards
        totalStudents={students?.length || 0}
        activeStudents={activeStudentsCount}
        maxStudents={trainerProfile?.max_students || 0}
      />

      <StudentsList
        students={students || []}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

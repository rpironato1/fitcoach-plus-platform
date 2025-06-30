
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, User, Calendar, Users, DollarSign, Utensils } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !profile) return null;

  const isTrainer = profile.role === 'trainer';
  const isStudent = profile.role === 'student';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate(isTrainer ? '/trainer' : '/student')}
            >
              FitCoach
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isTrainer && (
              <>
                <Button
                  variant={location.pathname === '/trainer' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/trainer')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={location.pathname === '/trainer/students' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/trainer/students')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Alunos
                </Button>
                <Button
                  variant={location.pathname === '/trainer/sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/trainer/sessions')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Agenda
                </Button>
                <Button
                  variant={location.pathname === '/trainer/diet-plans' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/trainer/diet-plans')}
                  className="flex items-center gap-2"
                >
                  <Utensils className="h-4 w-4" />
                  Dietas
                </Button>
                <Button
                  variant={location.pathname === '/trainer/payments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/trainer/payments')}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Pagamentos
                </Button>
              </>
            )}
            
            {isStudent && (
              <>
                <Button
                  variant={location.pathname === '/student' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/student')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={location.pathname === '/student/sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/student/sessions')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Minhas Sessões
                </Button>
              </>
            )}

            <div className="flex items-center text-sm text-gray-600">
              {profile.first_name} {profile.last_name}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

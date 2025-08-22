
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth';
import { Dumbbell, User, LogOut, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    if (profile?.role === 'trainer') {
      return [
        { href: '/trainer', label: 'Dashboard' },
        { href: '/trainer/students', label: 'Alunos' },
        { href: '/trainer/workouts', label: 'Treinos' },
        { href: '/trainer/sessions', label: 'Sessões' },
        { href: '/trainer/diet-plans', label: 'Dietas' },
      ];
    }
    if (profile?.role === 'student') {
      return [
        { href: '/student', label: 'Meu Dashboard' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={profile?.role === 'trainer' ? '/trainer' : profile?.role === 'student' ? '/student' : '/'} className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FitCoach</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && profile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

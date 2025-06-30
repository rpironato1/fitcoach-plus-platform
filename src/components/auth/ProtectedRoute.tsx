
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'trainer' | 'student';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user, 'profile:', profile?.role, 'requiredRole:', requiredRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('Redirecting to home - no user or profile');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    console.log('Redirecting to home - role mismatch');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

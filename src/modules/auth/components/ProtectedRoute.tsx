import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/LocalStorageAuthProvider";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "trainer" | "student";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

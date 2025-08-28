import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLocalStorageAuth } from "@/components/auth/LocalStorageAuthProvider";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "trainer" | "student";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const authContext = useLocalStorageAuth();
  const location = useLocation();

  if (authContext.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!authContext.user || !authContext.profile) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && authContext.profile.role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}


import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth, ProtectedRoute } from "@/modules/auth";
import { setupModules } from "@/core";
import { Navbar } from "@/components/layout/Navbar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LandingPage } from "@/components/landing/LandingPage";
import TrainerDashboard from "@/pages/trainer/TrainerDashboard";
import StudentsPage from "@/pages/trainer/StudentsPage";
import SessionsPage from "@/pages/trainer/SessionsPage";
import DietPlansPage from "@/pages/trainer/DietPlansPage";
import WorkoutsPage from "@/pages/trainer/WorkoutsPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TrainersManagement from "@/pages/admin/TrainersManagement";
import PaymentsManagement from "@/pages/admin/PaymentsManagement";
import ReportsPage from "@/pages/admin/ReportsPage";
import SystemSettings from "@/pages/admin/SystemSettings";
import NotFound from "./pages/NotFound";

// Import localStorage demo utilities (development only)
import "@/utils/localStorageDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de Layout para rotas de Admin
const AdminRoutes = () => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  </ProtectedRoute>
);

// Componente de Layout para rotas de Trainer
const TrainerRoutes = () => (
  <ProtectedRoute requiredRole="trainer">
    <Navbar />
    <Outlet />
  </ProtectedRoute>
);

// Componente de Layout para rotas de Student
const StudentRoutes = () => (
  <ProtectedRoute requiredRole="student">
    <Navbar />
    <Outlet />
  </ProtectedRoute>
);

function AppContent() {
  const { user, profile, loading } = useAuth();

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

  // Redirecionamento inicial baseado no perfil do usuário
  if (user && profile) {
    const role = profile.role;
    const currentPath = window.location.pathname;

    if (role === 'admin' && !currentPath.startsWith('/admin')) {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'trainer' && !currentPath.startsWith('/trainer')) {
      return <Navigate to="/trainer" replace />;
    }
    if (role === 'student' && !currentPath.startsWith('/student')) {
      return <Navigate to="/student" replace />;
    }
  }

  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={
        profile?.role === 'admin' ? '/admin' :
        profile?.role === 'trainer' ? '/trainer' :
        profile?.role === 'student' ? '/student' : '/'
      } replace />} />

      {/* Rotas de Admin Agrupadas */}
      <Route path="/admin" element={<AdminRoutes />}>
        <Route index element={<AdminDashboard />} />
        <Route path="trainers" element={<TrainersManagement />} />
        <Route path="payments" element={<PaymentsManagement />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Rotas de Trainer Agrupadas */}
      <Route path="/trainer" element={<TrainerRoutes />}>
        <Route index element={<TrainerDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="diet-plans" element={<DietPlansPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
      </Route>

      {/* Rotas de Student Agrupadas */}
      <Route path="/student" element={<StudentRoutes />}>
        <Route index element={<StudentDashboard />} />
      </Route>

      {/* Rota Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    setupModules();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

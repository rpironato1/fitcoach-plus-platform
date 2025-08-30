import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  LocalStorageAuthProvider,
  useLocalStorageAuth,
} from "@/components/auth/LocalStorageAuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { setupModules } from "@/core";
import { Navbar } from "@/components/layout/Navbar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LandingPage } from "@/components/landing/LandingPage";
import { LocalStorageManager } from "@/components/admin/LocalStorageManager";
import NotFound from "./pages/NotFound";
import { initSentry } from "@/sentry";

// Lazy load pages for better performance
const TrainerDashboard = lazy(() => import("@/pages/trainer/TrainerDashboard"));
const StudentsPage = lazy(() => import("@/pages/trainer/StudentsPage"));
const SessionsPage = lazy(() => import("@/pages/trainer/SessionsPage"));
const DietPlansPage = lazy(() => import("@/pages/trainer/DietPlansPage"));
const WorkoutsPage = lazy(() => import("@/pages/trainer/WorkoutsPage"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const StudentDashboardDemo = lazy(() => import("@/pages/student/StudentDashboardDemo"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TrainersManagement = lazy(() => import("@/pages/admin/TrainersManagement"));
const PaymentsManagement = lazy(() => import("@/pages/admin/PaymentsManagement"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const SystemSettings = lazy(() => import("@/pages/admin/SystemSettings"));

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

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Carregando página...</p>
    </div>
  </div>
);

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
  const { user, profile, loading } = useLocalStorageAuth();

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

    if (role === "admin" && !currentPath.startsWith("/admin")) {
      return <Navigate to="/admin" replace />;
    }
    if (role === "trainer" && !currentPath.startsWith("/trainer")) {
      return <Navigate to="/trainer" replace />;
    }
    if (role === "student" && !currentPath.startsWith("/student")) {
      return <Navigate to="/student" replace />;
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rota Pública */}
        <Route
          path="/"
          element={
            !user ? (
              <LandingPage />
            ) : (
              <Navigate
                to={
                  profile?.role === "admin"
                    ? "/admin"
                    : profile?.role === "trainer"
                      ? "/trainer"
                      : profile?.role === "student"
                        ? "/student"
                        : "/"
                }
                replace
              />
            )
          }
        />

        {/* Demo Route - No Authentication Required */}
        <Route path="/student-demo" element={<StudentDashboardDemo />} />

        {/* LocalStorage Manager - No Authentication Required */}
        <Route path="/localStorage-manager" element={<LocalStorageManager />} />

        {/* Rotas de Admin Agrupadas */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<AdminDashboard />} />
          <Route path="trainers" element={<TrainersManagement />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="localStorage" element={<LocalStorageManager />} />
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
    </Suspense>
  );
}

const App = () => {
  useEffect(() => {
    initSentry();
    setupModules();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LocalStorageAuthProvider>
            <AppContent />
          </LocalStorageAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

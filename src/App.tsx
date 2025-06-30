
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LandingPage } from "@/components/landing/LandingPage";
import TrainerDashboard from "@/pages/trainer/TrainerDashboard";
import StudentsPage from "@/pages/trainer/StudentsPage";
import SessionsPage from "@/pages/trainer/SessionsPage";
import DietPlansPage from "@/pages/trainer/DietPlansPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TrainersManagement from "@/pages/admin/TrainersManagement";
import PaymentsManagement from "@/pages/admin/PaymentsManagement";
import ReportsPage from "@/pages/admin/ReportsPage";
import SystemSettings from "@/pages/admin/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  console.log('AppRoutes - loading:', loading, 'user:', !!user, 'profile:', profile?.role);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inicializando aplicação...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {profile.role !== 'admin' && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={
            profile.role === 'admin' ? <Navigate to="/admin" replace /> :
            profile.role === 'trainer' ? <Navigate to="/trainer" replace /> :
            profile.role === 'student' ? <Navigate to="/student" replace /> :
            <LandingPage />
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/trainers" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <TrainersManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/payments" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <PaymentsManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <SystemSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Trainer Routes */}
          <Route path="/trainer" element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/trainer/students" element={
            <ProtectedRoute requiredRole="trainer">
              <StudentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/trainer/sessions" element={
            <ProtectedRoute requiredRole="trainer">
              <SessionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/trainer/diet-plans" element={
            <ProtectedRoute requiredRole="trainer">
              <DietPlansPage />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

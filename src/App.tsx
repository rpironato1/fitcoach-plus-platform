
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { LandingPage } from "@/components/landing/LandingPage";
import TrainerDashboard from "@/pages/trainer/TrainerDashboard";
import StudentDashboard from "@/pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && profile && <Navbar />}
      <main className={user && profile ? '' : ''}>
        <Routes>
          <Route path="/" element={
            !user ? <LandingPage /> : 
            profile?.role === 'trainer' ? <Navigate to="/trainer" replace /> :
            profile?.role === 'student' ? <Navigate to="/student" replace /> :
            <LandingPage />
          } />
          
          <Route path="/trainer" element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/trainer/*" element={
            <ProtectedRoute requiredRole="trainer">
              <div className="p-6">
                <h1 className="text-2xl font-bold">Funcionalidade em desenvolvimento</h1>
                <p className="text-gray-600 mt-2">Esta seção estará disponível em breve.</p>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <div className="p-6">
                <h1 className="text-2xl font-bold">Funcionalidade em desenvolvimento</h1>
                <p className="text-gray-600 mt-2">Esta seção estará disponível em breve.</p>
              </div>
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

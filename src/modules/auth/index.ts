// Components
export { AuthProvider, useAuth } from './components/AuthProvider';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ProtectedRoute } from './components/ProtectedRoute';

// Services
export { SupabaseAuthService, SupabaseProfileService } from './services/AuthService';

// Types
export type { 
  AuthService, 
  ProfileService, 
  AuthContextType, 
  Profile, 
  TrainerProfile, 
  StudentProfile 
} from './types';

// Setup function to register services in DI container
export function setupAuthModule() {
  const { container } = require('@/core');
  
  // Import here to avoid circular dependencies
  const { SupabaseAuthService, SupabaseProfileService } = require('./services/AuthService');
  
  container.bind('AuthService').to(SupabaseAuthService);
  container.bind('ProfileService').to(SupabaseProfileService);
}
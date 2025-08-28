// Components
export { LocalStorageAuthProvider as AuthProvider, useLocalStorageAuth as useAuth } from '../components/auth/LocalStorageAuthProvider';
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ProtectedRoute } from './components/ProtectedRoute';

// Services
export { LocalStorageAuthService, LocalStorageProfileService } from './services/LocalStorageAuthService';

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
export async function setupAuthModule() {
  const { container } = await import('@/core');
  
  // Import here to avoid circular dependencies
  const { LocalStorageAuthService, LocalStorageProfileService } = await import('./services/LocalStorageAuthService');
  
  container.bind('AuthService').to(LocalStorageAuthService);
  container.bind('ProfileService').to(LocalStorageProfileService);
}
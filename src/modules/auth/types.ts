import { Database } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';

// Database types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TrainerProfile = Database['public']['Tables']['trainer_profiles']['Row'];
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];

// Auth context types
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  trainerProfile: TrainerProfile | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
}

// Auth service interface
export interface AuthService {
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, userData: Record<string, unknown>): Promise<void>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<{ user: User | null }>;
  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void };
}

// Profile service interface
export interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>;
  getTrainerProfile(userId: string): Promise<TrainerProfile | null>;
  getStudentProfile(userId: string): Promise<StudentProfile | null>;
}
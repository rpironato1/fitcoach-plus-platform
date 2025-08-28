import { Database } from '@/types/database';

// Mock User type to replace Supabase User
export interface LocalStorageOnlyUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  last_sign_in_at: string;
}

// Database types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TrainerProfile = Database['public']['Tables']['trainer_profiles']['Row'];
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];

// Auth context types
export interface AuthContextType {
  user: LocalStorageOnlyUser | null;
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
  getCurrentSession(): Promise<{ user: LocalStorageOnlyUser | null }>;
  onAuthStateChange(callback: (user: LocalStorageOnlyUser | null) => void): { unsubscribe: () => void };
}

// Profile service interface
export interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>;
  getTrainerProfile(userId: string): Promise<TrainerProfile | null>;
  getStudentProfile(userId: string): Promise<StudentProfile | null>;
}
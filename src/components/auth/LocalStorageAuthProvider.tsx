/**
 * LocalStorage Auth Provider
 * 
 * Alternative to SupabaseAuthProvider that uses localStorage for authentication
 * and data management. Useful for testing and development.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Database } from '@/integrations/supabase/types';
import { localStorageService, LocalStorageUser, LocalStorageAuthSession } from '@/services/localStorageService';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TrainerProfile = Database['public']['Tables']['trainer_profiles']['Row'];
type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];

interface AuthContextType {
  user: LocalStorageUser | null;
  profile: Profile | null;
  trainerProfile: TrainerProfile | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function LocalStorageAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalStorageUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profileData = localStorageService.getProfileByUserId(userId);
      
      if (profileData) {
        setProfile(profileData);

        if (profileData.role === 'trainer') {
          const trainerData = localStorageService.getTrainerProfileByUserId(userId);
          setTrainerProfile(trainerData);
        } else if (profileData.role === 'student') {
          const studentData = localStorageService.getStudentProfileByUserId(userId);
          setStudentProfile(studentData);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      // Initialize localStorage data if needed
      localStorageService.initializeData();
      
      // Check for existing session
      const session = localStorageService.getCurrentSession();
      if (session) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes, accept any password for demo accounts
      const demoCredentials = localStorageService.getDemoCredentials();
      const isDemoAccount = Object.values(demoCredentials).some(cred => cred.email === email);
      
      if (isDemoAccount || password) {
        const session = await localStorageService.signIn(email, password);
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
    try {
      setLoading(true);
      
      const session = await localStorageService.signUp(email, password, {
        first_name: userData.first_name as string,
        last_name: userData.last_name as string,
        role: userData.role as 'admin' | 'trainer' | 'student'
      });
      
      setUser(session.user);
      await loadUserProfile(session.user.id);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await localStorageService.signOut();
      setUser(null);
      setProfile(null);
      setTrainerProfile(null);
      setStudentProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    trainerProfile,
    studentProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useLocalStorageAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useLocalStorageAuth must be used within a LocalStorageAuthProvider');
  }
  return context;
}
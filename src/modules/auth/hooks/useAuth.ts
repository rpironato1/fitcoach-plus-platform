import { useEffect, useState } from 'react';
import { container } from '@/core';
import { AuthService, ProfileService, Profile, TrainerProfile, StudentProfile } from '../types';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Wait for services to be registered
        while (!container.isBound('AuthService') || !container.isBound('ProfileService')) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const authService = container.resolve<AuthService>('AuthService');
        const profileService = container.resolve<ProfileService>('ProfileService');

        subscription = authService.onAuthStateChange(async (newUser) => {
          if (!mounted) return;
          
          setUser(newUser);
          
          if (newUser) {
            await loadUserProfile(newUser.id, profileService);
          } else {
            setProfile(null);
            setTrainerProfile(null);
            setStudentProfile(null);
            setLoading(false);
          }
        });

        const getInitialSession = async () => {
          try {
            const { user: sessionUser } = await authService.getCurrentSession();
            
            if (sessionUser && mounted) {
              setUser(sessionUser);
              await loadUserProfile(sessionUser.id, profileService);
            } else if (mounted) {
              setLoading(false);
            }
          } catch (error) {
            if (mounted) setLoading(false);
          }
        };

        await getInitialSession();
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserProfile = async (userId: string, profileService: ProfileService) => {
    try {
      const profileData = await profileService.getProfile(userId);
      
      if (profileData) {
        setProfile(profileData);

        if (profileData.role === 'trainer') {
          const trainerData = await profileService.getTrainerProfile(userId);
          if (trainerData) {
            setTrainerProfile(trainerData);
          }
        } else if (profileData.role === 'student') {
          const studentData = await profileService.getStudentProfile(userId);
          if (studentData) {
            setStudentProfile(studentData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const authService = container.resolve<AuthService>('AuthService');
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
    const authService = container.resolve<AuthService>('AuthService');
    await authService.signUp(email, password, userData);
  };

  const signOut = async () => {
    const authService = container.resolve<AuthService>('AuthService');
    await authService.signOut();
  };

  return {
    user,
    profile,
    trainerProfile,
    studentProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
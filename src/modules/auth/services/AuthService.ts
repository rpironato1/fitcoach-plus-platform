import { supabase } from '@/integrations/supabase/client';
import { AuthService, ProfileService, Profile, TrainerProfile, StudentProfile } from '../types';
import { User } from '@supabase/supabase-js';

export class SupabaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async signUp(email: string, password: string, userData: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      },
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentSession(): Promise<{ user: User | null }> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { user: session?.user ?? null };
  }

  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        callback(session?.user ?? null);
      }
    );
    
    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}

export class SupabaseProfileService implements ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching trainer profile:', error);
      return null;
    }

    return data;
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return data;
  }
}
/**
 * LocalStorage Auth Service for Testing Purposes
 * 
 * This service simulates authentication using localStorage data for testing
 * when Supabase is not available or in development/testing mode.
 */

import { AuthService, ProfileService, Profile, TrainerProfile, StudentProfile } from '../types';
import { User } from '@supabase/supabase-js';
import { localStorageService } from '@/services/localStorageService';

export class LocalStorageAuthService implements AuthService {
  private listeners: ((user: User | null) => void)[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Initialize localStorage data if it doesn't exist
    localStorageService.initializeData();
    
    // Check if we have a simulated logged-in user
    const authState = localStorage.getItem('localStorage_auth_state');
    if (authState) {
      this.currentUser = JSON.parse(authState);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    // For testing purposes, any email/password combination works
    const mockUser: User = {
      id: 'trainer_123', // Use the same ID as in localStorage data
      email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    this.currentUser = mockUser;
    localStorage.setItem('localStorage_auth_state', JSON.stringify(mockUser));
    
    // Notify listeners
    this.listeners.forEach(listener => listener(mockUser));
  }

  async signUp(email: string, password: string, userData: Record<string, unknown>): Promise<void> {
    // For testing, signUp works the same as signIn
    await this.signIn(email, password);
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('localStorage_auth_state');
    
    // Notify listeners
    this.listeners.forEach(listener => listener(null));
  }

  async getCurrentSession(): Promise<{ user: User | null }> {
    return { user: this.currentUser };
  }

  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.currentUser);
    
    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }
}

export class LocalStorageProfileService implements ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    const data = localStorageService.getData();
    if (!data) return null;

    // Find trainer profile with matching ID
    const trainerProfile = data.trainer_profiles.find(profile => profile.id === userId);
    if (trainerProfile) {
      return {
        id: trainerProfile.id,
        first_name: trainerProfile.first_name,
        last_name: trainerProfile.last_name,
        email: trainerProfile.email,
        role: 'trainer' as const,
        phone: trainerProfile.phone,
        created_at: trainerProfile.created_at,
        updated_at: trainerProfile.updated_at,
      };
    }

    return null;
  }

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    const data = localStorageService.getData();
    if (!data) return null;

    return data.trainer_profiles.find(profile => profile.id === userId) || null;
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    // For this test implementation, we're focusing on trainer profiles
    return null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    // For testing purposes, just return the existing profile
    return this.getProfile(userId);
  }

  async updateTrainerProfile(userId: string, updates: Partial<TrainerProfile>): Promise<TrainerProfile | null> {
    // For testing purposes, just return the existing profile
    return this.getTrainerProfile(userId);
  }

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> {
    return null;
  }
}
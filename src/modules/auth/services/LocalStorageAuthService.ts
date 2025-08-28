/**
 * LocalStorage-only Auth Service
 *
 * Provides authentication services using only localStorage,
 * removing all Supabase dependencies.
 */

import {
  AuthService,
  ProfileService,
  Profile,
  TrainerProfile,
  StudentProfile,
} from "../types";
import {
  localStorageService,
  LocalStorageUser,
} from "@/services/localStorageService";

// Mock User type to replace Supabase User
export interface LocalStorageOnlyUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  last_sign_in_at: string;
}

export class LocalStorageAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<void> {
    await localStorageService.signIn(email, password);
  }

  async signUp(
    email: string,
    password: string,
    userData: Record<string, unknown>
  ): Promise<void> {
    await localStorageService.signUp(email, password, {
      first_name: userData.first_name as string,
      last_name: userData.last_name as string,
      role: userData.role as "admin" | "trainer" | "student",
    });
  }

  async signOut(): Promise<void> {
    await localStorageService.signOut();
  }

  async getCurrentSession(): Promise<{ user: LocalStorageOnlyUser | null }> {
    try {
      const session = localStorageService.getCurrentSession();
      return { user: session?.user || null };
    } catch (error) {
      console.error("Error getting current session:", error);
      return { user: null };
    }
  }

  onAuthStateChange(callback: (user: LocalStorageOnlyUser | null) => void): {
    unsubscribe: () => void;
  } {
    // For localStorage, we'll simulate auth state changes with a simple interval check
    let lastUser: LocalStorageOnlyUser | null = null;

    const checkAuthState = () => {
      try {
        const session = localStorageService.getCurrentSession();
        const currentUser = session?.user || null;

        // Only call callback if user state changed
        if (JSON.stringify(currentUser) !== JSON.stringify(lastUser)) {
          lastUser = currentUser;
          callback(currentUser);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    };

    // Initial check
    checkAuthState();

    // Set up periodic checking
    const intervalId = setInterval(checkAuthState, 1000);

    return {
      unsubscribe: () => clearInterval(intervalId),
    };
  }
}

export class LocalStorageProfileService implements ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      return localStorageService.getProfileByUserId(userId);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    try {
      return localStorageService.getTrainerProfileByUserId(userId);
    } catch (error) {
      console.error("Error fetching trainer profile:", error);
      return null;
    }
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      return localStorageService.getStudentProfileByUserId(userId);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      return null;
    }
  }
}

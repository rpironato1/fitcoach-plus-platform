import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseAuthService, SupabaseProfileService } from './AuthService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
    })),
  },
}));

// Get the mocked supabase instance
const mockSupabase = vi.mocked(supabase);

describe('SupabaseAuthService', () => {
  let authService: SupabaseAuthService;

  beforeEach(() => {
    authService = new SupabaseAuthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });

      await expect(authService.signIn('user@test.com', 'password123')).resolves.not.toThrow();

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
      });
    });

    it('should throw error when sign in fails', async () => {
      const mockError = new Error('Invalid credentials');
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: mockError });

      await expect(authService.signIn('user@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors during sign in', async () => {
      const networkError = new Error('Network error');
      mockSupabase.auth.signInWithPassword.mockRejectedValue(networkError);

      await expect(authService.signIn('user@test.com', 'password123')).rejects.toThrow('Network error');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with valid data', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null });

      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
      };

      await expect(authService.signUp('john@test.com', 'password123', userData)).resolves.not.toThrow();

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'john@test.com',
        password: 'password123',
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
    });

    it('should throw error when sign up fails', async () => {
      const mockError = new Error('Email already exists');
      mockSupabase.auth.signUp.mockResolvedValue({ error: mockError });

      await expect(authService.signUp('existing@test.com', 'password123', {})).rejects.toThrow('Email already exists');
    });

    it('should handle complex user data during sign up', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null });

      const complexUserData = {
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'trainer',
        phone: '+1234567890',
        bio: 'Experienced trainer',
      };

      await expect(authService.signUp('jane@test.com', 'password123', complexUserData)).resolves.not.toThrow();

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'jane@test.com',
        password: 'password123',
        options: {
          data: complexUserData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await expect(authService.signOut()).resolves.not.toThrow();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const mockError = new Error('Sign out failed');
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentSession', () => {
    it('should return user when session exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: mockUser });
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null user when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: null });
    });

    it('should throw error when session retrieval fails', async () => {
      const mockError = new Error('Session retrieval failed');
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await expect(authService.getCurrentSession()).rejects.toThrow('Session retrieval failed');
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSubscription = { unsubscribe: mockUnsubscribe };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const result = authService.onAuthStateChange(callback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(result).toHaveProperty('unsubscribe');
      expect(typeof result.unsubscribe).toBe('function');

      // Test unsubscribe functionality
      result.unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback with user when auth state changes', () => {
      const callback = vi.fn();
      let authStateCallback: ((event: string, session: unknown) => void) | undefined;

      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      authService.onAuthStateChange(callback);

      // Simulate auth state change with user
      const mockUser = { id: 'user-123', email: 'user@test.com' };
      authStateCallback?.('SIGNED_IN', { user: mockUser });

      expect(callback).toHaveBeenCalledWith(mockUser);
    });

    it('should call callback with null when user signs out', () => {
      const callback = vi.fn();
      let authStateCallback: ((event: string, session: unknown) => void) | undefined;

      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      authService.onAuthStateChange(callback);

      // Simulate sign out
      authStateCallback?.('SIGNED_OUT', null);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });
});

describe('SupabaseProfileService', () => {
  let profileService: SupabaseProfileService;

  beforeEach(() => {
    profileService = new SupabaseProfileService();
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'user@test.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
      };

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should return null when profile not found', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getProfile('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should return null and log error when database error occurs', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Database error');

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getProfile('user-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching profile:', mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTrainerProfile', () => {
    it('should return trainer profile when found', async () => {
      const mockTrainerProfile = {
        id: 'trainer-123',
        bio: 'Experienced trainer',
        specializations: ['strength', 'cardio'],
        years_experience: 5,
      };

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockTrainerProfile,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getTrainerProfile('trainer-123');

      expect(result).toEqual(mockTrainerProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('trainer_profiles');
    });

    it('should handle trainer profile database errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Trainer profile error');

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getTrainerProfile('trainer-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching trainer profile:', mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStudentProfile', () => {
    it('should return student profile when found', async () => {
      const mockStudentProfile = {
        id: 'student-123',
        goals: ['weight_loss', 'muscle_gain'],
        fitness_level: 'beginner',
        preferences: { workout_time: 'morning' },
      };

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockStudentProfile,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getStudentProfile('student-123');

      expect(result).toEqual(mockStudentProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('student_profiles');
    });

    it('should handle student profile database errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Student profile error');

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      const result = await profileService.getStudentProfile('student-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching student profile:', mockError);

      consoleErrorSpy.mockRestore();
    });
  });
});
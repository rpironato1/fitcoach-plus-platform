import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageAuthService, LocalStorageProfileService } from './LocalStorageAuthService';
import { localStorageService } from '@/services/localStorageService';

vi.mock('@/services/localStorageService', () => ({
  localStorageService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentSession: vi.fn(),
    getProfileByUserId: vi.fn(),
    getTrainerProfileByUserId: vi.fn(),
    getStudentProfileByUserId: vi.fn(),
  },
}));

// Get the mocked localStorageService instance
const mockLocalStorageService = vi.mocked(localStorageService);

describe('LocalStorageAuthService', () => {
  let authService: LocalStorageAuthService;

  beforeEach(() => {
    authService = new LocalStorageAuthService();
    // Reset mocks
    vi.clearAllMocks();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      mockLocalStorageService.signIn.mockResolvedValue(undefined);

      await expect(authService.signIn('user@test.com', 'password123')).resolves.not.toThrow();

      expect(mockLocalStorageService.signIn).toHaveBeenCalledWith('user@test.com', 'password123');
    });

    it('should throw error when sign in fails', async () => {
      const mockError = new Error('Invalid credentials');
      mockLocalStorageService.signIn.mockRejectedValue(mockError);

      await expect(authService.signIn('user@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should handle localStorage service errors', async () => {
      const serviceError = new Error('LocalStorage error');
      mockLocalStorageService.signIn.mockRejectedValue(serviceError);

      await expect(authService.signIn('test@test.com', 'password')).rejects.toThrow('LocalStorage error');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with valid data', async () => {
      mockLocalStorageService.signUp.mockResolvedValue(undefined);

      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
      };

      await expect(authService.signUp('john@test.com', 'password123', userData)).resolves.not.toThrow();

      expect(mockLocalStorageService.signUp).toHaveBeenCalledWith('john@test.com', 'password123', {
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
      });
    });

    it('should handle trainer role sign up', async () => {
      mockLocalStorageService.signUp.mockResolvedValue(undefined);

      const userData = {
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'trainer',
        bio: 'Experienced trainer',
      };

      await expect(authService.signUp('jane@test.com', 'password123', userData)).resolves.not.toThrow();

      expect(mockLocalStorageService.signUp).toHaveBeenCalledWith('jane@test.com', 'password123', {
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'trainer',
      });
    });

    it('should handle admin role sign up', async () => {
      mockLocalStorageService.signUp.mockResolvedValue(undefined);

      const userData = {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      };

      await expect(authService.signUp('admin@test.com', 'password123', userData)).resolves.not.toThrow();

      expect(mockLocalStorageService.signUp).toHaveBeenCalledWith('admin@test.com', 'password123', {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      });
    });

    it('should throw error when sign up fails', async () => {
      const mockError = new Error('Email already exists');
      mockLocalStorageService.signUp.mockRejectedValue(mockError);

      await expect(authService.signUp('existing@test.com', 'password123', {})).rejects.toThrow('Email already exists');
    });

    it('should handle missing user data gracefully', async () => {
      mockLocalStorageService.signUp.mockResolvedValue(undefined);

      const userData = {}; // Empty user data

      await expect(authService.signUp('test@test.com', 'password123', userData)).resolves.not.toThrow();

      expect(mockLocalStorageService.signUp).toHaveBeenCalledWith('test@test.com', 'password123', {
        first_name: undefined,
        last_name: undefined,
        role: undefined,
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockLocalStorageService.signOut.mockResolvedValue(undefined);

      await expect(authService.signOut()).resolves.not.toThrow();

      expect(mockLocalStorageService.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const mockError = new Error('Sign out failed');
      mockLocalStorageService.signOut.mockRejectedValue(mockError);

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentSession', () => {
    it('should return user when session exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
      };

      mockLocalStorageService.getCurrentSession.mockReturnValue({
        user: mockUser,
      });

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: mockUser });
      expect(mockLocalStorageService.getCurrentSession).toHaveBeenCalled();
    });

    it('should return null user when no session exists', async () => {
      mockLocalStorageService.getCurrentSession.mockReturnValue(null);

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: null });
    });

    it('should return null user when session has no user', async () => {
      mockLocalStorageService.getCurrentSession.mockReturnValue({
        user: null,
      });

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: null });
    });

    it('should handle errors gracefully and return null user', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorageService.getCurrentSession.mockImplementation(() => {
        throw new Error('Session retrieval failed');
      });

      const result = await authService.getCurrentSession();

      expect(result).toEqual({ user: null });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting current session:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener with initial check', () => {
      const callback = vi.fn();
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
      };

      mockLocalStorageService.getCurrentSession.mockReturnValue({
        user: mockUser,
      });

      const result = authService.onAuthStateChange(callback);

      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveProperty('unsubscribe');
      expect(typeof result.unsubscribe).toBe('function');
    });

    it('should set up auth state change listener and handle unsubscribe', () => {
      const callback = vi.fn();
      
      // Set initial state
      mockLocalStorageService.getCurrentSession.mockReturnValue(null);

      const result = authService.onAuthStateChange(callback);

      // Should have an unsubscribe function
      expect(typeof result.unsubscribe).toBe('function');

      // Should be able to unsubscribe without error
      expect(() => result.unsubscribe()).not.toThrow();
    });

    it('should not call callback if user state unchanged', () => {
      const callback = vi.fn();
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
      };

      mockLocalStorageService.getCurrentSession.mockReturnValue({
        user: mockUser,
      });

      const result = authService.onAuthStateChange(callback);

      expect(callback).toHaveBeenCalledTimes(1);

      // Advance timer - user unchanged
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledTimes(1); // Still only called once

      result.unsubscribe();
    });

    it('should handle errors during auth state checking', () => {
      const callback = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockLocalStorageService.getCurrentSession.mockImplementation(() => {
        throw new Error('Auth state check failed');
      });

      const result = authService.onAuthStateChange(callback);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking auth state:', expect.any(Error));

      result.unsubscribe();
      consoleErrorSpy.mockRestore();
    });

    it('should handle auth state checking gracefully', () => {
      const callback = vi.fn();
      
      // Set initial state
      mockLocalStorageService.getCurrentSession.mockReturnValue(null);

      const result = authService.onAuthStateChange(callback);

      // Should handle subscription setup
      expect(result).toHaveProperty('unsubscribe');
      expect(typeof result.unsubscribe).toBe('function');

      result.unsubscribe();
    });
  });
});

describe('LocalStorageProfileService', () => {
  let profileService: LocalStorageProfileService;

  beforeEach(() => {
    profileService = new LocalStorageProfileService();
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'user@test.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student' as const,
      };

      mockLocalStorageService.getProfileByUserId.mockReturnValue(mockProfile);

      const result = await profileService.getProfile('user-123');

      expect(result).toEqual(mockProfile);
      expect(mockLocalStorageService.getProfileByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return null when profile not found', async () => {
      mockLocalStorageService.getProfileByUserId.mockReturnValue(null);

      const result = await profileService.getProfile('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorageService.getProfileByUserId.mockImplementation(() => {
        throw new Error('Profile retrieval failed');
      });

      const result = await profileService.getProfile('user-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching profile:', expect.any(Error));

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

      mockLocalStorageService.getTrainerProfileByUserId.mockReturnValue(mockTrainerProfile);

      const result = await profileService.getTrainerProfile('trainer-123');

      expect(result).toEqual(mockTrainerProfile);
      expect(mockLocalStorageService.getTrainerProfileByUserId).toHaveBeenCalledWith('trainer-123');
    });

    it('should return null when trainer profile not found', async () => {
      mockLocalStorageService.getTrainerProfileByUserId.mockReturnValue(null);

      const result = await profileService.getTrainerProfile('nonexistent-trainer');

      expect(result).toBeNull();
    });

    it('should handle trainer profile errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorageService.getTrainerProfileByUserId.mockImplementation(() => {
        throw new Error('Trainer profile error');
      });

      const result = await profileService.getTrainerProfile('trainer-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching trainer profile:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getStudentProfile', () => {
    it('should return student profile when found', async () => {
      const mockStudentProfile = {
        id: 'student-123',
        goals: ['weight_loss', 'muscle_gain'],
        fitness_level: 'beginner' as const,
        preferences: { workout_time: 'morning' },
      };

      mockLocalStorageService.getStudentProfileByUserId.mockReturnValue(mockStudentProfile);

      const result = await profileService.getStudentProfile('student-123');

      expect(result).toEqual(mockStudentProfile);
      expect(mockLocalStorageService.getStudentProfileByUserId).toHaveBeenCalledWith('student-123');
    });

    it('should return null when student profile not found', async () => {
      mockLocalStorageService.getStudentProfileByUserId.mockReturnValue(null);

      const result = await profileService.getStudentProfile('nonexistent-student');

      expect(result).toBeNull();
    });

    it('should handle student profile errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorageService.getStudentProfileByUserId.mockImplementation(() => {
        throw new Error('Student profile error');
      });

      const result = await profileService.getStudentProfile('student-123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching student profile:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
/**
 * Comprehensive test suite for localStorageService
 * Testing critical data management functionality - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { localStorageService } from './localStorageService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('LocalStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    describe('signIn', () => {
      it('should sign in with valid admin credentials', async () => {
        const mockData = {
          users: [{
            id: 'admin-123',
            email: 'admin@fitcoach.com',
            password: 'admin123',
            created_at: '2024-01-01T00:00:00Z',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-01T00:00:00Z',
          }],
          profiles: [{
            id: 'admin-123',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        await expect(localStorageService.signIn('admin@fitcoach.com', 'admin123')).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_session',
          expect.stringContaining('"user"')
        );
      });

      it('should sign in with valid trainer credentials', async () => {
        const mockData = {
          users: [{
            id: 'trainer-123',
            email: 'trainer@fitcoach.com',
            password: 'trainer123',
            created_at: '2024-01-01T00:00:00Z',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-01T00:00:00Z',
          }],
          profiles: [{
            id: 'trainer-123',
            first_name: 'Trainer',
            last_name: 'User',
            role: 'trainer',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        await expect(localStorageService.signIn('trainer@fitcoach.com', 'trainer123')).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_session',
          expect.stringContaining('"user"')
        );
      });

      it('should sign in with valid student credentials', async () => {
        const mockData = {
          users: [{
            id: 'student-123',
            email: 'student@fitcoach.com',
            password: 'student123',
            created_at: '2024-01-01T00:00:00Z',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-01T00:00:00Z',
          }],
          profiles: [{
            id: 'student-123',
            first_name: 'Student',
            last_name: 'User',
            role: 'student',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        await expect(localStorageService.signIn('student@fitcoach.com', 'student123')).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_session',
          expect.stringContaining('"user"')
        );
      });

      it('should reject invalid credentials', async () => {
        const mockData = {
          users: [{
            id: 'user-123',
            email: 'user@test.com',
            password: 'correctpassword',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        await expect(localStorageService.signIn('user@test.com', 'wrongpassword')).rejects.toThrow('Credenciais inválidas');
      });

      it('should reject non-existent user', async () => {
        const mockData = { users: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        await expect(localStorageService.signIn('nonexistent@test.com', 'password')).rejects.toThrow('Credenciais inválidas');
      });

      it('should handle corrupted localStorage data', async () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json');

        await expect(localStorageService.signIn('user@test.com', 'password')).rejects.toThrow();
      });

      it('should handle missing localStorage data', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        await expect(localStorageService.signIn('user@test.com', 'password')).rejects.toThrow('Credenciais inválidas');
      });
    });

    describe('signUp', () => {
      it('should create new student user successfully', async () => {
        const existingData = {
          users: [],
          profiles: [],
          trainer_profiles: [],
          student_profiles: [],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        await expect(localStorageService.signUp('newstudent@test.com', 'password123', {
          first_name: 'New',
          last_name: 'Student',
          role: 'student',
        })).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_data',
          expect.stringContaining('"newstudent@test.com"')
        );
      });

      it('should create new trainer user successfully', async () => {
        const existingData = {
          users: [],
          profiles: [],
          trainer_profiles: [],
          student_profiles: [],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        await expect(localStorageService.signUp('newtrainer@test.com', 'password123', {
          first_name: 'New',
          last_name: 'Trainer',
          role: 'trainer',
        })).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_data',
          expect.stringContaining('"newtrainer@test.com"')
        );
      });

      it('should create new admin user successfully', async () => {
        const existingData = {
          users: [],
          profiles: [],
          trainer_profiles: [],
          student_profiles: [],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        await expect(localStorageService.signUp('newadmin@test.com', 'password123', {
          first_name: 'New',
          last_name: 'Admin',
          role: 'admin',
        })).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'fitcoach_data',
          expect.stringContaining('"newadmin@test.com"')
        );
      });

      it('should reject duplicate email', async () => {
        const existingData = {
          users: [{
            id: 'existing-123',
            email: 'existing@test.com',
            password: 'password',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        await expect(localStorageService.signUp('existing@test.com', 'password123', {
          first_name: 'New',
          last_name: 'User',
          role: 'student',
        })).rejects.toThrow('Email já cadastrado');
      });

      it('should handle missing localStorage data during signup', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        await expect(localStorageService.signUp('new@test.com', 'password123', {
          first_name: 'New',
          last_name: 'User',
          role: 'student',
        })).resolves.not.toThrow();

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('signOut', () => {
      it('should remove session successfully', async () => {
        await expect(localStorageService.signOut()).resolves.not.toThrow();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('fitcoach_session');
      });
    });

    describe('getCurrentSession', () => {
      it('should return current session when exists', () => {
        const mockSession = {
          user: {
            id: 'user-123',
            email: 'user@test.com',
            created_at: '2024-01-01T00:00:00Z',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-01T00:00:00Z',
          },
          access_token: 'token123',
          refresh_token: 'refresh123',
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSession));

        const result = localStorageService.getCurrentSession();

        expect(result).toEqual(mockSession);
      });

      it('should return null when no session exists', () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = localStorageService.getCurrentSession();

        expect(result).toBeNull();
      });

      it('should handle corrupted session data', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json');

        const result = localStorageService.getCurrentSession();

        expect(result).toBeNull();
      });
    });
  });

  describe('Profile Management', () => {
    describe('getProfileByUserId', () => {
      it('should return profile when found', () => {
        const mockData = {
          profiles: [{
            id: 'user-123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'student',
            email: 'john@test.com',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getProfileByUserId('user-123');

        expect(result).toEqual(mockData.profiles[0]);
      });

      it('should return null when profile not found', () => {
        const mockData = { profiles: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getProfileByUserId('nonexistent');

        expect(result).toBeNull();
      });

      it('should handle missing data gracefully', () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = localStorageService.getProfileByUserId('user-123');

        expect(result).toBeNull();
      });
    });

    describe('getTrainerProfileByUserId', () => {
      it('should return trainer profile when found', () => {
        const mockData = {
          trainer_profiles: [{
            id: 'trainer-123',
            plan: 'pro',
            max_students: 50,
            ai_credits: 100,
            bio: 'Experienced trainer',
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getTrainerProfileByUserId('trainer-123');

        expect(result).toEqual(mockData.trainer_profiles[0]);
      });

      it('should return null when trainer profile not found', () => {
        const mockData = { trainer_profiles: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getTrainerProfileByUserId('nonexistent');

        expect(result).toBeNull();
      });
    });

    describe('getStudentProfileByUserId', () => {
      it('should return student profile when found', () => {
        const mockData = {
          student_profiles: [{
            id: 'student-123',
            goals: ['weight_loss'],
            fitness_level: 'beginner',
            preferences: { workout_time: 'morning' },
          }],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getStudentProfileByUserId('student-123');

        expect(result).toEqual(mockData.student_profiles[0]);
      });

      it('should return null when student profile not found', () => {
        const mockData = { student_profiles: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getStudentProfileByUserId('nonexistent');

        expect(result).toBeNull();
      });
    });
  });

  describe('Data Management', () => {
    describe('getWorkouts', () => {
      it('should return workouts for user', () => {
        const mockData = {
          workouts: [
            { id: 'workout-1', student_id: 'user-123', name: 'Push Day' },
            { id: 'workout-2', student_id: 'user-456', name: 'Pull Day' },
          ],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getWorkouts('user-123');

        expect(result).toEqual([mockData.workouts[0]]);
      });

      it('should return empty array when no workouts found', () => {
        const mockData = { workouts: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getWorkouts('user-123');

        expect(result).toEqual([]);
      });
    });

    describe('getMealPlans', () => {
      it('should return meal plans for user', () => {
        const mockData = {
          meal_plans: [
            { id: 'meal-1', student_id: 'user-123', name: 'Bulking Plan' },
            { id: 'meal-2', student_id: 'user-456', name: 'Cutting Plan' },
          ],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getMealPlans('user-123');

        expect(result).toEqual([mockData.meal_plans[0]]);
      });

      it('should return empty array when no meal plans found', () => {
        const mockData = { meal_plans: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getMealPlans('user-123');

        expect(result).toEqual([]);
      });
    });

    describe('getStudents', () => {
      it('should return students for trainer', () => {
        const mockData = {
          profiles: [
            { id: 'student-1', trainer_id: 'trainer-123', role: 'student', first_name: 'John' },
            { id: 'student-2', trainer_id: 'trainer-456', role: 'student', first_name: 'Jane' },
            { id: 'trainer-123', role: 'trainer', first_name: 'Trainer' },
          ],
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getStudents('trainer-123');

        expect(result).toEqual([mockData.profiles[0]]);
      });

      it('should return empty array when no students found', () => {
        const mockData = { profiles: [] };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = localStorageService.getStudents('trainer-123');

        expect(result).toEqual([]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      mockLocalStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        localStorageService.saveData({ test: 'data' });
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle JSON parsing errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {');

      const result = localStorageService.getCurrentSession();

      expect(result).toBeNull();
    });
  });

  describe('Data Initialization', () => {
    it('should initialize with default data when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = localStorageService.getData();

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('profiles');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('meal_plans');
    });

    it('should preserve existing data structure', () => {
      const existingData = {
        users: [{ id: 'user-1', email: 'test@test.com' }],
        profiles: [{ id: 'user-1', first_name: 'Test' }],
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      const result = localStorageService.getData();

      expect(result.users).toEqual(existingData.users);
      expect(result.profiles).toEqual(existingData.profiles);
    });
  });
});
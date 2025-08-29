import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { container } from '@/core';

vi.mock('@/core', () => ({
  container: {
    isBound: vi.fn(),
    resolve: vi.fn(),
  },
}));

// Get the mocked container instance
const mockContainer = vi.mocked(container);

// Mock services
const mockAuthService = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentSession: vi.fn(),
  onAuthStateChange: vi.fn(),
};

const mockProfileService = {
  getProfile: vi.fn(),
  getTrainerProfile: vi.fn(),
  getStudentProfile: vi.fn(),
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Setup default container behavior - services are bound by default
    mockContainer.isBound.mockReturnValue(true);
    
    mockContainer.resolve.mockImplementation((service) => {
      if (service === 'AuthService') return mockAuthService;
      if (service === 'ProfileService') return mockProfileService;
      return null;
    });

    // Setup default service behaviors
    mockAuthService.getCurrentSession.mockResolvedValue({ user: null });
    mockAuthService.onAuthStateChange.mockReturnValue({ unsubscribe: vi.fn() });
    mockProfileService.getProfile.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.profile).toBe(null);
    });

    it('should wait for services to be registered', async () => {
      mockContainer.isBound.mockReturnValue(false);

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);

      // Simulate services becoming available
      act(() => {
        mockContainer.isBound.mockReturnValue(true);
        vi.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthService.getCurrentSession.mockRejectedValue(new Error('Initialization failed'));

      const { result } = renderHook(() => useAuth());

      act(() => {
        vi.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing auth:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('User Session Management', () => {
    it('should load user and profile when session exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student' as const,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toEqual(mockProfile);
      }, { timeout: 12000 });
    }, 10000);

    it('should set loading to false when no session exists', async () => {
      mockAuthService.getCurrentSession.mockResolvedValue({ user: null });

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBe(null);
        expect(result.current.profile).toBe(null);
      }, { timeout: 12000 });
    });

    it('should handle auth state changes', async () => {
      let authCallback: ((user: any) => void) | undefined;

      mockAuthService.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { unsubscribe: vi.fn() };
      });

      const { result } = renderHook(() => useAuth());

      // Wait for initial load
      act(() => { vi.runAllTimers(); });

      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student' as const,
      };

      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      // Simulate user signing in
      await act(async () => {
        authCallback?.(mockUser);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toEqual(mockProfile);
      }, { timeout: 12000 });

      // Simulate user signing out
      await act(async () => {
        authCallback?.(null);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.profile).toBe(null);
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });
    });
  });

  describe('Profile Loading', () => {
    it('should load trainer profile for trainer users', async () => {
      const mockUser = {
        id: 'trainer-123',
        email: 'trainer@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'trainer-123',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'trainer' as const,
      };

      const mockTrainerProfile = {
        id: 'trainer-123',
        plan: 'pro' as const,
        max_students: 50,
        ai_credits: 100,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockProfileService.getTrainerProfile.mockResolvedValue(mockTrainerProfile);

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.trainerProfile).toEqual(mockTrainerProfile);
        expect(result.current.studentProfile).toBe(null);
      }, { timeout: 12000 });
    });

    it('should load student profile for student users', async () => {
      const mockUser = {
        id: 'student-123',
        email: 'student@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'student-123',
        first_name: 'Bob',
        last_name: 'Johnson',
        role: 'student' as const,
      };

      const mockStudentProfile = {
        id: 'student-123',
        goals: ['weight_loss'],
        fitness_level: 'beginner' as const,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockProfileService.getStudentProfile.mockResolvedValue(mockStudentProfile);

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.studentProfile).toEqual(mockStudentProfile);
        expect(result.current.trainerProfile).toBe(null);
      }, { timeout: 12000 });
    });

    it('should load admin profile without additional profile data', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'admin-123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin' as const,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.trainerProfile).toBe(null);
        expect(result.current.studentProfile).toBe(null);
      }, { timeout: 12000 });
    });

    it('should handle profile loading errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockRejectedValue(new Error('Profile loading failed'));

      const { result } = renderHook(() => useAuth());

      act(() => { vi.runAllTimers(); });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toBe(null);
      }, { timeout: 12000 });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading user profile:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing trainer profile gracefully', async () => {
      const mockUser = {
        id: 'trainer-123',
        email: 'trainer@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'trainer-123',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'trainer' as const,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockProfileService.getTrainerProfile.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.trainerProfile).toBe(null);
      }, { timeout: 10000 });
    });

    it('should handle missing student profile gracefully', async () => {
      const mockUser = {
        id: 'student-123',
        email: 'student@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockProfile = {
        id: 'student-123',
        first_name: 'Bob',
        last_name: 'Johnson',
        role: 'student' as const,
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser });
      mockProfileService.getProfile.mockResolvedValue(mockProfile);
      mockProfileService.getStudentProfile.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.studentProfile).toBe(null);
      }, { timeout: 10000 });
    });
  });

  describe('Authentication Actions', () => {
    it('should call authService.signIn when signIn is called', async () => {
      mockAuthService.signIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });

      await act(async () => {
        await result.current.signIn('user@test.com', 'password123');
      });

      expect(mockAuthService.signIn).toHaveBeenCalledWith('user@test.com', 'password123');
    });

    it('should call authService.signUp when signUp is called', async () => {
      mockAuthService.signUp.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });

      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
      };

      await act(async () => {
        await result.current.signUp('user@test.com', 'password123', userData);
      });

      expect(mockAuthService.signUp).toHaveBeenCalledWith('user@test.com', 'password123', userData);
    });

    it('should call authService.signOut when signOut is called', async () => {
      mockAuthService.signOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuthService.signOut).toHaveBeenCalled();
    });

    it('should propagate authentication errors', async () => {
      const authError = new Error('Authentication failed');
      mockAuthService.signIn.mockRejectedValue(authError);

      const { result } = renderHook(() => useAuth());

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 12000 });

      await expect(async () => {
        await act(async () => {
          await result.current.signIn('user@test.com', 'wrongpassword');
        });
      }).rejects.toThrow('Authentication failed');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      const mockUnsubscribe = vi.fn();
      mockAuthService.onAuthStateChange.mockReturnValue({ unsubscribe: mockUnsubscribe });

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should prevent state updates after unmount', async () => {
      let authCallback: ((user: any) => void) | undefined;

      mockAuthService.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { unsubscribe: vi.fn() };
      });

      const { result, unmount } = renderHook(() => useAuth());

      unmount();

      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      // This should not cause any state updates since component is unmounted
      await act(async () => {
        authCallback?.(mockUser);
      });

      // The user should still be null since component was unmounted
      expect(result.current.user).toBe(null);
    });
  });

  describe('Service Resolution Edge Cases', () => {
    it('should handle container resolution failures', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}, 15000);
      mockContainer.resolve.mockImplementation(() => {
        throw new Error('Service resolution failed');
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing auth:', expect.any(Error));
      }, { timeout: 10000 });

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing profile data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockAuthService.getCurrentSession.mockResolvedValue({ user: mockUser }, 15000);
      mockProfileService.getProfile.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.profile).toBe(null);
      }, { timeout: 10000 });
    });
  });
});
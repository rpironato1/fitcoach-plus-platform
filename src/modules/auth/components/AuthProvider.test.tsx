/**
 * Comprehensive test suite for AuthProvider
 * Testing critical authentication context - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';

vi.mock('../hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: {
        id: 'user-123',
        email: 'user@test.com',
        created_at: '2024-01-01T00:00:00Z',
      },
      profile: {
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student' as const,
      },
      trainerProfile: null,
      studentProfile: {
        id: 'user-123',
        goals: ['weight_loss'],
        fitness_level: 'beginner' as const,
      },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    }),
  };
});

// Test component that uses the auth context
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user-email">{auth.user?.email || 'No user'}</div>
      <div data-testid="user-name">{auth.profile?.first_name || 'No name'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Loaded'}</div>
      <button onClick={() => auth.signIn('test@test.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Functionality', () => {
    it('should provide auth context to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('user@test.com');
      expect(screen.getByTestId('user-name')).toHaveTextContent('John');
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    it('should provide all auth methods to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const signInButton = screen.getByText('Sign In');
      const signOutButton = screen.getByText('Sign Out');

      expect(signInButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
    });

    it('should update when auth state changes', () => {
      const updatedAuthData = {
        ...mockAuthData,
        user: null,
        profile: null,
        loading: true,
      };

      vi.mocked(mockAuthData).user = null;
      vi.mocked(mockAuthData).profile = null;
      vi.mocked(mockAuthData).loading = true;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No name');
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Disable console.error for this test to avoid noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should return auth context when used within AuthProvider', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not throw and should render properly
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
  });

  describe('Context Value Propagation', () => {
    it('should provide user data correctly', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('user@test.com');
    });

    it('should provide profile data correctly', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('John');
    });

    it('should provide loading state correctly', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    });

    it('should provide auth methods correctly', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const signInButton = screen.getByText('Sign In');
      const signOutButton = screen.getByText('Sign Out');

      expect(signInButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();

      // Methods should be functions
      expect(typeof mockAuthData.signIn).toBe('function');
      expect(typeof mockAuthData.signOut).toBe('function');
      expect(typeof mockAuthData.signUp).toBe('function');
    });
  });

  describe('Different User Roles', () => {
    it('should handle trainer user correctly', () => {
      const trainerAuthData = {
        ...mockAuthData,
        profile: {
          id: 'trainer-123',
          first_name: 'Jane',
          last_name: 'Trainer',
          role: 'trainer' as const,
        },
        trainerProfile: {
          id: 'trainer-123',
          plan: 'pro' as const,
          max_students: 50,
          ai_credits: 100,
        },
        studentProfile: null,
      };

      vi.mocked(mockAuthData).profile = trainerAuthData.profile;
      vi.mocked(mockAuthData).trainerProfile = trainerAuthData.trainerProfile;
      vi.mocked(mockAuthData).studentProfile = null;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane');
    });

    it('should handle admin user correctly', () => {
      const adminAuthData = {
        ...mockAuthData,
        profile: {
          id: 'admin-123',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin' as const,
        },
        trainerProfile: null,
        studentProfile: null,
      };

      vi.mocked(mockAuthData).profile = adminAuthData.profile;
      vi.mocked(mockAuthData).trainerProfile = null;
      vi.mocked(mockAuthData).studentProfile = null;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin');
    });

    it('should handle unauthenticated state correctly', () => {
      vi.mocked(mockAuthData).user = null;
      vi.mocked(mockAuthData).profile = null;
      vi.mocked(mockAuthData).trainerProfile = null;
      vi.mocked(mockAuthData).studentProfile = null;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No name');
    });
  });

  describe('Error Boundaries', () => {
    it('should handle missing context gracefully in useAuth', () => {
      const TestComponentWithoutProvider = () => {
        try {
          const auth = useAuth();
          return <div>Auth context available</div>;
        } catch (error) {
          return <div>Error: {(error as Error).message}</div>;
        }
      };

      // This will still throw, but we'll catch it in our test component
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<TestComponentWithoutProvider />);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should not re-render unnecessarily', () => {
      let renderCount = 0;

      const CountingComponent = () => {
        renderCount++;
        const auth = useAuth();
        return <div>{auth.user?.email || 'No user'}</div>;
      };

      const { rerender } = render(
        <AuthProvider>
          <CountingComponent />
        </AuthProvider>
      );

      const initialRenderCount = renderCount;

      // Re-render with same props
      rerender(
        <AuthProvider>
          <CountingComponent />
        </AuthProvider>
      );

      // Should only re-render once more
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });

  describe('Nested Providers', () => {
    it('should work with nested providers (though not recommended)', () => {
      const OuterComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="outer-user">{auth.user?.email || 'No user'}</div>
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          </div>
        );
      };

      render(
        <AuthProvider>
          <OuterComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('outer-user')).toHaveTextContent('user@test.com');
      expect(screen.getByTestId('user-email')).toHaveTextContent('user@test.com');
    });
  });

  describe('Context Type Safety', () => {
    it('should provide properly typed context value', () => {
      const TypedTestComponent = () => {
        const auth = useAuth();
        
        // These should be properly typed
        const userEmail: string | undefined = auth.user?.email;
        const firstName: string | undefined = auth.profile?.first_name;
        const isLoading: boolean = auth.loading;
        
        return (
          <div>
            <div data-testid="typed-email">{userEmail || 'No email'}</div>
            <div data-testid="typed-name">{firstName || 'No name'}</div>
            <div data-testid="typed-loading">{isLoading ? 'Loading' : 'Not loading'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TypedTestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('typed-email')).toHaveTextContent('user@test.com');
      expect(screen.getByTestId('typed-name')).toHaveTextContent('John');
      expect(screen.getByTestId('typed-loading')).toHaveTextContent('Not loading');
    });
  });
});
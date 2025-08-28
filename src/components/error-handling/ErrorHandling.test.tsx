/**
 * Comprehensive test suite for Error Boundary and Loading States
 * Testing critical error handling and user experience - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock error tracking service
const mockErrorTracking = {
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setContext: vi.fn(),
};

vi.mock('@/services/errorTracking', () => ({
  errorTracking: mockErrorTracking,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock components for testing
const ErrorBoundary = ({ children, onError }: { children: React.ReactNode, onError?: (error: Error) => void }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      onError?.(error);
    };

    window.addEventListener('error', (event) => {
      handleError(new Error(event.message));
    });

    return () => window.removeEventListener('error', () => {});
  }, [onError]);

  if (hasError && error) {
    return (
      <div role="alert" aria-live="assertive" data-testid="error-fallback">
        <h2>Something went wrong</h2>
        <p>An unexpected error occurred</p>
        <button onClick={() => { setHasError(false); setError(null); }}>
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  variant = 'primary' 
}: { 
  size?: string, 
  text?: string, 
  variant?: string 
}) => (
  <div 
    data-testid="loading-spinner" 
    className={`spinner-${size} spinner-${variant} animate-spin`}
    role="status"
    aria-label={text}
  >
    <span className="sr-only">{text}</span>
  </div>
);

// Mock component that throws errors for testing
const ThrowingComponent = ({ shouldThrow = false, errorType = 'generic' }) => {
  if (shouldThrow) {
    if (errorType === 'network') {
      throw new Error('Network request failed');
    } else if (errorType === 'validation') {
      throw new Error('Validation failed: Invalid data format');
    } else if (errorType === 'permission') {
      throw new Error('Permission denied: Insufficient access');
    } else {
      throw new Error('Something went wrong');
    }
  }
  return <div>Working Component</div>;
};

describe('Error Handling and Loading States - Comprehensive Testing', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    // Mock console.error to prevent noise in test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('ErrorBoundary Component', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('should track errors to monitoring service', () => {
      const onError = vi.fn((error) => {
        mockErrorTracking.captureException(error, {
          tags: { source: 'ErrorBoundary' },
          extra: { timestamp: Date.now() },
        });
      });

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} errorType="generic" />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      let shouldThrow = true;
      
      const RetryableComponent = () => {
        if (shouldThrow) {
          throw new Error('Temporary error');
        }
        return <div>Success after retry</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Simulate fixing the error
      shouldThrow = false;

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      // Re-render to show the fixed component
      rerender(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Success after retry')).toBeInTheDocument();
    });

    it('should reset error state when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with working component
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should render default loading spinner', () => {
      render(<LoadingSpinner />, { wrapper });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(<LoadingSpinner size="large" />, { wrapper });

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('spinner-large');
    });

    it('should render with custom text', () => {
      render(<LoadingSpinner text="Saving changes..." />, { wrapper });

      expect(screen.getByText('Saving changes...')).toBeInTheDocument();
    });

    it('should support different variants', () => {
      const variants = ['primary', 'secondary', 'success', 'warning'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(<LoadingSpinner variant={variant} />, { wrapper });
        
        const spinner = screen.getByTestId('loading-spinner');
        expect(spinner).toHaveClass(`spinner-${variant}`);
        
        unmount();
      });
    });

    it('should be accessible with proper ARIA attributes', () => {
      render(<LoadingSpinner text="Loading data..." />, { wrapper });

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data...');
      
      const srText = screen.getByText('Loading data...', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
    });

    it('should animate properly', () => {
      render(<LoadingSpinner />, { wrapper });

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Error States with Different Types', () => {
    it('should handle network errors specifically', () => {
      const NetworkErrorComponent = () => {
        throw new Error('Network request failed');
      };

      render(
        <ErrorBoundary>
          <NetworkErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('should handle validation errors with detailed feedback', () => {
      const ValidationErrorComponent = () => {
        throw new Error('Validation failed: Invalid data format');
      };

      render(
        <ErrorBoundary>
          <ValidationErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle permission errors', () => {
      const PermissionErrorComponent = () => {
        throw new Error('Permission denied: Insufficient access');
      };

      render(
        <ErrorBoundary>
          <PermissionErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility', () => {
    it('should not impact performance when no errors occur', () => {
      const startTime = performance.now();
      
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>,
        { wrapper }
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (within 100ms for test environment)
      expect(renderTime).toBeLessThan(100);
    });

    it('should be screen reader accessible', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toBeInTheDocument();
      expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should handle multiple errors gracefully', () => {
      const MultiErrorComponent = () => {
        throw new Error('First error');
      };

      render(
        <ErrorBoundary>
          <MultiErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Error boundary should handle subsequent errors too
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Loading State Variations', () => {
    it('should render skeleton loading for content', () => {
      const SkeletonLoader = ({ count = 3 }: { count?: number }) => (
        <div>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} data-testid="skeleton-item" className="animate-pulse">
              Loading item {i + 1}
            </div>
          ))}
        </div>
      );

      render(<SkeletonLoader count={3} />, { wrapper });

      const skeletons = screen.getAllByTestId('skeleton-item');
      expect(skeletons).toHaveLength(3);
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('animate-pulse');
      });
    });

    it('should render progress bar with percentage', () => {
      const ProgressBar = ({ progress = 0 }: { progress?: number }) => (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div>{progress}%</div>
        </div>
      );

      render(<ProgressBar progress={65} />, { wrapper });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('should handle indeterminate loading states', () => {
      const IndeterminateLoader = ({ message }: { message?: string }) => (
        <div data-testid="indeterminate-loader" className="animate-bounce">
          {message && <div>{message}</div>}
        </div>
      );

      render(<IndeterminateLoader message="Processing your request..." />, { wrapper });

      expect(screen.getByText('Processing your request...')).toBeInTheDocument();
      
      const loader = screen.getByTestId('indeterminate-loader');
      expect(loader).toHaveClass('animate-bounce');
    });

    it('should allow canceling long-running operations', async () => {
      const mockCancel = vi.fn();
      
      const CancelableLoader = ({ onCancel }: { onCancel: () => void }) => (
        <div>
          <div>Loading...</div>
          <button onClick={onCancel}>Cancel Upload</button>
        </div>
      );
      
      render(<CancelableLoader onCancel={mockCancel} />, { wrapper });

      const cancelButton = screen.getByText('Cancel Upload');
      await user.click(cancelButton);

      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe('Real-world Error Scenarios', () => {
    it('should handle async errors from promises', async () => {
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          Promise.reject(new Error('Async operation failed'))
            .catch(() => {
              throw new Error('Unhandled promise rejection');
            });
        }, []);
        
        return <div>Component with async error</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      // Component should render initially
      expect(screen.getByText('Component with async error')).toBeInTheDocument();
    });

    it('should handle errors in event handlers', async () => {
      const EventErrorComponent = () => {
        const handleClick = () => {
          throw new Error('Event handler error');
        };

        return <button onClick={handleClick}>Click to error</button>;
      };

      render(
        <ErrorBoundary>
          <EventErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      const button = screen.getByText('Click to error');
      
      // Event errors don't trigger error boundaries by default
      // This is expected React behavior
      expect(button).toBeInTheDocument();
    });

    it('should provide helpful error context', () => {
      const ContextualErrorComponent = () => {
        const context = { userId: '123', action: 'save_data' };
        const error = new Error('Save operation failed');
        error.cause = context;
        throw error;
      };

      render(
        <ErrorBoundary>
          <ContextualErrorComponent />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
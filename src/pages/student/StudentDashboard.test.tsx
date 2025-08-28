import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StudentDashboard from './StudentDashboard';

// Mock the auth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'student@test.com',
      name: 'Test Student',
      role: 'student'
    },
    logout: vi.fn()
  })
}));

// Mock localStorage operations
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = mockLocalStorage as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  it('should render main heading', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <StudentDashboard />
      </Wrapper>
    );

    expect(screen.getByText(/Olá/)).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <StudentDashboard />
      </Wrapper>
    );

    expect(screen.getByText(/Acompanhe seu progresso/)).toBeInTheDocument();
  });

  it('should show dashboard content', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <StudentDashboard />
      </Wrapper>
    );

    expect(screen.getByText(/Informações Pessoais/)).toBeInTheDocument();
  });

  it('should handle localStorage operations', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <StudentDashboard />
      </Wrapper>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalled();
  });
});
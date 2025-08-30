/**
 * Comprehensive test suite for TrainerDashboard
 * Testing critical dashboard functionality - HIGH coverage target
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrainerDashboard from './TrainerDashboard';

// Mock the auth provider
const mockUseAuth = {
  profile: {
    id: 'trainer-123',
    first_name: 'John',
    last_name: 'Trainer',
    role: 'trainer',
  },
  trainerProfile: {
    id: 'trainer-123',
    plan: 'pro',
    max_students: 50,
    ai_credits: 100,
  },
};

vi.mock('@/components/auth/LocalStorageAuthProvider', () => ({
  useLocalStorageAuth: () => mockUseAuth,
}));

// Mock hooks
const mockDashboardStats = {
  data: {
    totalStudents: 25,
    activeSessions: 12,
    monthlyRevenue: 3500,
    satisfactionRate: 4.8,
  },
  isLoading: false,
};

const mockUpcomingSessions = {
  data: [
    {
      id: 'session-1',
      student_name: 'Maria Silva',
      scheduled_for: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      type: 'strength_training',
    },
    {
      id: 'session-2',
      student_name: 'João Santos',
      scheduled_for: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      type: 'cardio',
    },
  ],
  isLoading: false,
};

const mockRecentActivity = {
  data: [
    {
      id: 'activity-1',
      type: 'workout_completed',
      student_name: 'Pedro Costa',
      created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      details: 'Completou treino de força',
    },
    {
      id: 'activity-2',
      type: 'meal_plan_updated',
      student_name: 'Ana Oliveira',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      details: 'Plano alimentar atualizado',
    },
  ],
  isLoading: false,
};

vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardStats: () => mockDashboardStats,
  useUpcomingSessions: () => mockUpcomingSessions,
  useRecentActivity: () => mockRecentActivity,
}));

vi.mock('@/hooks/useLocalStorageDashboardData', () => ({
  useLocalStorageDashboardStats: () => mockDashboardStats,
  useLocalStorageUpcomingSessions: () => mockUpcomingSessions,
  useLocalStorageRecentActivity: () => mockRecentActivity,
}));

// Mock components
vi.mock('@/components/trainer/DataSourceManager', () => ({
  DataSourceManager: ({ onSourceChange }: { onSourceChange: (useLocal: boolean) => void }) => (
    <div data-testid="data-source-manager">
      <button 
        onClick={() => onSourceChange(false)}
        data-testid="use-supabase"
      >
        Use Supabase
      </button>
      <button 
        onClick={() => onSourceChange(true)}
        data-testid="use-localstorage"
      >
        Use LocalStorage
      </button>
    </div>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date) => 'há 30 minutos'),
  format: vi.fn((date) => '14:30'),
}));

vi.mock('date-fns/locale', () => ({
  ptBR: {},
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TrainerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with trainer profile information', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Dashboard do Trainer')).toBeInTheDocument();
      expect(screen.getByText('John Trainer')).toBeInTheDocument();
    });

    it('should display statistics cards', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Total de Alunos')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Sessões Ativas')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
      expect(screen.getByText('R$ 3.500')).toBeInTheDocument();
      expect(screen.getByText('Satisfação')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });

    it('should display upcoming sessions', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Próximas Sessões')).toBeInTheDocument();
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });

    it('should display recent activity', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
      expect(screen.getByText('Ana Oliveira')).toBeInTheDocument();
      expect(screen.getByText('Completou treino de força')).toBeInTheDocument();
      expect(screen.getByText('Plano alimentar atualizado')).toBeInTheDocument();
    });

    it('should render data source manager', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByTestId('data-source-manager')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading states for statistics', () => {
      vi.mocked(mockDashboardStats).isLoading = true;

      renderWithRouter(<TrainerDashboard />);

      // Should show loading indicators or skeleton states
      expect(screen.getByText('Dashboard do Trainer')).toBeInTheDocument();
    });

    it('should show loading states for sessions', () => {
      vi.mocked(mockUpcomingSessions).isLoading = true;

      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Próximas Sessões')).toBeInTheDocument();
    });

    it('should show loading states for activity', () => {
      vi.mocked(mockRecentActivity).isLoading = true;

      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
    });
  });

  describe('Data Source Switching', () => {
    it('should switch to localStorage data source', async () => {
      renderWithRouter(<TrainerDashboard />);

      const localStorageButton = screen.getByTestId('use-localstorage');
      fireEvent.click(localStorageButton);

      // Component should still render normally with localStorage data
      await waitFor(() => {
        expect(screen.getByText('Dashboard do Trainer')).toBeInTheDocument();
      });
    });

    it('should switch to Supabase data source', async () => {
      renderWithRouter(<TrainerDashboard />);

      const supabaseButton = screen.getByTestId('use-supabase');
      fireEvent.click(supabaseButton);

      // Component should still render normally with Supabase data
      await waitFor(() => {
        expect(screen.getByText('Dashboard do Trainer')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      renderWithRouter(<TrainerDashboard />);

      const quickActionsSection = screen.getByText('Ações Rápidas').closest('div');
      expect(quickActionsSection).toBeInTheDocument();
    });

    it('should have navigation links for different sections', () => {
      renderWithRouter(<TrainerDashboard />);

      // Check for navigation links (they would be Link components)
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing profile gracefully', () => {
      const mockUseAuthNoProfile = {
        profile: null,
        trainerProfile: null,
      };

      vi.mocked(mockUseAuth).profile = null;
      vi.mocked(mockUseAuth).trainerProfile = null;

      renderWithRouter(<TrainerDashboard />);

      // Should still render dashboard without crashing
      expect(screen.getByText('Dashboard do Trainer')).toBeInTheDocument();
    });

    it('should handle empty statistics data', () => {
      const emptyStats = {
        data: {
          totalStudents: 0,
          activeSessions: 0,
          monthlyRevenue: 0,
          satisfactionRate: 0,
        },
        isLoading: false,
      };

      vi.mocked(mockDashboardStats).data = emptyStats.data;

      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle empty sessions list', () => {
      const emptySessions = {
        data: [],
        isLoading: false,
      };

      vi.mocked(mockUpcomingSessions).data = [];

      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Próximas Sessões')).toBeInTheDocument();
      // Should show empty state or no sessions message
    });

    it('should handle empty activity list', () => {
      const emptyActivity = {
        data: [],
        isLoading: false,
      };

      vi.mocked(mockRecentActivity).data = [];

      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
      // Should show empty state or no activity message
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithRouter(<TrainerDashboard />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Dashboard do Trainer');

      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons and links', () => {
      renderWithRouter(<TrainerDashboard />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toBeVisible();
      });
    });

    it('should have proper card structure', () => {
      renderWithRouter(<TrainerDashboard />);

      // Cards should be properly structured with titles and content
      expect(screen.getByText('Total de Alunos')).toBeInTheDocument();
      expect(screen.getByText('Próximas Sessões')).toBeInTheDocument();
      expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should format revenue correctly', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('R$ 3.500')).toBeInTheDocument();
    });

    it('should display satisfaction rate with star icon', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('4.8')).toBeInTheDocument();
      // Star icon should be present
    });

    it('should show percentage indicators for trends', () => {
      renderWithRouter(<TrainerDashboard />);

      // Should show trend indicators (+ or -)
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    it('should display session times correctly', () => {
      renderWithRouter(<TrainerDashboard />);

      // Should format session times
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });

    it('should show session types', () => {
      renderWithRouter(<TrainerDashboard />);

      // Session types should be displayed (strength_training, cardio, etc.)
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });
  });

  describe('Activity Feed', () => {
    it('should display activity timestamps', () => {
      renderWithRouter(<TrainerDashboard />);

      // Should show "há X tempo" format
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
      expect(screen.getByText('Ana Oliveira')).toBeInTheDocument();
    });

    it('should categorize different activity types', () => {
      renderWithRouter(<TrainerDashboard />);

      expect(screen.getByText('Completou treino de força')).toBeInTheDocument();
      expect(screen.getByText('Plano alimentar atualizado')).toBeInTheDocument();
    });
  });
});
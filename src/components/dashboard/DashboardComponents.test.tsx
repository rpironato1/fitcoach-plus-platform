/**
 * Comprehensive test suite for Dashboard Components - Advanced Testing
 * Testing complex dashboard interactions - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardMetrics } from './DashboardMetrics';
import { ActivityFeed } from './ActivityFeed';
import { ProgressTracker } from './ProgressTracker';
import React from 'react';

// Mock React Query hooks
const mockUseDashboardData = vi.fn();
const mockUseProgress = vi.fn();
const mockUseActivities = vi.fn();

const mockToast = vi.fn();
const mockUseToast = vi.fn(() => ({ toast: mockToast }));

vi.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: mockUseDashboardData,
}));

vi.mock('../../hooks/useProgress', () => ({
  useProgress: mockUseProgress,
}));

vi.mock('../../hooks/useActivities', () => ({
  useActivities: mockUseActivities,
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: mockUseToast,
}));

describe('Dashboard Components - Comprehensive Testing', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('DashboardMetrics Component', () => {
    const mockMetricsData = {
      workouts: {
        total: 156,
        thisWeek: 5,
        thisMonth: 22,
        streak: 12,
      },
      sessions: {
        total: 48,
        upcoming: 3,
        completed: 45,
        cancelled: 2,
      },
      progress: {
        weightLoss: 8.5,
        muscleGain: 2.3,
        endurance: 85,
        strength: 78,
      },
      achievements: [
        {
          id: '1',
          title: '100 Workouts',
          description: 'Completed 100 workout sessions',
          earnedAt: '2024-01-10',
          icon: 'trophy',
        },
      ],
    };

    beforeEach(() => {
      mockUseDashboardData.mockReturnValue({
        metrics: mockMetricsData,
        isLoading: false,
        error: null,
      });
    });

    it('should display all fitness metrics correctly', () => {
      render(<DashboardMetrics />, { wrapper });

      expect(screen.getByText('156')).toBeInTheDocument(); // Total workouts
      expect(screen.getByText('5')).toBeInTheDocument(); // This week
      expect(screen.getByText('22')).toBeInTheDocument(); // This month
      expect(screen.getByText('12')).toBeInTheDocument(); // Streak
      expect(screen.getByText('48')).toBeInTheDocument(); // Total sessions
      expect(screen.getByText('3')).toBeInTheDocument(); // Upcoming sessions
    });

    it('should show progress percentages with visual indicators', () => {
      render(<DashboardMetrics />, { wrapper });

      const enduranceProgress = screen.getByTestId('endurance-progress');
      expect(enduranceProgress).toHaveAttribute('aria-valuenow', '85');
      
      const strengthProgress = screen.getByTestId('strength-progress');
      expect(strengthProgress).toHaveAttribute('aria-valuenow', '78');
    });

    it('should handle loading state', () => {
      mockUseDashboardData.mockReturnValue({
        metrics: null,
        isLoading: true,
        error: null,
      });

      render(<DashboardMetrics />, { wrapper });

      expect(screen.getByTestId('metrics-loading')).toBeInTheDocument();
      expect(screen.getAllByTestId('skeleton')).toHaveLength(8); // 8 metric cards
    });

    it('should handle error state with retry option', async () => {
      const mockRetry = vi.fn();
      mockUseDashboardData.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: new Error('Failed to load metrics'),
        retry: mockRetry,
      });

      render(<DashboardMetrics />, { wrapper });

      expect(screen.getByText('Error loading metrics')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalled();
    });

    it('should display achievements with correct styling', () => {
      render(<DashboardMetrics />, { wrapper });

      expect(screen.getByText('100 Workouts')).toBeInTheDocument();
      expect(screen.getByText('Completed 100 workout sessions')).toBeInTheDocument();
      
      const achievementBadge = screen.getByTestId('achievement-badge-1');
      expect(achievementBadge).toHaveClass('achievement-earned');
    });

    it('should be keyboard accessible', async () => {
      render(<DashboardMetrics />, { wrapper });

      const firstMetric = screen.getByTestId('workout-metric');
      await user.tab();
      expect(firstMetric).toHaveFocus();

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Workout Details')).toBeInTheDocument();
      });
    });

    it('should animate metric counters on load', async () => {
      render(<DashboardMetrics />, { wrapper });

      const workoutCounter = screen.getByTestId('workout-counter');
      expect(workoutCounter).toHaveClass('animate-count-up');
      
      await waitFor(() => {
        expect(workoutCounter).toHaveTextContent('156');
      }, { timeout: 2000 });
    });
  });

  describe('ActivityFeed Component', () => {
    const mockActivities = [
      {
        id: '1',
        type: 'workout',
        title: 'Morning Cardio',
        description: 'Completed 30-minute cardio session',
        timestamp: '2024-01-15T08:00:00Z',
        duration: 30,
        caloriesBurned: 250,
        user: { name: 'John Doe', avatar: '/avatar1.jpg' },
      },
      {
        id: '2',
        type: 'session',
        title: 'Personal Training',
        description: 'Strength training with Sarah',
        timestamp: '2024-01-14T16:00:00Z',
        duration: 60,
        trainer: { name: 'Sarah Smith', avatar: '/trainer1.jpg' },
      },
      {
        id: '3',
        type: 'achievement',
        title: 'New Personal Record',
        description: 'Bench press: 145 lbs',
        timestamp: '2024-01-13T14:30:00Z',
        category: 'strength',
      },
    ];

    beforeEach(() => {
      mockUseActivities.mockReturnValue({
        activities: mockActivities,
        isLoading: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
      });
    });

    it('should display activity feed with correct data', () => {
      render(<ActivityFeed />, { wrapper });

      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
      expect(screen.getByText('Morning Cardio')).toBeInTheDocument();
      expect(screen.getByText('Personal Training')).toBeInTheDocument();
      expect(screen.getByText('New Personal Record')).toBeInTheDocument();
    });

    it('should show activity timestamps in relative format', () => {
      render(<ActivityFeed />, { wrapper });

      expect(screen.getByText('2 days ago')).toBeInTheDocument();
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
    });

    it('should display activity type icons correctly', () => {
      render(<ActivityFeed />, { wrapper });

      expect(screen.getByTestId('workout-icon')).toBeInTheDocument();
      expect(screen.getByTestId('session-icon')).toBeInTheDocument();
      expect(screen.getByTestId('achievement-icon')).toBeInTheDocument();
    });

    it('should support infinite scrolling', async () => {
      const mockLoadMore = vi.fn();
      mockUseActivities.mockReturnValue({
        activities: mockActivities,
        isLoading: false,
        error: null,
        hasMore: true,
        loadMore: mockLoadMore,
      });

      render(<ActivityFeed />, { wrapper });

      const feedContainer = screen.getByTestId('activity-feed');
      fireEvent.scroll(feedContainer, { target: { scrollTop: 1000 } });

      await waitFor(() => {
        expect(mockLoadMore).toHaveBeenCalled();
      });
    });

    it('should filter activities by type', async () => {
      render(<ActivityFeed />, { wrapper });

      const filterButton = screen.getByText('Workouts Only');
      await user.click(filterButton);

      expect(screen.getByText('Morning Cardio')).toBeInTheDocument();
      expect(screen.queryByText('Personal Training')).not.toBeInTheDocument();
      expect(screen.queryByText('New Personal Record')).not.toBeInTheDocument();
    });

    it('should handle empty state gracefully', () => {
      mockUseActivities.mockReturnValue({
        activities: [],
        isLoading: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
      });

      render(<ActivityFeed />, { wrapper });

      expect(screen.getByText('No activities yet')).toBeInTheDocument();
      expect(screen.getByText('Start your fitness journey today!')).toBeInTheDocument();
    });

    it('should allow liking and sharing activities', async () => {
      const mockLikeActivity = vi.fn();
      const mockShareActivity = vi.fn();

      render(<ActivityFeed onLike={mockLikeActivity} onShare={mockShareActivity} />, { wrapper });

      const likeButton = screen.getByTestId('like-activity-1');
      await user.click(likeButton);
      expect(mockLikeActivity).toHaveBeenCalledWith('1');

      const shareButton = screen.getByTestId('share-activity-1');
      await user.click(shareButton);
      expect(mockShareActivity).toHaveBeenCalledWith('1');
    });
  });

  describe('Component Integration', () => {
    it('should handle cross-component interactions', async () => {
      const mockRefreshAll = vi.fn();
      
      render(
        <div>
          <DashboardMetrics onRefresh={mockRefreshAll} />
          <ActivityFeed onRefresh={mockRefreshAll} />
          <ProgressTracker onRefresh={mockRefreshAll} />
        </div>,
        { wrapper }
      );

      const refreshButton = screen.getByTestId('global-refresh');
      await user.click(refreshButton);

      expect(mockRefreshAll).toHaveBeenCalledTimes(3);
    });

    it('should maintain consistent loading states across components', () => {
      mockUseDashboardData.mockReturnValue({
        metrics: null,
        isLoading: true,
        error: null,
      });

      mockUseActivities.mockReturnValue({
        activities: [],
        isLoading: true,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
      });

      render(
        <div>
          <DashboardMetrics />
          <ActivityFeed />
        </div>,
        { wrapper }
      );

      expect(screen.getAllByTestId(/loading/)).toHaveLength(2);
    });

    it('should handle responsive layout changes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <div className="dashboard-container">
          <DashboardMetrics />
          <ActivityFeed />
        </div>,
        { wrapper }
      );

      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('tablet-layout');
    });
  });
});
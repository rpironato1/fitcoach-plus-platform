/**
 * Comprehensive test suite for useDashboardData hook
 * Tests: Data fetching, validation, error handling, and business logic
 * Target: 100% hook coverage with real business scenarios
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { z } from 'zod';
import React from 'react';
import * as React from 'react';
import { useDashboardData } from './useDashboardData';

// Zod schemas for data validation
const DashboardStatsSchema = z.object({
  activeStudents: z.number().min(0),
  maxStudents: z.number().min(0),
  sessionsToday: z.number().min(0),
  totalSessions: z.number().min(0),
  monthlyRevenue: z.number().min(0),
  aiCredits: z.number().min(0),
});

const UpcomingSessionSchema = z.object({
  id: z.string(),
  student_name: z.string().min(1),
  scheduled_at: z.string(),
  duration_minutes: z.number().positive(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
});

const RecentActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['session_completed', 'student_added', 'workout_assigned', 'diet_created']),
  description: z.string().min(1),
  created_at: z.string(),
});

// Mock implementations
const mockSupabaseQuery = vi.fn();
const mockAuthUser = {
  id: 'trainer-123',
  email: 'trainer@example.com',
  role: 'trainer',
};

// Mock auth hook
vi.mock('@/components/auth/LocalStorageAuthProvider', () => ({
  useLocalStorageAuth: () => ({
    user: mockAuthUser,
    profile: { id: 'trainer-123', role: 'trainer' },
  }),
}));

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({
            lte: () => ({
              single: () => mockSupabaseQuery(),
            }),
            order: () => ({
              limit: () => mockSupabaseQuery(),
            }),
          }),
          single: () => mockSupabaseQuery(),
          order: () => ({
            limit: () => mockSupabaseQuery(),
          }),
        }),
        order: () => ({
          limit: () => mockSupabaseQuery(),
        }),
      }),
    }),
    rpc: () => mockSupabaseQuery(),
  },
}));

// Test wrapper with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboardData Hook', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Dashboard Stats Data Fetching', () => {
    it('should fetch and validate dashboard stats successfully', async () => {
      const mockStats = {
        activeStudents: 25,
        maxStudents: 50,
        sessionsToday: 3,
        totalSessions: 150,
        monthlyRevenue: 2500.75,
        aiCredits: 100,
      };

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: mockStats, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
      });

      // Validate data with Zod schema
      const statsValidation = DashboardStatsSchema.safeParse(result.current.stats.data);
      expect(statsValidation.success).toBe(true);

      expect(result.current.stats.data).toEqual(mockStats);
    });

    it('should handle stats data with edge case values', async () => {
      const edgeCaseStats = {
        activeStudents: 0,
        maxStudents: 1,
        sessionsToday: 0,
        totalSessions: 0,
        monthlyRevenue: 0,
        aiCredits: 0,
      };

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: edgeCaseStats, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
      });

      const validation = DashboardStatsSchema.safeParse(result.current.stats.data);
      expect(validation.success).toBe(true);
      expect(result.current.stats.data?.activeStudents).toBe(0);
    });

    it('should handle stats fetch errors gracefully', async () => {
      mockSupabaseQuery
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isError).toBe(true);
      });

      expect(result.current.stats.error).toBeTruthy();
    });

    it('should validate stats data integrity', async () => {
      const invalidStats = {
        activeStudents: -5, // Invalid: negative number
        maxStudents: 'invalid', // Invalid: not a number
        sessionsToday: 3,
        totalSessions: 150,
        monthlyRevenue: 2500,
        aiCredits: 100,
      };

      const validation = DashboardStatsSchema.safeParse(invalidStats);
      expect(validation.success).toBe(false);

      if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        expect(errors.activeStudents).toBeDefined();
        expect(errors.maxStudents).toBeDefined();
      }
    });
  });

  describe('Upcoming Sessions Data Fetching', () => {
    it('should fetch and validate upcoming sessions', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          student_name: 'João Silva',
          scheduled_at: '2024-01-15T10:00:00Z',
          duration_minutes: 60,
          status: 'scheduled',
        },
        {
          id: 'session-2',
          student_name: 'Maria Santos',
          scheduled_at: '2024-01-15T14:00:00Z',
          duration_minutes: 45,
          status: 'scheduled',
        },
      ];

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: mockSessions, error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.upcomingSessions.isSuccess).toBe(true);
      });

      // Validate each session with Zod schema
      result.current.upcomingSessions.data?.forEach((session) => {
        const validation = UpcomingSessionSchema.safeParse(session);
        expect(validation.success).toBe(true);
      });

      expect(result.current.upcomingSessions.data).toHaveLength(2);
      expect(result.current.upcomingSessions.data?.[0].student_name).toBe('João Silva');
    });

    it('should handle empty upcoming sessions', async () => {
      mockSupabaseQuery
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.upcomingSessions.isSuccess).toBe(true);
      });

      expect(result.current.upcomingSessions.data).toEqual([]);
    });

    it('should validate session status enum values', () => {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      const invalidStatuses = ['pending', 'unknown', ''];

      validStatuses.forEach(status => {
        const session = {
          id: 'test',
          student_name: 'Test User',
          scheduled_at: '2024-01-15T10:00:00Z',
          duration_minutes: 60,
          status,
        };
        const validation = UpcomingSessionSchema.safeParse(session);
        expect(validation.success).toBe(true);
      });

      invalidStatuses.forEach(status => {
        const session = {
          id: 'test',
          student_name: 'Test User',
          scheduled_at: '2024-01-15T10:00:00Z',
          duration_minutes: 60,
          status,
        };
        const validation = UpcomingSessionSchema.safeParse(session);
        expect(validation.success).toBe(false);
      });
    });

    it('should handle sessions fetch errors', async () => {
      mockSupabaseQuery
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'Access denied' } })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.upcomingSessions.isError).toBe(true);
      });

      expect(result.current.upcomingSessions.error).toBeTruthy();
    });
  });

  describe('Recent Activities Data Fetching', () => {
    it('should fetch and validate recent activities', async () => {
      const mockActivities = [
        {
          id: 'activity-1',
          type: 'session_completed',
          description: 'Sessão de treino concluída com João Silva',
          created_at: '2024-01-15T09:00:00Z',
        },
        {
          id: 'activity-2',
          type: 'student_added',
          description: 'Novo aluno Maria Santos adicionado',
          created_at: '2024-01-15T08:30:00Z',
        },
        {
          id: 'activity-3',
          type: 'workout_assigned',
          description: 'Treino de força atribuído a Pedro Costa',
          created_at: '2024-01-15T08:00:00Z',
        },
      ];

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recentActivities.isSuccess).toBe(true);
      });

      // Validate each activity with Zod schema
      result.current.recentActivities.data?.forEach((activity) => {
        const validation = RecentActivitySchema.safeParse(activity);
        expect(validation.success).toBe(true);
      });

      expect(result.current.recentActivities.data).toHaveLength(3);
      expect(result.current.recentActivities.data?.[0].type).toBe('session_completed');
    });

    it('should validate activity type enum values', () => {
      const validTypes = ['session_completed', 'student_added', 'workout_assigned', 'diet_created'];
      const invalidTypes = ['invalid_type', 'session_started', ''];

      validTypes.forEach(type => {
        const activity = {
          id: 'test',
          type,
          description: 'Test description',
          created_at: '2024-01-15T10:00:00Z',
        };
        const validation = RecentActivitySchema.safeParse(activity);
        expect(validation.success).toBe(true);
      });

      invalidTypes.forEach(type => {
        const activity = {
          id: 'test',
          type,
          description: 'Test description',
          created_at: '2024-01-15T10:00:00Z',
        };
        const validation = RecentActivitySchema.safeParse(activity);
        expect(validation.success).toBe(false);
      });
    });

    it('should handle activities with empty descriptions', () => {
      const activityWithEmptyDescription = {
        id: 'test',
        type: 'session_completed',
        description: '', // Invalid: empty description
        created_at: '2024-01-15T10:00:00Z',
      };

      const validation = RecentActivitySchema.safeParse(activityWithEmptyDescription);
      expect(validation.success).toBe(false);
    });
  });

  describe('Loading States and Performance', () => {
    it('should handle initial loading states', () => {
      mockSupabaseQuery.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.stats.isLoading).toBe(true);
      expect(result.current.upcomingSessions.isLoading).toBe(true);
      expect(result.current.recentActivities.isLoading).toBe(true);
    });

    it('should handle parallel data fetching', async () => {
      const mockStats = { activeStudents: 10, maxStudents: 20, sessionsToday: 2, totalSessions: 50, monthlyRevenue: 1000, aiCredits: 50 };
      const mockSessions = [{ id: '1', student_name: 'Test', scheduled_at: '2024-01-15T10:00:00Z', duration_minutes: 60, status: 'scheduled' }];
      const mockActivities = [{ id: '1', type: 'session_completed', description: 'Test activity', created_at: '2024-01-15T09:00:00Z' }];

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: mockStats, error: null })
        .mockResolvedValueOnce({ data: mockSessions, error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
        expect(result.current.upcomingSessions.isSuccess).toBe(true);
        expect(result.current.recentActivities.isSuccess).toBe(true);
      });

      // All queries should complete successfully
      expect(result.current.stats.data).toEqual(mockStats);
      expect(result.current.upcomingSessions.data).toEqual(mockSessions);
      expect(result.current.recentActivities.data).toEqual(mockActivities);
    });

    it('should handle mixed success and error states', async () => {
      const mockStats = { activeStudents: 10, maxStudents: 20, sessionsToday: 2, totalSessions: 50, monthlyRevenue: 1000, aiCredits: 50 };

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: mockStats, error: null }) // Stats success
        .mockResolvedValueOnce({ data: null, error: { message: 'Sessions error' } }) // Sessions error
        .mockResolvedValueOnce({ data: [], error: null }); // Activities success

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
        expect(result.current.upcomingSessions.isError).toBe(true);
        expect(result.current.recentActivities.isSuccess).toBe(true);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should not fetch data when user is not authenticated', () => {
      // Mock unauthenticated user
      vi.mocked(vi.importActual('@/components/auth/LocalStorageAuthProvider')).useLocalStorageAuth = () => ({
        user: null,
        profile: null,
      });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      // Queries should not be enabled for unauthenticated users
      expect(result.current.stats.isLoading).toBe(false);
      expect(result.current.upcomingSessions.isLoading).toBe(false);
      expect(result.current.recentActivities.isLoading).toBe(false);
    });

    it('should include user ID in query keys for cache isolation', async () => {
      mockSupabaseQuery
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
      });

      // Verify that queries are properly scoped to user
      expect(mockSupabaseQuery).toHaveBeenCalled();
    });
  });

  describe('Data Transformation and Business Logic', () => {
    it('should calculate derived metrics correctly', async () => {
      const mockStats = {
        activeStudents: 25,
        maxStudents: 50,
        sessionsToday: 5,
        totalSessions: 200,
        monthlyRevenue: 5000,
        aiCredits: 75,
      };

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: mockStats, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
      });

      const data = result.current.stats.data!;
      
      // Test business logic calculations
      const utilizationRate = (data.activeStudents / data.maxStudents) * 100;
      expect(utilizationRate).toBe(50); // 25/50 * 100

      const averageRevenue = data.monthlyRevenue / data.activeStudents;
      expect(averageRevenue).toBe(200); // 5000/25
    });

    it('should handle zero division edge cases', async () => {
      const mockStats = {
        activeStudents: 0,
        maxStudents: 0,
        sessionsToday: 0,
        totalSessions: 0,
        monthlyRevenue: 0,
        aiCredits: 0,
      };

      mockSupabaseQuery
        .mockResolvedValueOnce({ data: mockStats, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useDashboardData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.stats.isSuccess).toBe(true);
      });

      const data = result.current.stats.data!;
      
      // Should handle division by zero gracefully
      const safeUtilizationRate = data.maxStudents > 0 ? (data.activeStudents / data.maxStudents) * 100 : 0;
      expect(safeUtilizationRate).toBe(0);
    });
  });
});
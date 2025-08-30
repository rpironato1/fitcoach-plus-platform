import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlanLimits } from './usePlanLimits';
import React from 'react';

// Mock the container
const mockContainer = {
  get: vi.fn(),
};

vi.mock('../core/container/Container', () => ({
  container: mockContainer,
}));

const mockPlanLimitsService = {
  getPlanLimits: vi.fn(),
  checkLimits: vi.fn(),
  updateUsage: vi.fn(),
  upgradeSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  getUsageStats: vi.fn(),
};

describe('usePlanLimits', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockContainer.get.mockReturnValue(mockPlanLimitsService);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('getPlanLimits', () => {
    it('should fetch plan limits successfully', async () => {
      const mockLimits = {
        planType: 'premium',
        maxStudents: 50,
        maxWorkouts: 100,
        maxDietPlans: 25,
        maxSessionsPerMonth: 200,
        hasAIFeatures: true,
        hasAnalytics: true,
        hasCustomBranding: true,
        currentUsage: {
          students: 12,
          workouts: 35,
          dietPlans: 8,
          sessionsThisMonth: 45,
        },
        billingCycle: 'monthly',
        nextBillingDate: '2024-02-15',
        isActive: true,
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockLimits);
      });

      expect(mockPlanLimitsService.getPlanLimits).toHaveBeenCalledWith('trainer123');
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Failed to fetch plan limits');
      mockPlanLimitsService.getPlanLimits.mockRejectedValue(error);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('should show loading state initially', () => {
      mockPlanLimitsService.getPlanLimits.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('limit checks', () => {
    it('should check if user can add students', async () => {
      const mockLimits = {
        planType: 'basic',
        maxStudents: 10,
        currentUsage: { students: 8 },
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);
      mockPlanLimitsService.checkLimits.mockResolvedValue({
        canAddStudents: true,
        remainingStudents: 2,
        canAddWorkouts: true,
        remainingWorkouts: 15,
      });

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.canAddStudents).toBe(true);
        expect(result.current.remainingStudents).toBe(2);
      });
    });

    it('should detect when limits are reached', async () => {
      const mockLimits = {
        planType: 'basic',
        maxStudents: 10,
        currentUsage: { students: 10 },
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);
      mockPlanLimitsService.checkLimits.mockResolvedValue({
        canAddStudents: false,
        remainingStudents: 0,
        limitReached: 'students',
      });

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.canAddStudents).toBe(false);
        expect(result.current.limitReached).toBe('students');
      });
    });

    it('should check workout limits', async () => {
      const mockLimits = {
        planType: 'premium',
        maxWorkouts: 100,
        currentUsage: { workouts: 95 },
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);
      mockPlanLimitsService.checkLimits.mockResolvedValue({
        canAddWorkouts: true,
        remainingWorkouts: 5,
        nearLimit: 'workouts',
      });

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.canAddWorkouts).toBe(true);
        expect(result.current.remainingWorkouts).toBe(5);
        expect(result.current.nearLimit).toBe('workouts');
      });
    });

    it('should check diet plan limits', async () => {
      mockPlanLimitsService.checkLimits.mockResolvedValue({
        canAddDietPlans: false,
        remainingDietPlans: 0,
        limitReached: 'dietPlans',
      });

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.canAddDietPlans).toBe(false);
        expect(result.current.limitReached).toBe('dietPlans');
      });
    });

    it('should check session limits', async () => {
      mockPlanLimitsService.checkLimits.mockResolvedValue({
        canScheduleSessions: true,
        remainingSessionsThisMonth: 25,
      });

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.canScheduleSessions).toBe(true);
        expect(result.current.remainingSessionsThisMonth).toBe(25);
      });
    });
  });

  describe('usage tracking', () => {
    it('should update usage when adding students', async () => {
      const mockUpdateUsage = vi.fn().mockResolvedValue({ success: true });
      mockPlanLimitsService.updateUsage = mockUpdateUsage;

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.updateUsageMutation).toBeDefined();
      });

      result.current.updateUsageMutation.mutate({
        type: 'students',
        operation: 'increment',
        amount: 1,
      });

      await waitFor(() => {
        expect(mockUpdateUsage).toHaveBeenCalledWith({
          trainerId: 'trainer123',
          type: 'students',
          operation: 'increment',
          amount: 1,
        });
      });
    });

    it('should update usage when removing items', async () => {
      const mockUpdateUsage = vi.fn().mockResolvedValue({ success: true });
      mockPlanLimitsService.updateUsage = mockUpdateUsage;

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.updateUsageMutation).toBeDefined();
      });

      result.current.updateUsageMutation.mutate({
        type: 'workouts',
        operation: 'decrement',
        amount: 1,
      });

      await waitFor(() => {
        expect(mockUpdateUsage).toHaveBeenCalledWith({
          trainerId: 'trainer123',
          type: 'workouts',
          operation: 'decrement',
          amount: 1,
        });
      });
    });

    it('should handle usage update errors', async () => {
      const error = new Error('Failed to update usage');
      mockPlanLimitsService.updateUsage.mockRejectedValue(error);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.updateUsageMutation).toBeDefined();
      });

      result.current.updateUsageMutation.mutate({
        type: 'sessions',
        operation: 'increment',
        amount: 1,
      });

      await waitFor(() => {
        expect(result.current.updateUsageMutation.error).toEqual(error);
      });
    });
  });

  describe('subscription management', () => {
    it('should upgrade subscription successfully', async () => {
      const mockUpgrade = vi.fn().mockResolvedValue({
        success: true,
        newPlan: 'premium',
        effectiveDate: '2024-01-15',
      });
      mockPlanLimitsService.upgradeSubscription = mockUpgrade;

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.upgradeSubscriptionMutation).toBeDefined();
      });

      result.current.upgradeSubscriptionMutation.mutate({
        newPlan: 'premium',
        billingCycle: 'yearly',
      });

      await waitFor(() => {
        expect(mockUpgrade).toHaveBeenCalledWith({
          trainerId: 'trainer123',
          newPlan: 'premium',
          billingCycle: 'yearly',
        });
      });
    });

    it('should handle upgrade failures', async () => {
      const error = new Error('Payment failed');
      mockPlanLimitsService.upgradeSubscription.mockRejectedValue(error);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.upgradeSubscriptionMutation).toBeDefined();
      });

      result.current.upgradeSubscriptionMutation.mutate({
        newPlan: 'premium',
        billingCycle: 'monthly',
      });

      await waitFor(() => {
        expect(result.current.upgradeSubscriptionMutation.error).toEqual(error);
      });
    });

    it('should cancel subscription with confirmation', async () => {
      const mockCancel = vi.fn().mockResolvedValue({
        success: true,
        effectiveDate: '2024-02-15',
        refundAmount: 25.50,
      });
      mockPlanLimitsService.cancelSubscription = mockCancel;

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.cancelSubscriptionMutation).toBeDefined();
      });

      result.current.cancelSubscriptionMutation.mutate({
        reason: 'Too expensive',
        feedback: 'Great service but need to cut costs',
        immediate: false,
      });

      await waitFor(() => {
        expect(mockCancel).toHaveBeenCalledWith({
          trainerId: 'trainer123',
          reason: 'Too expensive',
          feedback: 'Great service but need to cut costs',
          immediate: false,
        });
      });
    });
  });

  describe('usage statistics', () => {
    it('should fetch usage statistics', async () => {
      const mockStats = {
        monthlyUsage: {
          students: { current: 12, previous: 8, growth: 50 },
          workouts: { current: 35, previous: 28, growth: 25 },
          sessions: { current: 45, previous: 52, growth: -13.5 },
        },
        trends: {
          studentsGrowthRate: 0.15,
          workoutCreationRate: 0.08,
          sessionBookingRate: 0.95,
        },
        projections: {
          studentsNextMonth: 14,
          workoutsNextMonth: 42,
          expectedOverage: false,
        },
      };
      mockPlanLimitsService.getUsageStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.usageStats).toEqual(mockStats);
      });

      expect(mockPlanLimitsService.getUsageStats).toHaveBeenCalledWith('trainer123');
    });

    it('should calculate usage percentages', async () => {
      const mockLimits = {
        maxStudents: 50,
        maxWorkouts: 100,
        currentUsage: {
          students: 25,
          workouts: 75,
        },
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.usagePercentages).toEqual({
          students: 50,
          workouts: 75,
        });
      });
    });

    it('should identify approaching limits', async () => {
      const mockLimits = {
        maxStudents: 10,
        maxWorkouts: 20,
        currentUsage: {
          students: 9, // 90% - approaching limit
          workouts: 15, // 75% - not approaching yet
        },
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.approachingLimits).toContain('students');
        expect(result.current.approachingLimits).not.toContain('workouts');
      });
    });
  });

  describe('feature access', () => {
    it('should check AI features access', async () => {
      const mockLimits = {
        planType: 'premium',
        hasAIFeatures: true,
        hasAnalytics: true,
        hasCustomBranding: true,
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasAIFeatures).toBe(true);
        expect(result.current.hasAnalytics).toBe(true);
        expect(result.current.hasCustomBranding).toBe(true);
      });
    });

    it('should restrict features for basic plan', async () => {
      const mockLimits = {
        planType: 'basic',
        hasAIFeatures: false,
        hasAnalytics: false,
        hasCustomBranding: false,
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasAIFeatures).toBe(false);
        expect(result.current.hasAnalytics).toBe(false);
        expect(result.current.hasCustomBranding).toBe(false);
      });
    });

    it('should provide upgrade suggestions', async () => {
      const mockLimits = {
        planType: 'basic',
        maxStudents: 10,
        currentUsage: { students: 9 },
        hasAIFeatures: false,
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.shouldSuggestUpgrade).toBe(true);
        expect(result.current.upgradeReasons).toContain('approaching student limit');
        expect(result.current.upgradeReasons).toContain('unlock AI features');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty trainer ID', () => {
      const { result } = renderHook(() => usePlanLimits(''), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockPlanLimitsService.getPlanLimits).not.toHaveBeenCalled();
    });

    it('should handle null trainer ID', () => {
      const { result } = renderHook(() => usePlanLimits(null as unknown), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockPlanLimitsService.getPlanLimits).not.toHaveBeenCalled();
    });

    it('should handle expired subscriptions', async () => {
      const mockLimits = {
        planType: 'premium',
        isActive: false,
        expirationDate: '2024-01-01',
        gracePeriodEnds: '2024-01-07',
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isExpired).toBe(true);
        expect(result.current.isInGracePeriod).toBe(true);
      });
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      mockPlanLimitsService.getPlanLimits.mockRejectedValue(networkError);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(networkError);
        expect(result.current.isNetworkError).toBe(true);
      });
    });

    it('should handle subscription downgrades', async () => {
      const mockLimits = {
        planType: 'basic',
        maxStudents: 10,
        currentUsage: { students: 15 }, // Over limit due to downgrade
        overLimit: true,
        gracePeriodEnds: '2024-01-30',
      };
      mockPlanLimitsService.getPlanLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isOverLimit).toBe(true);
        expect(result.current.requiresAction).toBe(true);
        expect(result.current.actionRequired).toBe('reduce students or upgrade plan');
      });
    });

    it('should invalidate cache after usage updates', async () => {
      const mockUpdateUsage = vi.fn().mockResolvedValue({ success: true });
      mockPlanLimitsService.updateUsage = mockUpdateUsage;

      const { result } = renderHook(() => usePlanLimits('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.updateUsageMutation).toBeDefined();
      });

      result.current.updateUsageMutation.mutate({
        type: 'students',
        operation: 'increment',
        amount: 1,
      });

      await waitFor(() => {
        expect(result.current.updateUsageMutation.isSuccess).toBe(true);
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['planLimits', 'trainer123'])?.isInvalidated).toBe(true);
    });
  });
});
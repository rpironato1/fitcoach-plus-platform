import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDietPlans } from './useDietPlans';
import React from 'react';

// Mock the container
const mockContainer = {
  get: vi.fn(),
};

vi.mock('../core/container/Container', () => ({
  container: mockContainer,
}));

const mockDietPlansService = {
  getDietPlans: vi.fn(),
  createDietPlan: vi.fn(),
  updateDietPlan: vi.fn(),
  deleteDietPlan: vi.fn(),
  getDietPlansByTrainer: vi.fn(),
  getDietPlansByStudent: vi.fn(),
  duplicateDietPlan: vi.fn(),
  assignDietPlanToStudent: vi.fn(),
};

describe('useDietPlans', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockContainer.get.mockReturnValue(mockDietPlansService);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('getDietPlans', () => {
    it('should fetch diet plans successfully', async () => {
      const mockDietPlans = [
        { 
          id: '1', 
          name: 'Weight Loss Plan', 
          description: 'Low carb, high protein diet',
          meals: [
            { name: 'Breakfast', calories: 300, proteins: 25, carbs: 15, fats: 12 },
            { name: 'Lunch', calories: 450, proteins: 35, carbs: 20, fats: 18 },
            { name: 'Dinner', calories: 400, proteins: 30, carbs: 25, fats: 15 }
          ],
          totalCalories: 1150,
          macros: { proteins: 90, carbs: 60, fats: 45 }
        },
        { 
          id: '2', 
          name: 'Muscle Gain Plan', 
          description: 'High protein, moderate carbs',
          meals: [
            { name: 'Breakfast', calories: 500, proteins: 40, carbs: 30, fats: 20 },
            { name: 'Lunch', calories: 600, proteins: 45, carbs: 40, fats: 25 },
            { name: 'Dinner', calories: 550, proteins: 42, carbs: 35, fats: 22 }
          ],
          totalCalories: 1650,
          macros: { proteins: 127, carbs: 105, fats: 67 }
        },
      ];
      mockDietPlansService.getDietPlans.mockResolvedValue(mockDietPlans);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDietPlans);
      });

      expect(mockDietPlansService.getDietPlans).toHaveBeenCalled();
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Failed to fetch diet plans');
      mockDietPlansService.getDietPlans.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('should show loading state initially', () => {
      mockDietPlansService.getDietPlans.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('getDietPlansByTrainer', () => {
    it('should fetch trainer diet plans successfully', async () => {
      const trainerId = 'trainer123';
      const mockDietPlans = [
        { 
          id: '1', 
          name: 'Trainer Special Diet', 
          trainerId,
          meals: [{ name: 'Breakfast', calories: 300 }],
          totalCalories: 300 
        },
      ];
      mockDietPlansService.getDietPlansByTrainer.mockResolvedValue(mockDietPlans);

      const { result } = renderHook(() => useDietPlans(trainerId, 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDietPlans);
      });

      expect(mockDietPlansService.getDietPlansByTrainer).toHaveBeenCalledWith(trainerId);
    });

    it('should handle trainer diet plans error', async () => {
      const error = new Error('Failed to fetch trainer diet plans');
      mockDietPlansService.getDietPlansByTrainer.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans('trainer123', 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('getDietPlansByStudent', () => {
    it('should fetch student diet plans successfully', async () => {
      const studentId = 'student123';
      const mockDietPlans = [
        { 
          id: '1', 
          name: 'Student Diet Plan', 
          studentId,
          meals: [{ name: 'Breakfast', calories: 250 }],
          totalCalories: 250 
        },
      ];
      mockDietPlansService.getDietPlansByStudent.mockResolvedValue(mockDietPlans);

      const { result } = renderHook(() => useDietPlans(studentId, 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockDietPlans);
      });

      expect(mockDietPlansService.getDietPlansByStudent).toHaveBeenCalledWith(studentId);
    });

    it('should handle student diet plans error', async () => {
      const error = new Error('Failed to fetch student diet plans');
      mockDietPlansService.getDietPlansByStudent.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans('student123', 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('mutations', () => {
    it('should create diet plan successfully', async () => {
      const newDietPlan = { 
        name: 'New Diet Plan', 
        description: 'Test diet plan',
        meals: [
          { name: 'Breakfast', calories: 350, proteins: 20, carbs: 30, fats: 15 }
        ],
        totalCalories: 350,
        macros: { proteins: 20, carbs: 30, fats: 15 }
      };
      const createdDietPlan = { id: '3', ...newDietPlan };
      mockDietPlansService.createDietPlan.mockResolvedValue(createdDietPlan);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      result.current.createDietPlanMutation.mutate(newDietPlan);

      await waitFor(() => {
        expect(mockDietPlansService.createDietPlan).toHaveBeenCalledWith(newDietPlan);
      });
    });

    it('should update diet plan successfully', async () => {
      const updatedDietPlan = { 
        id: '1', 
        name: 'Updated Diet Plan', 
        description: 'Updated description',
        meals: [
          { name: 'Updated Breakfast', calories: 400, proteins: 25, carbs: 35, fats: 18 }
        ],
        totalCalories: 400,
        macros: { proteins: 25, carbs: 35, fats: 18 }
      };
      mockDietPlansService.updateDietPlan.mockResolvedValue(updatedDietPlan);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateDietPlanMutation).toBeDefined();
      });

      result.current.updateDietPlanMutation.mutate(updatedDietPlan);

      await waitFor(() => {
        expect(mockDietPlansService.updateDietPlan).toHaveBeenCalledWith(updatedDietPlan);
      });
    });

    it('should delete diet plan successfully', async () => {
      const dietPlanId = '1';
      mockDietPlansService.deleteDietPlan.mockResolvedValue(true);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteDietPlanMutation).toBeDefined();
      });

      result.current.deleteDietPlanMutation.mutate(dietPlanId);

      await waitFor(() => {
        expect(mockDietPlansService.deleteDietPlan).toHaveBeenCalledWith(dietPlanId);
      });
    });

    it('should duplicate diet plan successfully', async () => {
      const originalDietPlan = { 
        id: '1', 
        name: 'Original Diet Plan',
        meals: [{ name: 'Meal 1', calories: 300 }] 
      };
      const duplicatedDietPlan = { 
        id: '4', 
        name: 'Copy of Original Diet Plan',
        meals: [{ name: 'Meal 1', calories: 300 }] 
      };
      mockDietPlansService.duplicateDietPlan.mockResolvedValue(duplicatedDietPlan);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.duplicateDietPlanMutation).toBeDefined();
      });

      result.current.duplicateDietPlanMutation.mutate(originalDietPlan);

      await waitFor(() => {
        expect(mockDietPlansService.duplicateDietPlan).toHaveBeenCalledWith(originalDietPlan);
      });
    });

    it('should assign diet plan to student successfully', async () => {
      const assignment = { 
        dietPlanId: '1',
        studentId: 'student123',
        startDate: '2024-01-15',
        endDate: '2024-02-15'
      };
      mockDietPlansService.assignDietPlanToStudent.mockResolvedValue(assignment);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.assignDietPlanMutation).toBeDefined();
      });

      result.current.assignDietPlanMutation.mutate(assignment);

      await waitFor(() => {
        expect(mockDietPlansService.assignDietPlanToStudent).toHaveBeenCalledWith(assignment);
      });
    });

    it('should handle create mutation error', async () => {
      const error = new Error('Failed to create diet plan');
      mockDietPlansService.createDietPlan.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      result.current.createDietPlanMutation.mutate({ 
        name: 'Test Diet Plan',
        meals: [{ name: 'Test Meal', calories: 200 }],
        totalCalories: 200 
      });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation.error).toEqual(error);
      });
    });

    it('should handle update mutation error', async () => {
      const error = new Error('Failed to update diet plan');
      mockDietPlansService.updateDietPlan.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateDietPlanMutation).toBeDefined();
      });

      result.current.updateDietPlanMutation.mutate({ 
        id: '1',
        name: 'Updated Diet Plan',
        meals: [{ name: 'Updated Meal', calories: 250 }] 
      });

      await waitFor(() => {
        expect(result.current.updateDietPlanMutation.error).toEqual(error);
      });
    });

    it('should handle delete mutation error', async () => {
      const error = new Error('Failed to delete diet plan');
      mockDietPlansService.deleteDietPlan.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteDietPlanMutation).toBeDefined();
      });

      result.current.deleteDietPlanMutation.mutate('dietplan1');

      await waitFor(() => {
        expect(result.current.deleteDietPlanMutation.error).toEqual(error);
      });
    });

    it('should handle assignment mutation error', async () => {
      const error = new Error('Failed to assign diet plan');
      mockDietPlansService.assignDietPlanToStudent.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.assignDietPlanMutation).toBeDefined();
      });

      result.current.assignDietPlanMutation.mutate({ 
        dietPlanId: '1',
        studentId: 'student123',
        startDate: '2024-01-15'
      });

      await waitFor(() => {
        expect(result.current.assignDietPlanMutation.error).toEqual(error);
      });
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty user ID with type', () => {
      const { result } = renderHook(() => useDietPlans('', 'trainer'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockDietPlansService.getDietPlansByTrainer).not.toHaveBeenCalled();
    });

    it('should handle null user ID', () => {
      const { result } = renderHook(() => useDietPlans(null as unknown, 'student'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockDietPlansService.getDietPlansByStudent).not.toHaveBeenCalled();
    });

    it('should invalidate cache after successful mutations', async () => {
      const newDietPlan = { 
        name: 'Cache Test Diet Plan',
        meals: [{ name: 'Cache Meal', calories: 300 }],
        totalCalories: 300 
      };
      mockDietPlansService.createDietPlan.mockResolvedValue({ id: '4', ...newDietPlan });

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      result.current.createDietPlanMutation.mutate(newDietPlan);

      await waitFor(() => {
        expect(result.current.createDietPlanMutation.isSuccess).toBe(true);
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['dietPlans'])?.isInvalidated).toBe(true);
    });

    it('should handle invalid diet plan type parameter', () => {
      const { result } = renderHook(() => useDietPlans('user123', 'invalid' as unknown), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockDietPlansService.getDietPlansByTrainer).not.toHaveBeenCalled();
      expect(mockDietPlansService.getDietPlansByStudent).not.toHaveBeenCalled();
    });

    it('should handle diet plan with invalid nutritional data', async () => {
      const invalidDietPlan = { 
        name: 'Invalid Diet Plan',
        meals: [
          { name: 'Invalid Meal', calories: -100, proteins: 'invalid', carbs: null }
        ]
      };
      const error = new Error('Invalid nutritional data');
      mockDietPlansService.createDietPlan.mockRejectedValue(error);

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      result.current.createDietPlanMutation.mutate(invalidDietPlan);

      await waitFor(() => {
        expect(result.current.createDietPlanMutation.error).toEqual(error);
      });
    });

    it('should validate macronutrient calculations', async () => {
      const dietPlanWithMismatchedMacros = { 
        name: 'Mismatched Macros Plan',
        meals: [
          { name: 'Meal 1', calories: 400, proteins: 30, carbs: 40, fats: 20 }
        ],
        totalCalories: 400,
        // Mismatched macro totals
        macros: { proteins: 50, carbs: 60, fats: 30 }
      };

      mockDietPlansService.createDietPlan.mockResolvedValue({ 
        id: '5', 
        ...dietPlanWithMismatchedMacros,
        // Corrected macros
        macros: { proteins: 30, carbs: 40, fats: 20 }
      });

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      result.current.createDietPlanMutation.mutate(dietPlanWithMismatchedMacros);

      await waitFor(() => {
        expect(result.current.createDietPlanMutation.isSuccess).toBe(true);
        expect(result.current.createDietPlanMutation.data?.macros).toEqual({
          proteins: 30,
          carbs: 40,
          fats: 20
        });
      });
    });

    it('should handle concurrent diet plan operations', async () => {
      const dietPlan1 = { 
        name: 'Diet Plan 1',
        meals: [{ name: 'Meal 1', calories: 300 }],
        totalCalories: 300 
      };
      const dietPlan2 = { 
        name: 'Diet Plan 2',
        meals: [{ name: 'Meal 2', calories: 450 }],
        totalCalories: 450 
      };

      mockDietPlansService.createDietPlan
        .mockResolvedValueOnce({ id: '5', ...dietPlan1 })
        .mockResolvedValueOnce({ id: '6', ...dietPlan2 });

      const { result } = renderHook(() => useDietPlans(), { wrapper });

      await waitFor(() => {
        expect(result.current.createDietPlanMutation).toBeDefined();
      });

      // Create multiple diet plans concurrently
      result.current.createDietPlanMutation.mutate(dietPlan1);
      result.current.createDietPlanMutation.mutate(dietPlan2);

      await waitFor(() => {
        expect(mockDietPlansService.createDietPlan).toHaveBeenCalledTimes(2);
      });
    });
  });
});
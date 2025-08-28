import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkouts } from './useWorkouts';
import React from 'react';

// Mock the container
const mockContainer = {
  get: vi.fn(),
};

vi.mock('../core/container/Container', () => ({
  container: mockContainer,
}));

const mockWorkoutsService = {
  getWorkouts: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  getWorkoutsByTrainer: vi.fn(),
  getWorkoutsByStudent: vi.fn(),
  duplicateWorkout: vi.fn(),
};

describe('useWorkouts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockContainer.get.mockReturnValue(mockWorkoutsService);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('getWorkouts', () => {
    it('should fetch workouts successfully', async () => {
      const mockWorkouts = [
        { 
          id: '1', 
          name: 'Upper Body Strength', 
          description: 'Focus on chest, back, and arms',
          exercises: ['Push-ups', 'Pull-ups', 'Bench Press'],
          duration: 45,
          difficulty: 'intermediate' 
        },
        { 
          id: '2', 
          name: 'Cardio Blast', 
          description: 'High intensity cardio workout',
          exercises: ['Burpees', 'Mountain Climbers', 'Jump Rope'],
          duration: 30,
          difficulty: 'advanced' 
        },
      ];
      mockWorkoutsService.getWorkouts.mockResolvedValue(mockWorkouts);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockWorkouts);
      });

      expect(mockWorkoutsService.getWorkouts).toHaveBeenCalled();
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Failed to fetch workouts');
      mockWorkoutsService.getWorkouts.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('should show loading state initially', () => {
      mockWorkoutsService.getWorkouts.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('getWorkoutsByTrainer', () => {
    it('should fetch trainer workouts successfully', async () => {
      const trainerId = 'trainer123';
      const mockWorkouts = [
        { 
          id: '1', 
          name: 'Trainer Special', 
          trainerId,
          exercises: ['Squats', 'Deadlifts'],
          duration: 60 
        },
      ];
      mockWorkoutsService.getWorkoutsByTrainer.mockResolvedValue(mockWorkouts);

      const { result } = renderHook(() => useWorkouts(trainerId, 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockWorkouts);
      });

      expect(mockWorkoutsService.getWorkoutsByTrainer).toHaveBeenCalledWith(trainerId);
    });

    it('should handle trainer workouts error', async () => {
      const error = new Error('Failed to fetch trainer workouts');
      mockWorkoutsService.getWorkoutsByTrainer.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts('trainer123', 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('getWorkoutsByStudent', () => {
    it('should fetch student workouts successfully', async () => {
      const studentId = 'student123';
      const mockWorkouts = [
        { 
          id: '1', 
          name: 'Student Workout', 
          studentId,
          exercises: ['Walking', 'Stretching'],
          duration: 30 
        },
      ];
      mockWorkoutsService.getWorkoutsByStudent.mockResolvedValue(mockWorkouts);

      const { result } = renderHook(() => useWorkouts(studentId, 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockWorkouts);
      });

      expect(mockWorkoutsService.getWorkoutsByStudent).toHaveBeenCalledWith(studentId);
    });

    it('should handle student workouts error', async () => {
      const error = new Error('Failed to fetch student workouts');
      mockWorkoutsService.getWorkoutsByStudent.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts('student123', 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('mutations', () => {
    it('should create workout successfully', async () => {
      const newWorkout = { 
        name: 'New Workout', 
        description: 'Test workout',
        exercises: ['Exercise 1', 'Exercise 2'],
        duration: 45,
        difficulty: 'beginner'
      };
      const createdWorkout = { id: '3', ...newWorkout };
      mockWorkoutsService.createWorkout.mockResolvedValue(createdWorkout);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation).toBeDefined();
      });

      result.current.createWorkoutMutation.mutate(newWorkout);

      await waitFor(() => {
        expect(mockWorkoutsService.createWorkout).toHaveBeenCalledWith(newWorkout);
      });
    });

    it('should update workout successfully', async () => {
      const updatedWorkout = { 
        id: '1', 
        name: 'Updated Workout', 
        description: 'Updated description',
        exercises: ['Updated Exercise'],
        duration: 50 
      };
      mockWorkoutsService.updateWorkout.mockResolvedValue(updatedWorkout);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateWorkoutMutation).toBeDefined();
      });

      result.current.updateWorkoutMutation.mutate(updatedWorkout);

      await waitFor(() => {
        expect(mockWorkoutsService.updateWorkout).toHaveBeenCalledWith(updatedWorkout);
      });
    });

    it('should delete workout successfully', async () => {
      const workoutId = '1';
      mockWorkoutsService.deleteWorkout.mockResolvedValue(true);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteWorkoutMutation).toBeDefined();
      });

      result.current.deleteWorkoutMutation.mutate(workoutId);

      await waitFor(() => {
        expect(mockWorkoutsService.deleteWorkout).toHaveBeenCalledWith(workoutId);
      });
    });

    it('should duplicate workout successfully', async () => {
      const originalWorkout = { 
        id: '1', 
        name: 'Original Workout',
        exercises: ['Exercise 1'] 
      };
      const duplicatedWorkout = { 
        id: '4', 
        name: 'Copy of Original Workout',
        exercises: ['Exercise 1'] 
      };
      mockWorkoutsService.duplicateWorkout.mockResolvedValue(duplicatedWorkout);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.duplicateWorkoutMutation).toBeDefined();
      });

      result.current.duplicateWorkoutMutation.mutate(originalWorkout);

      await waitFor(() => {
        expect(mockWorkoutsService.duplicateWorkout).toHaveBeenCalledWith(originalWorkout);
      });
    });

    it('should handle create mutation error', async () => {
      const error = new Error('Failed to create workout');
      mockWorkoutsService.createWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation).toBeDefined();
      });

      result.current.createWorkoutMutation.mutate({ 
        name: 'Test Workout',
        exercises: ['Test Exercise'],
        duration: 30 
      });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation.error).toEqual(error);
      });
    });

    it('should handle update mutation error', async () => {
      const error = new Error('Failed to update workout');
      mockWorkoutsService.updateWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateWorkoutMutation).toBeDefined();
      });

      result.current.updateWorkoutMutation.mutate({ 
        id: '1',
        name: 'Updated Workout',
        exercises: ['Updated Exercise'] 
      });

      await waitFor(() => {
        expect(result.current.updateWorkoutMutation.error).toEqual(error);
      });
    });

    it('should handle delete mutation error', async () => {
      const error = new Error('Failed to delete workout');
      mockWorkoutsService.deleteWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteWorkoutMutation).toBeDefined();
      });

      result.current.deleteWorkoutMutation.mutate('workout1');

      await waitFor(() => {
        expect(result.current.deleteWorkoutMutation.error).toEqual(error);
      });
    });

    it('should handle duplicate mutation error', async () => {
      const error = new Error('Failed to duplicate workout');
      mockWorkoutsService.duplicateWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.duplicateWorkoutMutation).toBeDefined();
      });

      result.current.duplicateWorkoutMutation.mutate({ 
        id: '1',
        name: 'Original',
        exercises: ['Exercise'] 
      });

      await waitFor(() => {
        expect(result.current.duplicateWorkoutMutation.error).toEqual(error);
      });
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty user ID with type', () => {
      const { result } = renderHook(() => useWorkouts('', 'trainer'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockWorkoutsService.getWorkoutsByTrainer).not.toHaveBeenCalled();
    });

    it('should handle null user ID', () => {
      const { result } = renderHook(() => useWorkouts(null as any, 'student'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockWorkoutsService.getWorkoutsByStudent).not.toHaveBeenCalled();
    });

    it('should invalidate cache after successful mutations', async () => {
      const newWorkout = { 
        name: 'Cache Test Workout',
        exercises: ['Cache Exercise'],
        duration: 30 
      };
      mockWorkoutsService.createWorkout.mockResolvedValue({ id: '4', ...newWorkout });

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation).toBeDefined();
      });

      result.current.createWorkoutMutation.mutate(newWorkout);

      await waitFor(() => {
        expect(result.current.createWorkoutMutation.isSuccess).toBe(true);
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['workouts'])?.isInvalidated).toBe(true);
    });

    it('should handle invalid workout type parameter', () => {
      const { result } = renderHook(() => useWorkouts('user123', 'invalid' as any), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockWorkoutsService.getWorkoutsByTrainer).not.toHaveBeenCalled();
      expect(mockWorkoutsService.getWorkoutsByStudent).not.toHaveBeenCalled();
    });

    it('should handle workout with missing required fields', async () => {
      const incompleteWorkout = { 
        name: 'Incomplete Workout'
        // Missing exercises, duration, etc.
      };
      const error = new Error('Invalid workout data');
      mockWorkoutsService.createWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation).toBeDefined();
      });

      result.current.createWorkoutMutation.mutate(incompleteWorkout);

      await waitFor(() => {
        expect(result.current.createWorkoutMutation.error).toEqual(error);
      });
    });

    it('should handle concurrent workout operations', async () => {
      const workout1 = { 
        name: 'Workout 1',
        exercises: ['Exercise 1'],
        duration: 30 
      };
      const workout2 = { 
        name: 'Workout 2',
        exercises: ['Exercise 2'],
        duration: 45 
      };

      mockWorkoutsService.createWorkout
        .mockResolvedValueOnce({ id: '5', ...workout1 })
        .mockResolvedValueOnce({ id: '6', ...workout2 });

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.createWorkoutMutation).toBeDefined();
      });

      // Create multiple workouts concurrently
      result.current.createWorkoutMutation.mutate(workout1);
      result.current.createWorkoutMutation.mutate(workout2);

      await waitFor(() => {
        expect(mockWorkoutsService.createWorkout).toHaveBeenCalledTimes(2);
      });
    });
  });
});
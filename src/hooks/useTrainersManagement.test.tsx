/**
 * Comprehensive test suite for useTrainersManagement hook
 * Testing critical trainer management functionality - 100% coverage target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrainersManagement } from './useTrainersManagement';
import React from 'react';

// Mock the services
const mockLocalStorageService = {
  getAllTrainers: vi.fn(),
  updateTrainer: vi.fn(),
  deleteTrainer: vi.fn(),
  createTrainer: vi.fn(),
  getTrainerStats: vi.fn(),
};

vi.mock('@/services/localStorageService', () => ({
  localStorageService: mockLocalStorageService,
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useTrainersManagement', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Trainer Data Fetching', () => {
    it('should fetch all trainers successfully', async () => {
      const mockTrainers = [
        { id: '1', name: 'John Trainer', email: 'john@test.com', status: 'active' },
        { id: '2', name: 'Jane Trainer', email: 'jane@test.com', status: 'pending' },
      ];
      
      mockLocalStorageService.getAllTrainers.mockResolvedValue(mockTrainers);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.trainers).toEqual(mockTrainers);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle trainer data fetching errors', async () => {
      const errorMessage = 'Failed to fetch trainers';
      mockLocalStorageService.getAllTrainers.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should show loading state while fetching', () => {
      mockLocalStorageService.getAllTrainers.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Trainer Updates', () => {
    it('should update trainer successfully', async () => {
      const updatedTrainer = { id: '1', name: 'Updated Name', status: 'active' };
      mockLocalStorageService.updateTrainer.mockResolvedValue(updatedTrainer);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.updateTrainer(updatedTrainer);
      });

      expect(mockLocalStorageService.updateTrainer).toHaveBeenCalledWith(updatedTrainer);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Trainer updated successfully',
        variant: 'default',
      });
    });

    it('should handle trainer update errors', async () => {
      const trainerData = { id: '1', name: 'Test', status: 'active' };
      const errorMessage = 'Update failed';
      mockLocalStorageService.updateTrainer.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await expect(result.current.updateTrainer(trainerData)).rejects.toThrow(errorMessage);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update trainer',
        variant: 'destructive',
      });
    });
  });

  describe('Trainer Deletion', () => {
    it('should delete trainer successfully', async () => {
      mockLocalStorageService.deleteTrainer.mockResolvedValue(true);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.deleteTrainer('trainer-123');
      });

      expect(mockLocalStorageService.deleteTrainer).toHaveBeenCalledWith('trainer-123');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Trainer deleted successfully',
        variant: 'default',
      });
    });

    it('should handle trainer deletion errors', async () => {
      const errorMessage = 'Deletion failed';
      mockLocalStorageService.deleteTrainer.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await expect(result.current.deleteTrainer('trainer-123')).rejects.toThrow(errorMessage);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error', 
        description: 'Failed to delete trainer',
        variant: 'destructive',
      });
    });
  });

  describe('Trainer Creation', () => {
    it('should create new trainer successfully', async () => {
      const newTrainerData = {
        name: 'New Trainer',
        email: 'new@test.com',
        specialties: ['fitness', 'nutrition'],
      };
      
      const createdTrainer = { id: 'new-123', ...newTrainerData };
      mockLocalStorageService.createTrainer.mockResolvedValue(createdTrainer);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.createTrainer(newTrainerData);
      });

      expect(mockLocalStorageService.createTrainer).toHaveBeenCalledWith(newTrainerData);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Trainer created successfully',
        variant: 'default',
      });
    });

    it('should handle trainer creation errors', async () => {
      const trainerData = { name: 'Test', email: 'test@test.com' };
      const errorMessage = 'Creation failed';
      mockLocalStorageService.createTrainer.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await expect(result.current.createTrainer(trainerData)).rejects.toThrow(errorMessage);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create trainer',
        variant: 'destructive',
      });
    });
  });

  describe('Trainer Statistics', () => {
    it('should fetch trainer statistics successfully', async () => {
      const mockStats = {
        totalTrainers: 25,
        activeTrainers: 20,
        pendingTrainers: 3,
        suspendedTrainers: 2,
        averageRating: 4.5,
      };
      
      mockLocalStorageService.getTrainerStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      });
    });

    it('should handle statistics fetching errors', async () => {
      mockLocalStorageService.getTrainerStats.mockRejectedValue(new Error('Stats error'));

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.statsError).toBeTruthy();
      });
    });
  });

  describe('Data Filtering and Sorting', () => {
    it('should filter trainers by status', async () => {
      const mockTrainers = [
        { id: '1', name: 'Active Trainer', status: 'active' },
        { id: '2', name: 'Pending Trainer', status: 'pending' },
      ];
      
      mockLocalStorageService.getAllTrainers.mockResolvedValue(mockTrainers);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.trainers).toEqual(mockTrainers);
      });

      act(() => {
        result.current.filterByStatus('active');
      });

      expect(result.current.filteredTrainers).toEqual([mockTrainers[0]]);
    });

    it('should sort trainers by name', async () => {
      const mockTrainers = [
        { id: '1', name: 'Zack Trainer' },
        { id: '2', name: 'Alice Trainer' },
      ];
      
      mockLocalStorageService.getAllTrainers.mockResolvedValue(mockTrainers);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await waitFor(() => {
        expect(result.current.trainers).toEqual(mockTrainers);
      });

      act(() => {
        result.current.sortBy('name', 'asc');
      });

      expect(result.current.sortedTrainers[0].name).toBe('Alice Trainer');
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk trainer status updates', async () => {
      const trainerIds = ['1', '2', '3'];
      const newStatus = 'active';
      
      mockLocalStorageService.updateTrainer.mockResolvedValue({});

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.bulkUpdateStatus(trainerIds, newStatus);
      });

      expect(mockLocalStorageService.updateTrainer).toHaveBeenCalledTimes(3);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Bulk update completed successfully',
        variant: 'default',
      });
    });

    it('should handle bulk deletion with confirmation', async () => {
      const trainerIds = ['1', '2'];
      mockLocalStorageService.deleteTrainer.mockResolvedValue(true);

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.bulkDelete(trainerIds);
      });

      expect(mockLocalStorageService.deleteTrainer).toHaveBeenCalledTimes(2);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: '2 trainers deleted successfully',
        variant: 'default',
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should refresh data after mutations', async () => {
      mockLocalStorageService.getAllTrainers.mockResolvedValue([]);
      
      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockLocalStorageService.getAllTrainers).toHaveBeenCalled();
    });

    it('should handle concurrent updates gracefully', async () => {
      const trainer1 = { id: '1', name: 'Trainer 1' };
      const trainer2 = { id: '2', name: 'Trainer 2' };
      
      mockLocalStorageService.updateTrainer.mockResolvedValue({});

      const { result } = renderHook(() => useTrainersManagement(), { wrapper });

      await act(async () => {
        await Promise.all([
          result.current.updateTrainer(trainer1),
          result.current.updateTrainer(trainer2),
        ]);
      });

      expect(mockLocalStorageService.updateTrainer).toHaveBeenCalledTimes(2);
    });
  });
});
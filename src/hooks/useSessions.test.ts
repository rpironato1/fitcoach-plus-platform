import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessions } from './useSessions';
import React from 'react';

// Mock the container
const mockContainer = {
  get: vi.fn(),
};

vi.mock('../core/container/Container', () => ({
  container: mockContainer,
}));

const mockSessionsService = {
  getSessions: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  getSessionsByTrainer: vi.fn(),
  getSessionsByStudent: vi.fn(),
};

describe('useSessions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockContainer.get.mockReturnValue(mockSessionsService);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('getSessions', () => {
    it('should fetch sessions successfully', async () => {
      const mockSessions = [
        { 
          id: '1', 
          title: 'Morning Workout', 
          trainerId: 'trainer1',
          studentId: 'student1',
          date: '2024-01-15',
          status: 'scheduled' 
        },
        { 
          id: '2', 
          title: 'Evening Cardio', 
          trainerId: 'trainer1',
          studentId: 'student2',
          date: '2024-01-16',
          status: 'completed' 
        },
      ];
      mockSessionsService.getSessions.mockResolvedValue(mockSessions);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockSessions);
      });

      expect(mockSessionsService.getSessions).toHaveBeenCalled();
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Failed to fetch sessions');
      mockSessionsService.getSessions.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('should show loading state initially', () => {
      mockSessionsService.getSessions.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useSessions(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('getSessionsByTrainer', () => {
    it('should fetch trainer sessions successfully', async () => {
      const trainerId = 'trainer123';
      const mockSessions = [
        { 
          id: '1', 
          title: 'Personal Training', 
          trainerId,
          studentId: 'student1',
          date: '2024-01-15' 
        },
      ];
      mockSessionsService.getSessionsByTrainer.mockResolvedValue(mockSessions);

      const { result } = renderHook(() => useSessions(trainerId, 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockSessions);
      });

      expect(mockSessionsService.getSessionsByTrainer).toHaveBeenCalledWith(trainerId);
    });

    it('should handle trainer sessions error', async () => {
      const error = new Error('Failed to fetch trainer sessions');
      mockSessionsService.getSessionsByTrainer.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions('trainer123', 'trainer'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('getSessionsByStudent', () => {
    it('should fetch student sessions successfully', async () => {
      const studentId = 'student123';
      const mockSessions = [
        { 
          id: '1', 
          title: 'Yoga Class', 
          trainerId: 'trainer1',
          studentId,
          date: '2024-01-15' 
        },
      ];
      mockSessionsService.getSessionsByStudent.mockResolvedValue(mockSessions);

      const { result } = renderHook(() => useSessions(studentId, 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockSessions);
      });

      expect(mockSessionsService.getSessionsByStudent).toHaveBeenCalledWith(studentId);
    });

    it('should handle student sessions error', async () => {
      const error = new Error('Failed to fetch student sessions');
      mockSessionsService.getSessionsByStudent.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions('student123', 'student'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('mutations', () => {
    it('should create session successfully', async () => {
      const newSession = { 
        title: 'New Session', 
        trainerId: 'trainer1',
        studentId: 'student1',
        date: '2024-01-20',
        duration: 60 
      };
      const createdSession = { id: '3', ...newSession };
      mockSessionsService.createSession.mockResolvedValue(createdSession);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.createSessionMutation).toBeDefined();
      });

      result.current.createSessionMutation.mutate(newSession);

      await waitFor(() => {
        expect(mockSessionsService.createSession).toHaveBeenCalledWith(newSession);
      });
    });

    it('should update session successfully', async () => {
      const updatedSession = { 
        id: '1', 
        title: 'Updated Session', 
        trainerId: 'trainer1',
        studentId: 'student1',
        date: '2024-01-21' 
      };
      mockSessionsService.updateSession.mockResolvedValue(updatedSession);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateSessionMutation).toBeDefined();
      });

      result.current.updateSessionMutation.mutate(updatedSession);

      await waitFor(() => {
        expect(mockSessionsService.updateSession).toHaveBeenCalledWith(updatedSession);
      });
    });

    it('should delete session successfully', async () => {
      const sessionId = '1';
      mockSessionsService.deleteSession.mockResolvedValue(true);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteSessionMutation).toBeDefined();
      });

      result.current.deleteSessionMutation.mutate(sessionId);

      await waitFor(() => {
        expect(mockSessionsService.deleteSession).toHaveBeenCalledWith(sessionId);
      });
    });

    it('should handle create mutation error', async () => {
      const error = new Error('Failed to create session');
      mockSessionsService.createSession.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.createSessionMutation).toBeDefined();
      });

      result.current.createSessionMutation.mutate({ 
        title: 'Test Session',
        trainerId: 'trainer1',
        studentId: 'student1',
        date: '2024-01-15' 
      });

      await waitFor(() => {
        expect(result.current.createSessionMutation.error).toEqual(error);
      });
    });

    it('should handle update mutation error', async () => {
      const error = new Error('Failed to update session');
      mockSessionsService.updateSession.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.updateSessionMutation).toBeDefined();
      });

      result.current.updateSessionMutation.mutate({ 
        id: '1',
        title: 'Updated Session',
        trainerId: 'trainer1',
        studentId: 'student1' 
      });

      await waitFor(() => {
        expect(result.current.updateSessionMutation.error).toEqual(error);
      });
    });

    it('should handle delete mutation error', async () => {
      const error = new Error('Failed to delete session');
      mockSessionsService.deleteSession.mockRejectedValue(error);

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteSessionMutation).toBeDefined();
      });

      result.current.deleteSessionMutation.mutate('session1');

      await waitFor(() => {
        expect(result.current.deleteSessionMutation.error).toEqual(error);
      });
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty user ID with type', () => {
      const { result } = renderHook(() => useSessions('', 'trainer'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockSessionsService.getSessionsByTrainer).not.toHaveBeenCalled();
    });

    it('should handle null user ID', () => {
      const { result } = renderHook(() => useSessions(null as any, 'student'), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockSessionsService.getSessionsByStudent).not.toHaveBeenCalled();
    });

    it('should invalidate cache after successful mutations', async () => {
      const newSession = { 
        title: 'Cache Test Session',
        trainerId: 'trainer1',
        studentId: 'student1',
        date: '2024-01-15' 
      };
      mockSessionsService.createSession.mockResolvedValue({ id: '4', ...newSession });

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.createSessionMutation).toBeDefined();
      });

      result.current.createSessionMutation.mutate(newSession);

      await waitFor(() => {
        expect(result.current.createSessionMutation.isSuccess).toBe(true);
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['sessions'])?.isInvalidated).toBe(true);
    });

    it('should handle concurrent mutations', async () => {
      const session1 = { 
        title: 'Session 1',
        trainerId: 'trainer1',
        studentId: 'student1',
        date: '2024-01-15' 
      };
      const session2 = { 
        title: 'Session 2',
        trainerId: 'trainer1',
        studentId: 'student2',
        date: '2024-01-16' 
      };

      mockSessionsService.createSession
        .mockResolvedValueOnce({ id: '5', ...session1 })
        .mockResolvedValueOnce({ id: '6', ...session2 });

      const { result } = renderHook(() => useSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.createSessionMutation).toBeDefined();
      });

      // Create multiple sessions concurrently
      result.current.createSessionMutation.mutate(session1);
      result.current.createSessionMutation.mutate(session2);

      await waitFor(() => {
        expect(mockSessionsService.createSession).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle invalid session type parameter', () => {
      const { result } = renderHook(() => useSessions('user123', 'invalid' as any), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockSessionsService.getSessionsByTrainer).not.toHaveBeenCalled();
      expect(mockSessionsService.getSessionsByStudent).not.toHaveBeenCalled();
    });
  });
});
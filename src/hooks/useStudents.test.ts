import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStudents } from './useStudents';
import React from 'react';

// Mock the container
const mockContainer = {
  get: vi.fn(),
};

vi.mock('../core/container/Container', () => ({
  container: mockContainer,
}));

const mockStudentsService = {
  getStudents: vi.fn(),
  addStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
};

describe('useStudents', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockContainer.get.mockReturnValue(mockStudentsService);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('getStudents', () => {
    it('should fetch students successfully', async () => {
      const mockStudents = [
        { id: '1', name: 'John Doe', email: 'john@test.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@test.com' },
      ];
      mockStudentsService.getStudents.mockResolvedValue(mockStudents);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockStudents);
      });

      expect(mockStudentsService.getStudents).toHaveBeenCalledWith('trainer123');
    });

    it('should handle fetch error gracefully', async () => {
      const error = new Error('Failed to fetch students');
      mockStudentsService.getStudents.mockRejectedValue(error);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('should show loading state initially', () => {
      mockStudentsService.getStudents.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should add student successfully', async () => {
      const newStudent = { name: 'New Student', email: 'new@test.com' };
      const createdStudent = { id: '3', ...newStudent };
      mockStudentsService.addStudent.mockResolvedValue(createdStudent);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.addStudentMutation).toBeDefined();
      });

      result.current.addStudentMutation.mutate(newStudent);

      await waitFor(() => {
        expect(mockStudentsService.addStudent).toHaveBeenCalledWith(newStudent);
      });
    });

    it('should update student successfully', async () => {
      const updatedStudent = { id: '1', name: 'Updated Name', email: 'updated@test.com' };
      mockStudentsService.updateStudent.mockResolvedValue(updatedStudent);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.updateStudentMutation).toBeDefined();
      });

      result.current.updateStudentMutation.mutate(updatedStudent);

      await waitFor(() => {
        expect(mockStudentsService.updateStudent).toHaveBeenCalledWith(updatedStudent);
      });
    });

    it('should delete student successfully', async () => {
      const studentId = '1';
      mockStudentsService.deleteStudent.mockResolvedValue(true);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.deleteStudentMutation).toBeDefined();
      });

      result.current.deleteStudentMutation.mutate(studentId);

      await waitFor(() => {
        expect(mockStudentsService.deleteStudent).toHaveBeenCalledWith(studentId);
      });
    });

    it('should handle mutation errors', async () => {
      const error = new Error('Failed to add student');
      mockStudentsService.addStudent.mockRejectedValue(error);

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.addStudentMutation).toBeDefined();
      });

      result.current.addStudentMutation.mutate({ name: 'Test', email: 'test@test.com' });

      await waitFor(() => {
        expect(result.current.addStudentMutation.error).toEqual(error);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty trainer ID', () => {
      const { result } = renderHook(() => useStudents(''), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockStudentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should handle null trainer ID', () => {
      const { result } = renderHook(() => useStudents(null as any), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(mockStudentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should invalidate cache after successful mutations', async () => {
      const newStudent = { name: 'Cache Test', email: 'cache@test.com' };
      mockStudentsService.addStudent.mockResolvedValue({ id: '4', ...newStudent });

      const { result } = renderHook(() => useStudents('trainer123'), { wrapper });

      await waitFor(() => {
        expect(result.current.addStudentMutation).toBeDefined();
      });

      result.current.addStudentMutation.mutate(newStudent);

      await waitFor(() => {
        expect(result.current.addStudentMutation.isSuccess).toBe(true);
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['students', 'trainer123'])?.isInvalidated).toBe(true);
    });
  });
});
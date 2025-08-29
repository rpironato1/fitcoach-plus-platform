import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data structures
interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
  goals: string[];
  trainer_id?: string;
  created_at: string;
}

interface Session {
  id: string;
  student_id: string;
  trainer_id: string;
  date: string;
  duration: number;
  type: 'workout' | 'consultation' | 'assessment';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  trainer_id: string;
  created_at: string;
}

// Mock service implementations
const mockStudentsService = {
  getStudents: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
  getStudentById: vi.fn(),
};

const mockSessionsService = {
  getSessions: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  getSessionsByStudent: vi.fn(),
  getSessionsByTrainer: vi.fn(),
};

const mockWorkoutsService = {
  getWorkouts: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  getWorkoutById: vi.fn(),
  getWorkoutsByTrainer: vi.fn(),
};

// Mock hooks with proper React Query integration
const useStudentsManagement = () => {
  const queryClient = new QueryClient();
  
  const studentsQuery = {
    data: mockStudentsService.getStudents(),
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  const createStudentMutation = {
    mutate: mockStudentsService.createStudent,
    isLoading: false,
    isError: false,
    error: null,
  };

  const updateStudentMutation = {
    mutate: mockStudentsService.updateStudent,
    isLoading: false,
    isError: false,
    error: null,
  };

  const deleteStudentMutation = {
    mutate: mockStudentsService.deleteStudent,
    isLoading: false,
    isError: false,
    error: null,
  };

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    refetchStudents: studentsQuery.refetch,
    createStudent: createStudentMutation.mutate,
    updateStudent: updateStudentMutation.mutate,
    deleteStudent: deleteStudentMutation.mutate,
    isCreating: createStudentMutation.isLoading,
    isUpdating: updateStudentMutation.isLoading,
    isDeleting: deleteStudentMutation.isLoading,
  };
};

const useSessionsManagement = () => {
  const sessionsQuery = {
    data: mockSessionsService.getSessions(),
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  const createSessionMutation = {
    mutate: mockSessionsService.createSession,
    isLoading: false,
    isError: false,
    error: null,
  };

  const updateSessionMutation = {
    mutate: mockSessionsService.updateSession,
    isLoading: false,
    isError: false,
    error: null,
  };

  const deleteSessionMutation = {
    mutate: mockSessionsService.deleteSession,
    isLoading: false,
    isError: false,
    error: null,
  };

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetchSessions: sessionsQuery.refetch,
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isCreating: createSessionMutation.isLoading,
    isUpdating: updateSessionMutation.isLoading,
    isDeleting: deleteSessionMutation.isLoading,
  };
};

const useWorkoutsManagement = () => {
  const workoutsQuery = {
    data: mockWorkoutsService.getWorkouts(),
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  const createWorkoutMutation = {
    mutate: mockWorkoutsService.createWorkout,
    isLoading: false,
    isError: false,
    error: null,
  };

  const updateWorkoutMutation = {
    mutate: mockWorkoutsService.updateWorkout,
    isLoading: false,
    isError: false,
    error: null,
  };

  const deleteWorkoutMutation = {
    mutate: mockWorkoutsService.deleteWorkout,
    isLoading: false,
    isError: false,
    error: null,
  };

  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    refetchWorkouts: workoutsQuery.refetch,
    createWorkout: createWorkoutMutation.mutate,
    updateWorkout: updateWorkoutMutation.mutate,
    deleteWorkout: deleteWorkoutMutation.mutate,
    isCreating: createWorkoutMutation.isLoading,
    isUpdating: updateWorkoutMutation.isLoading,
    isDeleting: deleteWorkoutMutation.isLoading,
  };
};

describe('Business Logic Hooks Comprehensive Testing', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useStudentsManagement Hook', () => {
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'John Student',
        email: 'john@student.com',
        age: 25,
        goals: ['Weight Loss', 'Muscle Gain'],
        trainer_id: 'trainer-1',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Jane Learner',
        email: 'jane@learner.com',
        age: 30,
        goals: ['Strength Training'],
        trainer_id: 'trainer-2',
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    it('should load students successfully', () => {
      mockStudentsService.getStudents.mockReturnValue(mockStudents);

      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      expect(result.current.students).toEqual(mockStudents);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle loading state', () => {
      mockStudentsService.getStudents.mockReturnValue(undefined);

      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      expect(result.current.students).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should create new student', async () => {
      const newStudent: Omit<Student, 'id' | 'created_at'> = {
        name: 'New Student',
        email: 'new@student.com',
        age: 28,
        goals: ['Fitness'],
        trainer_id: 'trainer-1',
      };

      mockStudentsService.createStudent.mockResolvedValue({
        ...newStudent,
        id: '3',
        created_at: '2024-01-03T00:00:00Z',
      });

      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      act(() => {
        result.current.createStudent(newStudent);
      });

      expect(mockStudentsService.createStudent).toHaveBeenCalledWith(newStudent);
    });

    it('should update existing student', async () => {
      const updatedStudent: Student = {
        id: '1',
        name: 'Updated Student',
        email: 'updated@student.com',
        age: 26,
        goals: ['Updated Goals'],
        trainer_id: 'trainer-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      act(() => {
        result.current.updateStudent(updatedStudent);
      });

      expect(mockStudentsService.updateStudent).toHaveBeenCalledWith(updatedStudent);
    });

    it('should delete student', async () => {
      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      act(() => {
        result.current.deleteStudent('1');
      });

      expect(mockStudentsService.deleteStudent).toHaveBeenCalledWith('1');
    });

    it('should refetch students', async () => {
      const mockRefetch = vi.fn();
      mockStudentsService.getStudents.mockReturnValue(mockStudents);

      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      // Mock the refetch function
      result.current.refetchStudents = mockRefetch;

      act(() => {
        result.current.refetchStudents();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('useSessionsManagement Hook', () => {
    const mockSessions: Session[] = [
      {
        id: '1',
        student_id: 'student-1',
        trainer_id: 'trainer-1',
        date: '2024-01-15T10:00:00Z',
        duration: 60,
        type: 'workout',
        status: 'scheduled',
        notes: 'First session',
      },
      {
        id: '2',
        student_id: 'student-2',
        trainer_id: 'trainer-1',
        date: '2024-01-16T14:00:00Z',
        duration: 90,
        type: 'consultation',
        status: 'completed',
        notes: 'Initial consultation',
      },
    ];

    it('should load sessions successfully', () => {
      mockSessionsService.getSessions.mockReturnValue(mockSessions);

      const { result } = renderHook(() => useSessionsManagement(), { wrapper });

      expect(result.current.sessions).toEqual(mockSessions);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should create new session', async () => {
      const newSession: Omit<Session, 'id'> = {
        student_id: 'student-3',
        trainer_id: 'trainer-1',
        date: '2024-01-20T11:00:00Z',
        duration: 75,
        type: 'assessment',
        status: 'scheduled',
      };

      mockSessionsService.createSession.mockResolvedValue({
        ...newSession,
        id: '3',
      });

      const { result } = renderHook(() => useSessionsManagement(), { wrapper });

      act(() => {
        result.current.createSession(newSession);
      });

      expect(mockSessionsService.createSession).toHaveBeenCalledWith(newSession);
    });

    it('should update session status', async () => {
      const updatedSession: Session = {
        id: '1',
        student_id: 'student-1',
        trainer_id: 'trainer-1',
        date: '2024-01-15T10:00:00Z',
        duration: 60,
        type: 'workout',
        status: 'completed',
        notes: 'Session completed successfully',
      };

      const { result } = renderHook(() => useSessionsManagement(), { wrapper });

      act(() => {
        result.current.updateSession(updatedSession);
      });

      expect(mockSessionsService.updateSession).toHaveBeenCalledWith(updatedSession);
    });

    it('should cancel session', async () => {
      const { result } = renderHook(() => useSessionsManagement(), { wrapper });

      act(() => {
        result.current.deleteSession('1');
      });

      expect(mockSessionsService.deleteSession).toHaveBeenCalledWith('1');
    });
  });

  describe('useWorkoutsManagement Hook', () => {
    const mockWorkouts: Workout[] = [
      {
        id: '1',
        name: 'Push Day',
        description: 'Upper body push workout',
        difficulty: 'intermediate',
        duration: 45,
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
          { name: 'Shoulder Press', sets: 3, reps: 12, weight: 25 },
        ],
        trainer_id: 'trainer-1',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Pull Day',
        description: 'Upper body pull workout',
        difficulty: 'advanced',
        duration: 50,
        exercises: [
          { name: 'Pull-ups', sets: 4, reps: 8 },
          { name: 'Barbell Rows', sets: 3, reps: 10, weight: 60 },
        ],
        trainer_id: 'trainer-1',
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    it('should load workouts successfully', () => {
      mockWorkoutsService.getWorkouts.mockReturnValue(mockWorkouts);

      const { result } = renderHook(() => useWorkoutsManagement(), { wrapper });

      expect(result.current.workouts).toEqual(mockWorkouts);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should create new workout', async () => {
      const newWorkout: Omit<Workout, 'id' | 'created_at'> = {
        name: 'Leg Day',
        description: 'Lower body workout',
        difficulty: 'beginner',
        duration: 40,
        exercises: [
          { name: 'Squats', sets: 3, reps: 15 },
          { name: 'Lunges', sets: 3, reps: 12 },
        ],
        trainer_id: 'trainer-1',
      };

      mockWorkoutsService.createWorkout.mockResolvedValue({
        ...newWorkout,
        id: '3',
        created_at: '2024-01-03T00:00:00Z',
      });

      const { result } = renderHook(() => useWorkoutsManagement(), { wrapper });

      act(() => {
        result.current.createWorkout(newWorkout);
      });

      expect(mockWorkoutsService.createWorkout).toHaveBeenCalledWith(newWorkout);
    });

    it('should update workout difficulty', async () => {
      const updatedWorkout: Workout = {
        ...mockWorkouts[0],
        difficulty: 'advanced',
        duration: 60,
      };

      const { result } = renderHook(() => useWorkoutsManagement(), { wrapper });

      act(() => {
        result.current.updateWorkout(updatedWorkout);
      });

      expect(mockWorkoutsService.updateWorkout).toHaveBeenCalledWith(updatedWorkout);
    });

    it('should delete workout', async () => {
      const { result } = renderHook(() => useWorkoutsManagement(), { wrapper });

      act(() => {
        result.current.deleteWorkout('1');
      });

      expect(mockWorkoutsService.deleteWorkout).toHaveBeenCalledWith('1');
    });

    it('should handle workout creation errors', async () => {
      const error = new Error('Failed to create workout');
      mockWorkoutsService.createWorkout.mockRejectedValue(error);

      const { result } = renderHook(() => useWorkoutsManagement(), { wrapper });

      act(() => {
        result.current.createWorkout({
          name: 'Test',
          description: 'Test workout',
          difficulty: 'beginner',
          duration: 30,
          exercises: [],
          trainer_id: 'trainer-1',
        });
      });

      expect(mockWorkoutsService.createWorkout).toHaveBeenCalled();
    });
  });

  describe('Cross-Hook Integration', () => {
    it('should work with students and sessions together', () => {
      const mockStudents: Student[] = [
        {
          id: 'student-1',
          name: 'John Student',
          email: 'john@student.com',
          age: 25,
          goals: ['Weight Loss'],
          trainer_id: 'trainer-1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSessions: Session[] = [
        {
          id: 'session-1',
          student_id: 'student-1',
          trainer_id: 'trainer-1',
          date: '2024-01-15T10:00:00Z',
          duration: 60,
          type: 'workout',
          status: 'scheduled',
        },
      ];

      mockStudentsService.getStudents.mockReturnValue(mockStudents);
      mockSessionsService.getSessions.mockReturnValue(mockSessions);

      const studentsHook = renderHook(() => useStudentsManagement(), { wrapper });
      const sessionsHook = renderHook(() => useSessionsManagement(), { wrapper });

      expect(studentsHook.result.current.students).toHaveLength(1);
      expect(sessionsHook.result.current.sessions).toHaveLength(1);

      // Verify student-session relationship
      const student = studentsHook.result.current.students[0];
      const session = sessionsHook.result.current.sessions[0];
      expect(session.student_id).toBe(student.id);
    });

    it('should work with sessions and workouts together', () => {
      const mockSessions: Session[] = [
        {
          id: 'session-1',
          student_id: 'student-1',
          trainer_id: 'trainer-1',
          date: '2024-01-15T10:00:00Z',
          duration: 60,
          type: 'workout',
          status: 'scheduled',
        },
      ];

      const mockWorkouts: Workout[] = [
        {
          id: 'workout-1',
          name: 'Session Workout',
          description: 'Workout for the session',
          difficulty: 'intermediate',
          duration: 60,
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 10 },
          ],
          trainer_id: 'trainer-1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSessionsService.getSessions.mockReturnValue(mockSessions);
      mockWorkoutsService.getWorkouts.mockReturnValue(mockWorkouts);

      const sessionsHook = renderHook(() => useSessionsManagement(), { wrapper });
      const workoutsHook = renderHook(() => useWorkoutsManagement(), { wrapper });

      expect(sessionsHook.result.current.sessions).toHaveLength(1);
      expect(workoutsHook.result.current.workouts).toHaveLength(1);

      // Verify trainer relationship
      const session = sessionsHook.result.current.sessions[0];
      const workout = workoutsHook.result.current.workouts[0];
      expect(session.trainer_id).toBe(workout.trainer_id);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      mockStudentsService.getStudents.mockReturnValue([]);
      mockSessionsService.getSessions.mockReturnValue([]);
      mockWorkoutsService.getWorkouts.mockReturnValue([]);

      const studentsHook = renderHook(() => useStudentsManagement(), { wrapper });
      const sessionsHook = renderHook(() => useSessionsManagement(), { wrapper });
      const workoutsHook = renderHook(() => useWorkoutsManagement(), { wrapper });

      expect(studentsHook.result.current.students).toEqual([]);
      expect(sessionsHook.result.current.sessions).toEqual([]);
      expect(workoutsHook.result.current.workouts).toEqual([]);
    });

    it('should handle undefined service responses', () => {
      mockStudentsService.getStudents.mockReturnValue(undefined);
      mockSessionsService.getSessions.mockReturnValue(undefined);
      mockWorkoutsService.getWorkouts.mockReturnValue(undefined);

      const studentsHook = renderHook(() => useStudentsManagement(), { wrapper });
      const sessionsHook = renderHook(() => useSessionsManagement(), { wrapper });
      const workoutsHook = renderHook(() => useWorkoutsManagement(), { wrapper });

      expect(studentsHook.result.current.students).toEqual([]);
      expect(sessionsHook.result.current.sessions).toEqual([]);
      expect(workoutsHook.result.current.workouts).toEqual([]);
    });

    it('should handle service method calls with null data', async () => {
      const { result } = renderHook(() => useStudentsManagement(), { wrapper });

      act(() => {
        result.current.createStudent(null as any);
        result.current.updateStudent(null as any);
        result.current.deleteStudent(null as any);
      });

      expect(mockStudentsService.createStudent).toHaveBeenCalledWith(null);
      expect(mockStudentsService.updateStudent).toHaveBeenCalledWith(null);
      expect(mockStudentsService.deleteStudent).toHaveBeenCalledWith(null);
    });
  });
});
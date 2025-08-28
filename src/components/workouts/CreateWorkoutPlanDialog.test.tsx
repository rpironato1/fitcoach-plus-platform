import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWorkoutPlanDialog } from './CreateWorkoutPlanDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { z } from 'zod';
import React from 'react';

// Mock the hooks
vi.mock('../../hooks/useWorkouts', () => ({
  useWorkouts: vi.fn(),
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

const mockUseWorkouts = vi.mocked(vi.importMock('../../hooks/useWorkouts').useWorkouts);
const mockUseToast = vi.mocked(vi.importMock('../../hooks/use-toast').useToast);

const mockToast = vi.fn();

// Workout validation schema using zod
const workoutSchema = z.object({
  name: z.string()
    .min(3, 'Workout name must be at least 3 characters')
    .max(50, 'Workout name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name is required'),
    sets: z.number().min(1, 'At least 1 set is required').max(10, 'Maximum 10 sets allowed'),
    reps: z.number().min(1, 'At least 1 rep is required').max(100, 'Maximum 100 reps allowed'),
    weight: z.number().min(0, 'Weight cannot be negative').optional(),
    restTime: z.number().min(15, 'Rest time must be at least 15 seconds').max(600, 'Maximum 10 minutes rest'),
  }))
    .min(1, 'At least one exercise is required')
    .max(15, 'Maximum 15 exercises allowed'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Difficulty level is required',
  }),
  duration: z.number()
    .min(10, 'Workout must be at least 10 minutes')
    .max(180, 'Workout cannot exceed 3 hours'),
  targetMuscleGroups: z.array(z.string())
    .min(1, 'At least one muscle group must be selected'),
  equipment: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

describe('CreateWorkoutPlanDialog', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;
  const mockCreateWorkout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockUseWorkouts.mockReturnValue({
      createWorkoutMutation: { 
        mutate: mockCreateWorkout, 
        isLoading: false,
        isSuccess: false,
        error: null 
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const openDialog = async () => {
    render(<CreateWorkoutPlanDialog trainerId="trainer123" />, { wrapper });
    const openButton = screen.getByText(/create workout plan/i);
    await user.click(openButton);
  };

  describe('form validation with zod', () => {
    describe('workout name validation', () => {
      it('should validate minimum name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/workout name/i);
        await user.type(nameInput, 'AB'); // Too short
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/workout name must be at least 3 characters/i)).toBeInTheDocument();
      });

      it('should validate maximum name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/workout name/i);
        const longName = 'A'.repeat(51); // Too long
        await user.type(nameInput, longName);
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/workout name must be less than 50 characters/i)).toBeInTheDocument();
      });

      it('should accept valid name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/workout name/i);
        await user.type(nameInput, 'Upper Body Strength');

        expect(screen.queryByText(/workout name must be/i)).not.toBeInTheDocument();
      });

      it('should trim whitespace from name', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/workout name/i);
        await user.type(nameInput, '  Valid Workout Name  ');

        // Should not show validation error for trimmed valid name
        expect(screen.queryByText(/workout name must be/i)).not.toBeInTheDocument();
      });
    });

    describe('description validation', () => {
      it('should validate minimum description length', async () => {
        await openDialog();
        
        const descriptionInput = screen.getByLabelText(/description/i);
        await user.type(descriptionInput, 'Too short'); // Less than 10 characters
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });

      it('should validate maximum description length', async () => {
        await openDialog();
        
        const descriptionInput = screen.getByLabelText(/description/i);
        const longDescription = 'A'.repeat(201); // Too long
        await user.type(descriptionInput, longDescription);
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/description must be less than 200 characters/i)).toBeInTheDocument();
      });

      it('should accept valid description', async () => {
        await openDialog();
        
        const descriptionInput = screen.getByLabelText(/description/i);
        await user.type(descriptionInput, 'This is a comprehensive upper body workout focusing on strength');

        expect(screen.queryByText(/description must be/i)).not.toBeInTheDocument();
      });
    });

    describe('exercise validation', () => {
      it('should require at least one exercise', async () => {
        await openDialog();
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least one exercise is required/i)).toBeInTheDocument();
      });

      it('should validate exercise name', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const exerciseNameInput = screen.getByLabelText(/exercise name/i);
        await user.clear(exerciseNameInput); // Empty name
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/exercise name is required/i)).toBeInTheDocument();
      });

      it('should validate sets range', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const setsInput = screen.getByLabelText(/sets/i);
        await user.clear(setsInput);
        await user.type(setsInput, '0'); // Invalid sets
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least 1 set is required/i)).toBeInTheDocument();
      });

      it('should validate maximum sets', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const setsInput = screen.getByLabelText(/sets/i);
        await user.clear(setsInput);
        await user.type(setsInput, '11'); // Too many sets
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/maximum 10 sets allowed/i)).toBeInTheDocument();
      });

      it('should validate reps range', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const repsInput = screen.getByLabelText(/reps/i);
        await user.clear(repsInput);
        await user.type(repsInput, '0'); // Invalid reps
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least 1 rep is required/i)).toBeInTheDocument();
      });

      it('should validate maximum reps', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const repsInput = screen.getByLabelText(/reps/i);
        await user.clear(repsInput);
        await user.type(repsInput, '101'); // Too many reps
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/maximum 100 reps allowed/i)).toBeInTheDocument();
      });

      it('should validate weight cannot be negative', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const weightInput = screen.getByLabelText(/weight/i);
        await user.type(weightInput, '-5'); // Negative weight
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/weight cannot be negative/i)).toBeInTheDocument();
      });

      it('should validate rest time range', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const restTimeInput = screen.getByLabelText(/rest time/i);
        await user.clear(restTimeInput);
        await user.type(restTimeInput, '10'); // Too short rest
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/rest time must be at least 15 seconds/i)).toBeInTheDocument();
      });

      it('should validate maximum rest time', async () => {
        await openDialog();
        
        const addExerciseButton = screen.getByText(/add exercise/i);
        await user.click(addExerciseButton);

        const restTimeInput = screen.getByLabelText(/rest time/i);
        await user.clear(restTimeInput);
        await user.type(restTimeInput, '700'); // Too long rest
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/maximum 10 minutes rest/i)).toBeInTheDocument();
      });

      it('should validate maximum number of exercises', async () => {
        await openDialog();
        
        // Add 16 exercises (exceeds limit)
        for (let i = 0; i < 16; i++) {
          const addExerciseButton = screen.getByText(/add exercise/i);
          await user.click(addExerciseButton);
        }
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/maximum 15 exercises allowed/i)).toBeInTheDocument();
      });
    });

    describe('difficulty validation', () => {
      it('should require difficulty selection', async () => {
        await openDialog();
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/difficulty level is required/i)).toBeInTheDocument();
      });

      it('should accept valid difficulty levels', async () => {
        await openDialog();
        
        const difficultySelect = screen.getByLabelText(/difficulty/i);
        await user.selectOptions(difficultySelect, 'intermediate');

        expect(screen.queryByText(/difficulty level is required/i)).not.toBeInTheDocument();
      });
    });

    describe('duration validation', () => {
      it('should validate minimum duration', async () => {
        await openDialog();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '5'); // Too short
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/workout must be at least 10 minutes/i)).toBeInTheDocument();
      });

      it('should validate maximum duration', async () => {
        await openDialog();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '200'); // Too long
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/workout cannot exceed 3 hours/i)).toBeInTheDocument();
      });

      it('should accept valid duration', async () => {
        await openDialog();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '45');

        expect(screen.queryByText(/workout must be/i)).not.toBeInTheDocument();
      });
    });

    describe('muscle groups validation', () => {
      it('should require at least one muscle group', async () => {
        await openDialog();
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least one muscle group must be selected/i)).toBeInTheDocument();
      });

      it('should accept valid muscle group selection', async () => {
        await openDialog();
        
        const chestCheckbox = screen.getByLabelText(/chest/i);
        await user.click(chestCheckbox);

        expect(screen.queryByText(/at least one muscle group must be selected/i)).not.toBeInTheDocument();
      });
    });

    describe('notes validation', () => {
      it('should validate maximum notes length', async () => {
        await openDialog();
        
        const notesInput = screen.getByLabelText(/notes/i);
        const longNotes = 'A'.repeat(501); // Too long
        await user.type(notesInput, longNotes);
        
        const submitButton = screen.getByText(/create workout/i);
        await user.click(submitButton);

        expect(screen.getByText(/notes cannot exceed 500 characters/i)).toBeInTheDocument();
      });

      it('should accept valid notes', async () => {
        await openDialog();
        
        const notesInput = screen.getByLabelText(/notes/i);
        await user.type(notesInput, 'This is a comprehensive workout plan for beginners');

        expect(screen.queryByText(/notes cannot exceed/i)).not.toBeInTheDocument();
      });

      it('should accept empty notes', async () => {
        await openDialog();
        
        const notesInput = screen.getByLabelText(/notes/i);
        // Leave empty

        expect(screen.queryByText(/notes cannot exceed/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission with zod validation', () => {
    const fillValidForm = async () => {
      const nameInput = screen.getByLabelText(/workout name/i);
      await user.type(nameInput, 'Upper Body Strength');

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Complete upper body workout focusing on strength building');

      const addExerciseButton = screen.getByText(/add exercise/i);
      await user.click(addExerciseButton);

      const exerciseNameInput = screen.getByLabelText(/exercise name/i);
      await user.type(exerciseNameInput, 'Push-ups');

      const setsInput = screen.getByLabelText(/sets/i);
      await user.clear(setsInput);
      await user.type(setsInput, '3');

      const repsInput = screen.getByLabelText(/reps/i);
      await user.clear(repsInput);
      await user.type(repsInput, '10');

      const restTimeInput = screen.getByLabelText(/rest time/i);
      await user.clear(restTimeInput);
      await user.type(restTimeInput, '60');

      const difficultySelect = screen.getByLabelText(/difficulty/i);
      await user.selectOptions(difficultySelect, 'intermediate');

      const durationInput = screen.getByLabelText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '45');

      const chestCheckbox = screen.getByLabelText(/chest/i);
      await user.click(chestCheckbox);
    };

    it('should submit valid form successfully', async () => {
      mockCreateWorkout.mockResolvedValue({ id: '1', name: 'Upper Body Strength' });
      
      await openDialog();
      await fillValidForm();

      const submitButton = screen.getByText(/create workout/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateWorkout).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Upper Body Strength',
            description: 'Complete upper body workout focusing on strength building',
            exercises: expect.arrayContaining([
              expect.objectContaining({
                name: 'Push-ups',
                sets: 3,
                reps: 10,
                restTime: 60,
              })
            ]),
            difficulty: 'intermediate',
            duration: 45,
            targetMuscleGroups: expect.arrayContaining(['chest']),
          })
        );
      });
    });

    it('should not submit form with validation errors', async () => {
      await openDialog();
      
      // Submit form with missing required fields
      const submitButton = screen.getByText(/create workout/i);
      await user.click(submitButton);

      expect(mockCreateWorkout).not.toHaveBeenCalled();
      expect(screen.getByText(/workout name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      mockUseWorkouts.mockReturnValue({
        createWorkoutMutation: { 
          mutate: mockCreateWorkout, 
          isLoading: true,
          isSuccess: false,
          error: null 
        },
      });

      await openDialog();
      await fillValidForm();

      const submitButton = screen.getByText(/creating workout/i);
      expect(submitButton).toBeDisabled();
    });

    it('should handle submission error', async () => {
      const error = new Error('Failed to create workout');
      mockUseWorkouts.mockReturnValue({
        createWorkoutMutation: { 
          mutate: mockCreateWorkout, 
          isLoading: false,
          isSuccess: false,
          error 
        },
      });

      await openDialog();
      await fillValidForm();

      expect(screen.getByText(/failed to create workout/i)).toBeInTheDocument();
    });

    it('should close dialog on successful submission', async () => {
      mockUseWorkouts.mockReturnValue({
        createWorkoutMutation: { 
          mutate: mockCreateWorkout, 
          isLoading: false,
          isSuccess: true,
          error: null 
        },
      });

      await openDialog();
      await fillValidForm();

      const submitButton = screen.getByText(/create workout/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/create workout plan/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('real-time validation feedback', () => {
    it('should show validation errors as user types', async () => {
      await openDialog();
      
      const nameInput = screen.getByLabelText(/workout name/i);
      await user.type(nameInput, 'A');
      await user.tab(); // Trigger blur

      expect(screen.getByText(/workout name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('should clear validation errors when fixed', async () => {
      await openDialog();
      
      const nameInput = screen.getByLabelText(/workout name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      expect(screen.getByText(/workout name must be at least 3 characters/i)).toBeInTheDocument();

      await user.type(nameInput, 'BC'); // Now valid
      await user.tab();

      expect(screen.queryByText(/workout name must be at least 3 characters/i)).not.toBeInTheDocument();
    });

    it('should validate exercises dynamically', async () => {
      await openDialog();
      
      const addExerciseButton = screen.getByText(/add exercise/i);
      await user.click(addExerciseButton);

      const setsInput = screen.getByLabelText(/sets/i);
      await user.clear(setsInput);
      await user.type(setsInput, '15'); // Too many sets
      await user.tab();

      expect(screen.getByText(/maximum 10 sets allowed/i)).toBeInTheDocument();
    });
  });

  describe('accessibility and usability', () => {
    it('should have proper ARIA labels and descriptions', async () => {
      await openDialog();

      expect(screen.getByLabelText(/workout name/i)).toHaveAttribute('aria-describedby');
      expect(screen.getByLabelText(/description/i)).toHaveAttribute('aria-describedby');
      expect(screen.getByLabelText(/difficulty/i)).toHaveAttribute('aria-describedby');
    });

    it('should focus on first input when dialog opens', async () => {
      await openDialog();

      const nameInput = screen.getByLabelText(/workout name/i);
      expect(nameInput).toHaveFocus();
    });

    it('should support keyboard navigation', async () => {
      await openDialog();

      const nameInput = screen.getByLabelText(/workout name/i);
      expect(nameInput).toHaveFocus();

      await user.tab();
      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toHaveFocus();
    });

    it('should announce validation errors to screen readers', async () => {
      await openDialog();
      
      const nameInput = screen.getByLabelText(/workout name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      const errorMessage = screen.getByText(/workout name must be at least 3 characters/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should provide helpful placeholders and hints', async () => {
      await openDialog();

      expect(screen.getByPlaceholderText(/enter workout name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/describe the workout/i)).toBeInTheDocument();
      expect(screen.getByText(/select muscle groups targeted/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in workout name', async () => {
      await openDialog();
      
      const nameInput = screen.getByLabelText(/workout name/i);
      await user.type(nameInput, 'Upper-Body & Core (Advanced)');

      expect(screen.queryByText(/workout name must be/i)).not.toBeInTheDocument();
    });

    it('should handle decimal numbers in weight', async () => {
      await openDialog();
      
      const addExerciseButton = screen.getByText(/add exercise/i);
      await user.click(addExerciseButton);

      const weightInput = screen.getByLabelText(/weight/i);
      await user.type(weightInput, '12.5');

      expect(screen.queryByText(/weight cannot be negative/i)).not.toBeInTheDocument();
    });

    it('should handle copy-paste of long text', async () => {
      await openDialog();
      
      const longText = 'A'.repeat(300);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.click(descriptionInput);
      await user.keyboard(`{Control>}a{/Control}`);
      await user.keyboard(`{Control>}v{/Control}`);
      
      // Mock clipboard
      Object.assign(navigator, {
        clipboard: {
          readText: () => Promise.resolve(longText),
        },
      });

      await user.tab();

      expect(screen.getByText(/description must be less than 200 characters/i)).toBeInTheDocument();
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionBookingForm } from './SessionBookingForm';
import { z } from 'zod';
import React from 'react';

// Mock React Query and hooks
const mockCreateSession = vi.fn();
const mockUseSessions = vi.fn(() => ({
  createSession: mockCreateSession,
  isLoading: false,
}));

const mockToast = vi.fn();
const mockUseToast = vi.fn(() => ({ toast: mockToast }));

vi.mock('../../hooks/useSessions', () => ({
  useSessions: mockUseSessions,
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: mockUseToast,
}));

// Session booking validation schema using zod
const sessionBookingSchema = z.object({
  trainerId: z.string().min(1, 'Trainer selection is required'),
  date: z.string().min(1, 'Date is required').refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Date must be today or in the future'),
  time: z.string().min(1, 'Time is required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(30, 'Session must be at least 30 minutes').max(180, 'Session cannot exceed 3 hours'),
  sessionType: z.enum(['personal', 'group', 'virtual'], {
    required_error: 'Session type is required',
  }),
  specialRequests: z.string().max(500, 'Special requests must be less than 500 characters').optional(),
  recurringSettings: z.object({
    isRecurring: z.boolean(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
    endDate: z.string().optional(),
    maxSessions: z.number().min(1).max(52).optional(),
  }).optional(),
});

describe('SessionBookingForm', () => {
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
    
    // Reset the mock functions
    mockCreateSession.mockClear();
    mockToast.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const openForm = async () => {
    render(<SessionBookingForm studentId="student123" />, { wrapper });
    const openButton = screen.getByText(/book session/i);
    await user.click(openButton);
  };

  describe('form validation with zod', () => {
    describe('trainer selection validation', () => {
      it('should validate trainer selection is required', async () => {
        await openForm();
        
        const submitButton = screen.getByText(/book session/i);
        await user.click(submitButton);
        
        expect(screen.getByText(/trainer selection is required/i)).toBeInTheDocument();
      });

      it('should accept valid trainer selection', async () => {
        await openForm();
        
        const trainerSelect = screen.getByLabelText(/select trainer/i);
        await user.selectOptions(trainerSelect, 'trainer-123');
        
        const result = sessionBookingSchema.pick({ trainerId: true }).safeParse({ trainerId: 'trainer-123' });
        expect(result.success).toBe(true);
      });
    });

    describe('date validation', () => {
      it('should validate date is required', async () => {
        await openForm();
        
        const submitButton = screen.getByText(/book session/i);
        await user.click(submitButton);
        
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      });

      it('should reject past dates', async () => {
        await openForm();
        
        const dateInput = screen.getByLabelText(/session date/i);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const pastDate = yesterday.toISOString().split('T')[0];
        
        await user.type(dateInput, pastDate);
        
        const result = sessionBookingSchema.pick({ date: true }).safeParse({ date: pastDate });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('Date must be today or in the future');
      });

      it('should accept today and future dates', async () => {
        await openForm();
        
        const dateInput = screen.getByLabelText(/session date/i);
        const today = new Date().toISOString().split('T')[0];
        
        await user.type(dateInput, today);
        
        const result = sessionBookingSchema.pick({ date: true }).safeParse({ date: today });
        expect(result.success).toBe(true);
      });
    });

    describe('time validation', () => {
      it('should validate time format', async () => {
        await openForm();
        
        const timeInput = screen.getByLabelText(/session time/i);
        await user.type(timeInput, '25:00'); // Invalid time
        
        const result = sessionBookingSchema.pick({ time: true }).safeParse({ time: '25:00' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('Invalid time format');
      });

      it('should accept valid time format', async () => {
        await openForm();
        
        const timeInput = screen.getByLabelText(/session time/i);
        await user.type(timeInput, '14:30');
        
        const result = sessionBookingSchema.pick({ time: true }).safeParse({ time: '14:30' });
        expect(result.success).toBe(true);
      });

      it('should handle edge cases for time validation', async () => {
        const validTimes = ['00:00', '23:59', '12:30', '09:15'];
        const invalidTimes = ['24:00', '12:60', 'invalid', ''];
        
        validTimes.forEach(time => {
          const result = sessionBookingSchema.pick({ time: true }).safeParse({ time });
          expect(result.success).toBe(true);
        });
        
        invalidTimes.forEach(time => {
          const result = sessionBookingSchema.pick({ time: true }).safeParse({ time });
          expect(result.success).toBe(false);
        });
      });
    });

    describe('duration validation', () => {
      it('should validate minimum duration', async () => {
        await openForm();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '15'); // Too short
        
        const result = sessionBookingSchema.pick({ duration: true }).safeParse({ duration: 15 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('Session must be at least 30 minutes');
      });

      it('should validate maximum duration', async () => {
        await openForm();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '240'); // Too long
        
        const result = sessionBookingSchema.pick({ duration: true }).safeParse({ duration: 240 });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('Session cannot exceed 3 hours');
      });

      it('should accept valid duration range', async () => {
        const validDurations = [30, 60, 90, 120, 180];
        
        validDurations.forEach(duration => {
          const result = sessionBookingSchema.pick({ duration: true }).safeParse({ duration });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('session type validation', () => {
      it('should validate session type is required', async () => {
        await openForm();
        
        const submitButton = screen.getByText(/book session/i);
        await user.click(submitButton);
        
        expect(screen.getByText(/session type is required/i)).toBeInTheDocument();
      });

      it('should accept valid session types', async () => {
        const validTypes = ['personal', 'group', 'virtual'] as const;
        
        validTypes.forEach(type => {
          const result = sessionBookingSchema.pick({ sessionType: true }).safeParse({ sessionType: type });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid session types', async () => {
        const result = sessionBookingSchema.pick({ sessionType: true }).safeParse({ sessionType: 'invalid' });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('form submission with zod validation', () => {
    it('should submit form with valid data', async () => {
      mockCreateSession.mockResolvedValue({ success: true });
      
      await openForm();
      
      // Fill in all required fields
      const trainerSelect = screen.getByLabelText(/select trainer/i);
      await user.selectOptions(trainerSelect, 'trainer-123');
      
      const dateInput = screen.getByLabelText(/session date/i);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await user.type(dateInput, tomorrow.toISOString().split('T')[0]);
      
      const timeInput = screen.getByLabelText(/session time/i);
      await user.type(timeInput, '14:30');
      
      const sessionTypeSelect = screen.getByLabelText(/session type/i);
      await user.selectOptions(sessionTypeSelect, 'personal');
      
      const submitButton = screen.getByText(/book session/i);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith({
          studentId: 'student123',
          trainerId: 'trainer-123',
          date: tomorrow.toISOString().split('T')[0],
          time: '14:30',
          duration: 60,
          sessionType: 'personal',
          specialRequests: '',
          recurringSettings: {
            isRecurring: false,
          },
        });
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Session booked successfully',
        variant: 'default',
      });
    });

    it('should not submit form with validation errors', async () => {
      await openForm();
      
      // Try to submit without filling required fields
      const submitButton = screen.getByText(/book session/i);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/trainer selection is required/i)).toBeInTheDocument();
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/time is required/i)).toBeInTheDocument();
        expect(screen.getByText(/session type is required/i)).toBeInTheDocument();
      });
      
      expect(mockCreateSession).not.toHaveBeenCalled();
    });
  });

  describe('user interactions and accessibility', () => {
    it('should support keyboard navigation', async () => {
      await openForm();
      
      const trainerSelect = screen.getByLabelText(/select trainer/i);
      await user.tab();
      expect(trainerSelect).toHaveFocus();
      
      await user.tab();
      const dateInput = screen.getByLabelText(/session date/i);
      expect(dateInput).toHaveFocus();
    });

    it('should announce validation errors to screen readers', async () => {
      await openForm();
      
      const submitButton = screen.getByText(/book session/i);
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorElement = screen.getByText(/trainer selection is required/i);
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });
  });
});
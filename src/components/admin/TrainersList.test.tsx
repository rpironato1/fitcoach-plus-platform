import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrainersList } from './TrainersList';
import React from 'react';

// Mock React Query and hooks
const mockGetTrainers = vi.fn();
const mockUpdateTrainer = vi.fn();
const mockDeleteTrainer = vi.fn();

const mockUseTrainersManagement = vi.fn(() => ({
  trainers: [],
  isLoading: false,
  error: null,
  updateTrainer: mockUpdateTrainer,
  deleteTrainer: mockDeleteTrainer,
}));

const mockToast = vi.fn();
const mockUseToast = vi.fn(() => ({ toast: mockToast }));

vi.mock('../../hooks/useTrainersManagement', () => ({
  useTrainersManagement: mockUseTrainersManagement,
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: mockUseToast,
}));

describe('TrainersList', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    // Reset the mock functions
    mockGetTrainers.mockClear();
    mockUpdateTrainer.mockClear();
    mockDeleteTrainer.mockClear();
    mockToast.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockTrainers = [
    {
      id: '1',
      name: 'John Trainer',
      email: 'john@trainer.com',
      specializations: ['Strength Training', 'Weight Loss'],
      experience: 5,
      rating: 4.8,
      studentsCount: 25,
      isActive: true,
      certifications: ['NASM-CPT', 'ACSM-CPT'],
      bio: 'Experienced trainer specializing in strength and conditioning'
    },
    {
      id: '2',
      name: 'Sarah Fitness',
      email: 'sarah@fitness.com',
      specializations: ['Yoga', 'Pilates', 'Flexibility'],
      experience: 8,
      rating: 4.9,
      studentsCount: 40,
      isActive: true,
      certifications: ['RYT-500', 'PMA-CPT'],
      bio: 'Certified yoga instructor with focus on mindful movement'
    },
    {
      id: '3',
      name: 'Mike Power',
      email: 'mike@power.com',
      specializations: ['Powerlifting', 'Bodybuilding'],
      experience: 10,
      rating: 4.7,
      studentsCount: 30,
      isActive: false,
      certifications: ['NSCA-CSCS'],
      bio: 'Former competitive powerlifter turned trainer'
    },
  ];

  describe('rendering', () => {
    it('should render trainers list successfully', () => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByText('John Trainer')).toBeInTheDocument();
      expect(screen.getByText('Sarah Fitness')).toBeInTheDocument();
      expect(screen.getByText('Mike Power')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: [],
        isLoading: true,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error state', () => {
      const error = new Error('Failed to load trainers');
      mockUseTrainersManagement.mockReturnValue({
        trainers: [],
        isLoading: false,
        error,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByText(/failed to load trainers/i)).toBeInTheDocument();
    });

    it('should show empty state when no trainers', () => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: [],
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByText(/no trainers found/i)).toBeInTheDocument();
    });
  });

  describe('trainer information display', () => {
    beforeEach(() => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });
    });

    it('should display trainer basic information', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByText('john@trainer.com')).toBeInTheDocument();
      expect(screen.getByText('5 years experience')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('25 students')).toBeInTheDocument();
    });

    it('should display trainer specializations', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByText('Strength Training')).toBeInTheDocument();
      expect(screen.getByText('Weight Loss')).toBeInTheDocument();
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('Pilates')).toBeInTheDocument();
    });

    it('should display trainer certifications', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByText('NASM-CPT')).toBeInTheDocument();
      expect(screen.getByText('ACSM-CPT')).toBeInTheDocument();
      expect(screen.getByText('RYT-500')).toBeInTheDocument();
    });

    it('should show active/inactive status', () => {
      render(<TrainersList />, { wrapper });

      const activeStatus = screen.getAllByText(/active/i);
      const inactiveStatus = screen.getAllByText(/inactive/i);
      
      expect(activeStatus.length).toBeGreaterThan(0);
      expect(inactiveStatus.length).toBeGreaterThan(0);
    });

    it('should display trainer bio when available', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByText(/experienced trainer specializing in strength/i)).toBeInTheDocument();
      expect(screen.getByText(/certified yoga instructor/i)).toBeInTheDocument();
    });
  });

  describe('filtering and sorting', () => {
    beforeEach(() => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });
    });

    it('should filter trainers by name', async () => {
      render(<TrainersList />, { wrapper });

      const searchInput = screen.getByPlaceholderText(/search trainers/i);
      await user.type(searchInput, 'John');

      expect(screen.getByText('John Trainer')).toBeInTheDocument();
      expect(screen.queryByText('Sarah Fitness')).not.toBeInTheDocument();
    });

    it('should filter trainers by specialization', async () => {
      render(<TrainersList />, { wrapper });

      const specializationFilter = screen.getByLabelText(/specialization/i);
      await user.selectOptions(specializationFilter, 'Yoga');

      expect(screen.getByText('Sarah Fitness')).toBeInTheDocument();
      expect(screen.queryByText('John Trainer')).not.toBeInTheDocument();
    });

    it('should filter trainers by status', async () => {
      render(<TrainersList />, { wrapper });

      const statusFilter = screen.getByLabelText(/status/i);
      await user.selectOptions(statusFilter, 'inactive');

      expect(screen.getByText('Mike Power')).toBeInTheDocument();
      expect(screen.queryByText('John Trainer')).not.toBeInTheDocument();
      expect(screen.queryByText('Sarah Fitness')).not.toBeInTheDocument();
    });

    it('should sort trainers by experience', async () => {
      render(<TrainersList />, { wrapper });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'experience');

      const trainerCards = screen.getAllByTestId('trainer-card');
      expect(trainerCards[0]).toHaveTextContent('Mike Power'); // 10 years
      expect(trainerCards[1]).toHaveTextContent('Sarah Fitness'); // 8 years
      expect(trainerCards[2]).toHaveTextContent('John Trainer'); // 5 years
    });

    it('should sort trainers by rating', async () => {
      render(<TrainersList />, { wrapper });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'rating');

      const trainerCards = screen.getAllByTestId('trainer-card');
      expect(trainerCards[0]).toHaveTextContent('Sarah Fitness'); // 4.9
      expect(trainerCards[1]).toHaveTextContent('John Trainer'); // 4.8
      expect(trainerCards[2]).toHaveTextContent('Mike Power'); // 4.7
    });

    it('should clear filters', async () => {
      render(<TrainersList />, { wrapper });

      const searchInput = screen.getByPlaceholderText(/search trainers/i);
      await user.type(searchInput, 'John');

      expect(screen.getByText('John Trainer')).toBeInTheDocument();
      expect(screen.queryByText('Sarah Fitness')).not.toBeInTheDocument();

      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      expect(screen.getByText('John Trainer')).toBeInTheDocument();
      expect(screen.getByText('Sarah Fitness')).toBeInTheDocument();
    });
  });

  describe('trainer actions', () => {
    const mockDeleteMutation = vi.fn();
    const mockUpdateMutation = vi.fn();

    beforeEach(() => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: mockDeleteMutation, isLoading: false },
        updateTrainerMutation: { mutate: mockUpdateMutation, isLoading: false },
      });
    });

    it('should handle trainer deletion', async () => {
      render(<TrainersList />, { wrapper });

      const deleteButtons = screen.getAllByText(/delete/i);
      await user.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByText(/confirm/i);
      await user.click(confirmButton);

      expect(mockDeleteMutation).toHaveBeenCalledWith('1');
    });

    it('should handle trainer status toggle', async () => {
      render(<TrainersList />, { wrapper });

      const statusToggle = screen.getByTestId('status-toggle-1');
      await user.click(statusToggle);

      expect(mockUpdateMutation).toHaveBeenCalledWith({
        id: '1',
        isActive: false
      });
    });

    it('should open trainer edit modal', async () => {
      render(<TrainersList />, { wrapper });

      const editButtons = screen.getAllByText(/edit/i);
      await user.click(editButtons[0]);

      expect(screen.getByText(/edit trainer/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Trainer')).toBeInTheDocument();
    });

    it('should handle trainer profile view', async () => {
      render(<TrainersList />, { wrapper });

      const viewButtons = screen.getAllByText(/view profile/i);
      await user.click(viewButtons[0]);

      expect(screen.getByText(/trainer profile/i)).toBeInTheDocument();
      expect(screen.getByText('John Trainer')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });
    });

    it('should have proper ARIA labels', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByLabelText(/search trainers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialization filter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status filter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort options/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<TrainersList />, { wrapper });

      const searchInput = screen.getByPlaceholderText(/search trainers/i);
      await user.tab();
      expect(searchInput).toHaveFocus();

      await user.tab();
      const specializationFilter = screen.getByLabelText(/specialization/i);
      expect(specializationFilter).toHaveFocus();
    });

    it('should have proper heading structure', () => {
      render(<TrainersList />, { wrapper });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/trainers/i);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3); // One for each trainer
    });

    it('should announce loading states to screen readers', () => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: [],
        isLoading: true,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByRole('status')).toHaveTextContent(/loading trainers/i);
    });
  });

  describe('error handling', () => {
    it('should handle delete mutation error', async () => {
      const mockDeleteMutation = vi.fn().mockRejectedValue(new Error('Delete failed'));
      
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: mockDeleteMutation, isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      const deleteButtons = screen.getAllByText(/delete/i);
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByText(/confirm/i);
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to delete trainer',
          variant: 'destructive',
        });
      });
    });

    it('should handle update mutation error', async () => {
      const mockUpdateMutation = vi.fn().mockRejectedValue(new Error('Update failed'));
      
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: mockUpdateMutation, isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      const statusToggle = screen.getByTestId('status-toggle-1');
      await user.click(statusToggle);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to update trainer status',
          variant: 'destructive',
        });
      });
    });

    it('should handle network errors gracefully', () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      
      mockUseTrainersManagement.mockReturnValue({
        trainers: [],
        isLoading: false,
        error: networkError,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      mockUseTrainersManagement.mockReturnValue({
        trainers: mockTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });
    });

    it('should adapt to mobile view', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<TrainersList />, { wrapper });

      expect(screen.getByTestId('mobile-trainer-list')).toBeInTheDocument();
    });

    it('should show desktop layout on larger screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<TrainersList />, { wrapper });

      expect(screen.getByTestId('desktop-trainer-grid')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should virtualize large lists', () => {
      const manyTrainers = Array.from({ length: 100 }, (_, i) => ({
        ...mockTrainers[0],
        id: `trainer-${i}`,
        name: `Trainer ${i}`,
      }));

      mockUseTrainersManagement.mockReturnValue({
        trainers: manyTrainers,
        isLoading: false,
        error: null,
        deleteTrainerMutation: { mutate: vi.fn(), isLoading: false },
        updateTrainerMutation: { mutate: vi.fn(), isLoading: false },
      });

      render(<TrainersList />, { wrapper });

      // Should only render visible items
      const visibleTrainers = screen.getAllByTestId('trainer-card');
      expect(visibleTrainers.length).toBeLessThan(100);
    });

    it('should debounce search input', async () => {
      render(<TrainersList />, { wrapper });

      const searchInput = screen.getByPlaceholderText(/search trainers/i);
      
      await user.type(searchInput, 'J');
      await user.type(searchInput, 'o');
      await user.type(searchInput, 'h');
      await user.type(searchInput, 'n');

      // Search should be debounced and not execute on every keystroke
      await waitFor(() => {
        expect(screen.getByText('John Trainer')).toBeInTheDocument();
      }, { timeout: 600 }); // Wait for debounce
    });
  });
});
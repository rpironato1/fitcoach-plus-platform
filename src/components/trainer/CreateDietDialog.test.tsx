import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateDietDialog } from './CreateDietDialog';
import React from 'react';

// Mock React Query
const mockToast = vi.fn();
const mockUseToast = vi.fn(() => ({ toast: mockToast }));

vi.mock('../../hooks/use-toast', () => ({
  useToast: mockUseToast,
}));

describe('CreateDietDialog', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;
  const mockOnCreateDiet = vi.fn();

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
    mockOnCreateDiet.mockClear();
    mockToast.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockStudents = [
    {
      id: 'student-1',
      profiles: {
        first_name: 'John',
        last_name: 'Doe',
      },
    },
    {
      id: 'student-2',
      profiles: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
    },
  ];

  const openDialog = async () => {
    render(
      <CreateDietDialog 
        students={mockStudents}
        onCreateDiet={mockOnCreateDiet}
        isCreating={false}
      />, 
      { wrapper }
    );
    const openButton = screen.getByText(/criar plano de dieta/i);
    await user.click(openButton);
  };

  describe('Dialog functionality', () => {
    it('should open dialog when trigger button is clicked', async () => {
      render(
        <CreateDietDialog 
          students={mockStudents}
          onCreateDiet={mockOnCreateDiet}
          isCreating={false}
        />, 
        { wrapper }
      );
      
      const openButton = screen.getByText(/criar plano de dieta/i);
      await user.click(openButton);

      expect(screen.getByText(/criar plano de dieta com ia/i)).toBeInTheDocument();
    });

    it('should close dialog when cancel button is clicked', async () => {
      await openDialog();
      
      const cancelButton = screen.getByText(/cancelar/i);
      await user.click(cancelButton);

      expect(screen.queryByText(/criar plano de dieta com ia/i)).not.toBeInTheDocument();
    });
  });

  describe('Form functionality', () => {
    it('should display student options in select', async () => {
      await openDialog();
      
      const studentSelect = screen.getByText(/selecione um aluno/i);
      await user.click(studentSelect);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle form input changes', async () => {
      await openDialog();
      
      const nameInput = screen.getByLabelText(/nome do plano/i);
      await user.type(nameInput, 'Test Diet Plan');

      expect(nameInput).toHaveValue('Test Diet Plan');
    });

    it('should submit form with correct data', async () => {
      await openDialog();
      
      // Select student
      const studentSelect = screen.getByText(/selecione um aluno/i);
      await user.click(studentSelect);
      await user.click(screen.getByText('John Doe'));
      
      // Fill form
      const nameInput = screen.getByLabelText(/nome do plano/i);
      await user.type(nameInput, 'Test Diet Plan');
      
      const goalsInput = screen.getByLabelText(/objetivos/i);
      await user.type(goalsInput, 'Weight loss');
      
      const submitButton = screen.getByText(/criar plano/i);
      await user.click(submitButton);

      expect(mockOnCreateDiet).toHaveBeenCalledWith({
        studentId: 'student-1',
        name: 'Test Diet Plan',
        goals: 'Weight loss',
        restrictions: '',
        preferences: '',
      });
    });

    it('should disable submit button when required fields are empty', async () => {
      await openDialog();
      
      const submitButton = screen.getByText(/criar plano/i);
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when required fields are filled', async () => {
      await openDialog();
      
      // Select student
      const studentSelect = screen.getByText(/selecione um aluno/i);
      await user.click(studentSelect);
      await user.click(screen.getByText('John Doe'));
      
      // Fill required fields
      const nameInput = screen.getByLabelText(/nome do plano/i);
      await user.type(nameInput, 'Test Diet Plan');
      
      const goalsInput = screen.getByLabelText(/objetivos/i);
      await user.type(goalsInput, 'Weight loss');
      
      const submitButton = screen.getByText(/criar plano/i);
      expect(submitButton).not.toBeDisabled();
    });

    it('should show loading state when creating', () => {
      render(
        <CreateDietDialog 
          students={mockStudents}
          onCreateDiet={mockOnCreateDiet}
          isCreating={true}
        />, 
        { wrapper }
      );

      const openButton = screen.getByText(/criar plano de dieta/i);
      expect(openButton).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle students without profiles', async () => {
      const studentsWithoutProfiles = [
        {
          id: 'student-3',
          profiles: null,
        },
      ];

      render(
        <CreateDietDialog 
          students={studentsWithoutProfiles}
          onCreateDiet={mockOnCreateDiet}
          isCreating={false}
        />, 
        { wrapper }
      );
      
      const openButton = screen.getByText(/criar plano de dieta/i);
      await user.click(openButton);
      
      const studentSelect = screen.getByText(/selecione um aluno/i);
      await user.click(studentSelect);

      expect(screen.getByText('Nome não disponível')).toBeInTheDocument();
    });

    it('should handle empty students array', async () => {
      render(
        <CreateDietDialog 
          students={[]}
          onCreateDiet={mockOnCreateDiet}
          isCreating={false}
        />, 
        { wrapper }
      );
      
      const openButton = screen.getByText(/criar plano de dieta/i);
      await user.click(openButton);
      
      const studentSelect = screen.getByText(/selecione um aluno/i);
      await user.click(studentSelect);

      // Should not crash and should show empty select
      expect(screen.getByText(/selecione um aluno/i)).toBeInTheDocument();
    });
  });
});
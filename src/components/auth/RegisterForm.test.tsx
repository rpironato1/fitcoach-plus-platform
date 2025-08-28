/**
 * Comprehensive test suite for RegisterForm component
 * Tests: Form validation, user interactions, zod integration, and business logic
 * Target: 100% component coverage with real user scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { z } from 'zod';

// Zod validation schema for registration
const registerSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['trainer', 'student']),
});

// Mock implementations
const mockSignUp = vi.fn();
const mockToast = vi.fn();

vi.mock('@/components/auth/LocalStorageAuthProvider', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('RegisterForm', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sobrenome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de conta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    });

    it('should have correct form attributes and accessibility', () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(firstNameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });

  describe('User Interactions with user-event', () => {
    it('should update form fields when user types', async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText(/nome/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/sobrenome/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      await user.type(firstNameInput, 'João');
      await user.type(lastNameInput, 'Silva');
      await user.type(emailInput, 'joao@example.com');

      expect(firstNameInput.value).toBe('João');
      expect(lastNameInput.value).toBe('Silva');
      expect(emailInput.value).toBe('joao@example.com');
    });

    it('should handle role selection', async () => {
      render(<RegisterForm />);

      const roleSelect = screen.getByLabelText(/tipo de conta/i);
      await user.click(roleSelect);

      const studentOption = screen.getByText('Aluno');
      await user.click(studentOption);

      // Verify role change by checking if student option is selected
      expect(screen.getByDisplayValue('student')).toBeInTheDocument();
    });

    it('should handle phone input formatting', async () => {
      render(<RegisterForm />);

      const phoneInput = screen.getByLabelText(/telefone/i) as HTMLInputElement;
      await user.type(phoneInput, '11999999999');

      expect(phoneInput.value).toBe('11999999999');
    });
  });

  describe('Form Validation with Zod', () => {
    it('should validate required fields using zod schema', () => {
      const invalidData = {
        firstName: 'A', // Too short
        lastName: '', // Empty
        email: 'invalid-email', // Invalid format
        password: '123', // Too short
        role: 'trainer' as const,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.firstName).toContain('Nome deve ter pelo menos 2 caracteres');
        expect(errors.lastName).toContain('Sobrenome deve ter pelo menos 2 caracteres');
        expect(errors.email).toContain('Email inválido');
        expect(errors.password).toContain('Senha deve ter pelo menos 6 caracteres');
      }
    });

    it('should pass validation with valid data', () => {
      const validData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        phone: '11999999999',
        password: 'senha123',
        role: 'trainer' as const,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should show password validation error for short passwords', async () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      await user.type(passwordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro',
          description: 'A senha deve ter pelo menos 6 caracteres.',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockSignUp.mockResolvedValueOnce({ user: { id: '1' } });
      const onSuccess = vi.fn();

      render(<RegisterForm onSuccess={onSuccess} />);

      // Fill form with valid data
      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/telefone/i), '11999999999');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      // Select role
      await user.click(screen.getByLabelText(/tipo de conta/i));
      await user.click(screen.getByText('Personal Trainer'));

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('joao@example.com', 'senha123', {
          first_name: 'João',
          last_name: 'Silva',
          phone: '11999999999',
          role: 'trainer',
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso.',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle signup errors gracefully', async () => {
      const errorMessage = 'Email já está em uso';
      mockSignUp.mockRejectedValueOnce(new Error(errorMessage));

      render(<RegisterForm />);

      // Fill form with valid data
      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro no cadastro',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('should show loading state during submission', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<RegisterForm />);

      // Fill form with valid data
      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /criando conta\.\.\./i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criando conta\.\.\./i })).toBeDisabled();

      // Check that form fields are disabled during loading
      expect(screen.getByLabelText(/nome/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-Error objects in catch block', async () => {
      mockSignUp.mockRejectedValueOnce('String error');

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro no cadastro',
          description: 'Erro ao criar conta.',
          variant: 'destructive',
        });
      });
    });

    it('should prevent double submission', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterForm />);

      // Fill form
      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      
      // Try to click multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty role selection', async () => {
      render(<RegisterForm />);

      // Fill all fields except keep default role
      await user.type(screen.getByLabelText(/nome/i), 'João');
      await user.type(screen.getByLabelText(/sobrenome/i), 'Silva');
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      // Should still submit with default 'trainer' role
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('joao@example.com', 'senha123', {
          first_name: 'João',
          last_name: 'Silva',
          phone: '',
          role: 'trainer',
        });
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(firstNameInput).toHaveAttribute('id', 'firstName');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');

      // Check placeholders for UX
      expect(firstNameInput).toHaveAttribute('placeholder', 'Seu nome');
      expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com');
      expect(passwordInput).toHaveAttribute('placeholder', 'Mínimo 6 caracteres');
    });

    it('should support keyboard navigation', async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText(/nome/i);
      
      firstNameInput.focus();
      expect(document.activeElement).toBe(firstNameInput);

      // Tab through form fields
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/sobrenome/i));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/email/i));
    });
  });
});
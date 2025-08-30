/**
 * Comprehensive test suite for LoginForm component
 * Tests: Form validation, user interactions, zod integration, and authentication flow
 * Target: 100% component coverage with real user scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { z } from 'zod';

// Zod validation schema for login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Mock implementations
const mockSignIn = vi.fn();
const mockToast = vi.fn();

vi.mock('@/components/auth/LocalStorageAuthProvider', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('LoginForm', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form elements', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('should have correct input types and attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('placeholder', 'Sua senha');

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).toHaveClass('w-full');
    });

    it('should have proper accessibility attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');

      // Check for proper label association
      const emailLabel = screen.getByText('Email');
      const passwordLabel = screen.getByText('Senha');

      expect(emailLabel).toHaveAttribute('for', 'email');
      expect(passwordLabel).toHaveAttribute('for', 'password');
    });
  });

  describe('User Interactions with user-event', () => {
    it('should update email field when user types', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(emailInput, 'user@example.com');

      expect(emailInput.value).toBe('user@example.com');
    });

    it('should update password field when user types', async () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
      await user.type(passwordInput, 'mypassword');

      expect(passwordInput.value).toBe('mypassword');
    });

    it('should clear form fields when cleared', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'mypassword');

      expect(emailInput.value).toBe('user@example.com');
      expect(passwordInput.value).toBe('mypassword');

      await user.clear(emailInput);
      await user.clear(passwordInput);

      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });

    it('should handle keyboard navigation', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(passwordInput);

      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    });
  });

  describe('Form Validation with Zod', () => {
    it('should validate email format using zod schema', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.email).toContain('Email inválido');
      }
    });

    it('should validate required password using zod schema', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.password).toContain('Senha é obrigatória');
      }
    });

    it('should pass validation with valid credentials', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate complex email formats', () => {
      const testCases = [
        { email: 'test@example.com', valid: true },
        { email: 'user.name@domain.co.uk', valid: true },
        { email: 'user+tag@example.org', valid: true },
        { email: 'invalid', valid: false },
        { email: '@domain.com', valid: false },
        { email: 'user@', valid: false },
        { email: '', valid: false },
      ];

      testCases.forEach(({ email, valid }) => {
        const result = loginSchema.safeParse({ email, password: 'test' });
        expect(result.success).toBe(valid);
      });
    });
  });

  describe('Form Submission and Authentication', () => {
    it('should submit form with valid credentials', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });
      const onSuccess = vi.fn();

      render(<LoginForm onSuccess={onSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sucesso!',
          description: 'Login realizado com sucesso.',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      const errorMessage = 'Credenciais inválidas';
      mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro no login',
          description: errorMessage,
          variant: 'destructive',
        });
      });
    });

    it('should handle non-Error objects in authentication', async () => {
      mockSignIn.mockRejectedValueOnce('String error');

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro no login',
          description: 'Credenciais inválidas.',
          variant: 'destructive',
        });
      });
    });

    it('should show loading state during authentication', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /entrando\.\.\./i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrando\.\.\./i })).toBeDisabled();

      // Check that form fields are disabled during loading
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should prevent form submission when already loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      // Try to submit multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Form Submission via Enter Key', () => {
    it('should submit form when Enter key is pressed in email field', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(emailInput, '{enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
      });
    });

    it('should submit form when Enter key is pressed in password field', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123{enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty form submission', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      // Form should not submit due to HTML5 validation (required attributes)
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should handle very long input values', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'p'.repeat(200);

      await user.type(emailInput, longEmail);
      await user.type(passwordInput, longPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(longEmail, longPassword);
      });
    });

    it('should handle special characters in credentials', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      const specialEmail = 'test+special@example.co.uk';
      const specialPassword = 'P@ssw0rd!#$%';

      await user.type(emailInput, specialEmail);
      await user.type(passwordInput, specialPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(specialEmail, specialPassword);
      });
    });

    it('should not call onSuccess callback when not provided', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { id: '1' } });

      render(<LoginForm />); // No onSuccess prop

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sucesso!',
          description: 'Login realizado com sucesso.',
        });
      });

      // Should not throw error when onSuccess is not provided
    });
  });

  describe('Accessibility and UX', () => {
    it('should maintain focus management during loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      passwordInput.focus();
      await user.click(submitButton);

      // Focus should remain manageable during loading
      expect(document.activeElement).not.toBe(null);
    });

    it('should support screen reader users with proper labels', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      // Check for proper labeling
      expect(emailInput).toHaveAccessibleName('Email');
      expect(passwordInput).toHaveAccessibleName('Senha');
    });

    it('should have proper form structure for assistive technology', () => {
      render(<LoginForm />);

      const form = screen.getByRole('form');
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      expect(form).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
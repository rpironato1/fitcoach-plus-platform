/**
 * Comprehensive test suite for Input component
 * Tests: User interactions, accessibility, form integration, and edge cases
 * Target: 100% component coverage with user-event testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';
import { z } from 'zod';
import * as React from 'react';

describe('Input Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should apply default classes', () => {
      render(<Input data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2'
      );
    });

    it('should merge custom className with default classes', () => {
      render(<Input className="custom-class" data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex', 'h-10', 'w-full'); // Default classes should still be present
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Input Types and Attributes', () => {
    it('should render different input types', () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'];
      
      types.forEach((type) => {
        const { unmount } = render(<Input type={type as any} data-testid={`input-${type}`} />);
        const input = screen.getByTestId(`input-${type}`);
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('should handle required attribute', () => {
      render(<Input required data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('required');
    });

    it('should handle disabled state', () => {
      render(<Input disabled data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should handle placeholder text', () => {
      render(<Input placeholder="Enter text here" data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('placeholder', 'Enter text here');
    });
  });

  describe('User Interactions with user-event', () => {
    it('should handle text input', async () => {
      render(<Input data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      await user.type(input, 'Hello World');
      
      expect(input.value).toBe('Hello World');
    });

    it('should handle clearing input', async () => {
      render(<Input defaultValue="Initial text" data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      expect(input.value).toBe('Initial text');
      
      await user.clear(input);
      expect(input.value).toBe('');
    });

    it('should handle focus and blur events', async () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(<Input onFocus={onFocus} onBlur={onBlur} data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      
      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
      
      await user.tab(); // Move focus away
      expect(onBlur).toHaveBeenCalled();
    });

    it('should handle disabled input interactions', async () => {
      const onChange = vi.fn();
      render(<Input disabled onChange={onChange} data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      
      // Should not be focusable or typeable when disabled
      await user.click(input);
      expect(document.activeElement).not.toBe(input);
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Form Integration with Zod Validation', () => {
    it('should integrate with email validation', () => {
      const emailSchema = z.string().email('Invalid email format');
      
      const testCases = [
        { value: 'valid@example.com', valid: true },
        { value: 'invalid-email', valid: false },
        { value: '', valid: false },
      ];
      
      testCases.forEach(({ value, valid }) => {
        const result = emailSchema.safeParse(value);
        expect(result.success).toBe(valid);
      });
    });

    it('should handle password strength validation', async () => {
      const passwordSchema = z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/\d/, 'Password must contain number');
      
      render(<Input type="password" data-testid="password-input" />);
      
      const input = screen.getByTestId('password-input') as HTMLInputElement;
      
      // Test weak password
      await user.type(input, 'weak');
      const weakResult = passwordSchema.safeParse(input.value);
      expect(weakResult.success).toBe(false);
      
      // Test strong password
      await user.clear(input);
      await user.type(input, 'StrongPass123');
      const strongResult = passwordSchema.safeParse(input.value);
      expect(strongResult.success).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange events', async () => {
      const onChange = vi.fn();
      render(<Input onChange={onChange} data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      await user.type(input, 'test');
      
      expect(onChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('should handle Enter key press', async () => {
      const onKeyDown = vi.fn();
      render(<Input onKeyDown={onKeyDown} data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      await user.type(input, '{enter}');
      
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter'
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-label', 'Username input');
    });

    it('should be accessible by label association', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters', async () => {
      render(<Input data-testid="test-input" />);
      
      const input = screen.getByTestId('test-input') as HTMLInputElement;
      // Use characters that don't conflict with user-event keyboard syntax
      const specialChars = '!@#$%^&*()_+-=';
      
      await user.type(input, specialChars);
      expect(input.value).toBe(specialChars);
    });

    it('should handle controlled vs uncontrolled states', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            data-testid="controlled-input" 
          />
        );
      };
      
      render(<ControlledInput />);
      
      const input = screen.getByTestId('controlled-input') as HTMLInputElement;
      await user.type(input, 'controlled');
      
      expect(input.value).toBe('controlled');
    });
  });
});
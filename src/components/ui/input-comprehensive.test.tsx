import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';
import React from 'react';

describe('Input Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Input value="test value" readOnly />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<Input defaultValue="default text" />);
      expect(screen.getByDisplayValue('default text')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render password input', () => {
      render(<Input type="password" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('States and Attributes', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should be required when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should have aria-invalid when error state', () => {
      render(<Input aria-invalid />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid');
    });
  });

  describe('Styling and Classes', () => {
    it('should have default styling classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
    });

    it('should merge custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should handle focus styles', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('User Interactions', () => {
    it('should handle typing', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    it('should handle onChange events', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('should handle onFocus events', async () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      input.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown events', async () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      await user.keyboard('{Enter}');
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('should handle Enter key press', async () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      await user.keyboard('{Enter}');
      
      const lastCall = handleKeyDown.mock.calls[handleKeyDown.mock.calls.length - 1];
      expect(lastCall[0].key).toBe('Enter');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const TestControlled = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      render(<TestControlled />);
      const input = screen.getByTestId('controlled-input') as HTMLInputElement;
      
      await user.type(input, 'controlled');
      expect(input.value).toBe('controlled');
    });

    it('should work as uncontrolled component', async () => {
      render(<Input defaultValue="uncontrolled" />);
      const input = screen.getByDisplayValue('uncontrolled') as HTMLInputElement;
      
      await user.clear(input);
      await user.type(input, 'new value');
      expect(input.value).toBe('new value');
    });
  });

  describe('Form Integration', () => {
    it('should work within form submission', async () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="testInput" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.type(input, 'form test');
      await user.click(button);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should have proper name attribute', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('should have proper id attribute', () => {
      render(<Input id="user-email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'user-email');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" />);
      expect(screen.getByLabelText('Username input')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">This is help text</div>
        </div>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should be focusable with keyboard navigation', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should support tabIndex', () => {
      render(<Input tabIndex={0} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Validation and Error States', () => {
    it('should support HTML5 validation attributes', () => {
      render(<Input minLength={5} maxLength={50} pattern="[A-Za-z]+" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('minlength', '5');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    });

    it('should handle invalid state', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Special Input Behavior', () => {
    it('should handle password visibility toggle conceptually', async () => {
      render(<Input type="password" />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'secret');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should handle number input constraints', () => {
      render(<Input type="number" min={0} max={100} step={5} />);
      const input = screen.getByRole('spinbutton');
      
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
      expect(input).toHaveAttribute('step', '5');
    });

    it('should handle text selection', async () => {
      render(<Input defaultValue="selectable text" />);
      const input = screen.getByDisplayValue('selectable text') as HTMLInputElement;
      
      input.focus();
      input.setSelectionRange(0, 10);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      render(<Input value="" readOnly />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle null value gracefully', () => {
      render(<Input value={null as unknown as string} readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle very long text', async () => {
      const longText = 'a'.repeat(1000);
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, longText);
      expect(input.value).toBe(longText);
    });

    it('should handle special characters', async () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, specialText);
      expect(input.value).toBe(specialText);
    });

    it('should handle rapid typing', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      
      await user.type(input, 'rapid', { delay: 1 });
      expect(input.value).toBe('rapid');
    });
  });
});
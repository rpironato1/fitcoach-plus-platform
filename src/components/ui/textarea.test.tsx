/**
 * Comprehensive test suite for Textarea component
 * Tests: User interactions, accessibility, form integration, and content handling
 * Target: 100% component coverage with user-event testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './textarea';
import { z } from 'zod';
import * as React from 'react';

describe('Textarea Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should apply default classes', () => {
      render(<Textarea data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
        'w-full',
        'rounded-md',
        'border',
        'border-input'
      );
    });

    it('should merge custom className', () => {
      render(<Textarea className="custom-class" data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveClass('custom-class');
      expect(textarea).toHaveClass('flex', 'min-h-[80px]');
    });
  });

  describe('User Interactions with user-event', () => {
    it('should handle text input', async () => {
      render(<Textarea data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Hello World');
      
      expect(textarea.value).toBe('Hello World');
    });

    it('should handle multiline text', async () => {
      render(<Textarea data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Line 1{enter}Line 2');
      
      expect(textarea.value).toBe('Line 1\nLine 2');
    });

    it('should handle clearing textarea', async () => {
      render(<Textarea defaultValue="Initial" data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
      await user.clear(textarea);
      
      expect(textarea.value).toBe('');
    });

    it('should handle disabled state', async () => {
      render(<Textarea disabled data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toBeDisabled();
    });
  });

  describe('Form Integration with Zod', () => {
    it('should validate text length', () => {
      const schema = z.string().min(10, 'Too short').max(100, 'Too long');
      
      expect(schema.safeParse('Short').success).toBe(false);
      expect(schema.safeParse('This is a valid message').success).toBe(true);
      expect(schema.safeParse('x'.repeat(150)).success).toBe(false);
    });

    it('should validate content rules', async () => {
      const commentSchema = z.string()
        .min(1, 'Required')
        .refine(val => !val.includes('<script>'), 'No scripts');
      
      render(<Textarea data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Valid comment');
      
      expect(commentSchema.safeParse(textarea.value).success).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Textarea aria-label="Message" data-testid="test-textarea" />);
      
      expect(screen.getByTestId('test-textarea')).toHaveAttribute('aria-label', 'Message');
    });

    it('should be accessible by label', () => {
      render(
        <div>
          <label htmlFor="textarea">Message</label>
          <Textarea id="textarea" />
        </div>
      );
      
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange events', async () => {
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} data-testid="test-textarea" />);
      
      await user.type(screen.getByTestId('test-textarea'), 'test');
      
      expect(onChange).toHaveBeenCalledTimes(4);
    });

    it('should handle focus and blur', async () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(<Textarea onFocus={onFocus} onBlur={onBlur} data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea');
      await user.click(textarea);
      expect(onFocus).toHaveBeenCalled();
      
      await user.tab();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle controlled state', async () => {
      const ControlledTextarea = () => {
        const [value, setValue] = React.useState('');
        return (
          <Textarea 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            data-testid="controlled" 
          />
        );
      };
      
      render(<ControlledTextarea />);
      
      const textarea = screen.getByTestId('controlled') as HTMLTextAreaElement;
      await user.type(textarea, 'controlled');
      
      expect(textarea.value).toBe('controlled');
    });

    it('should handle maxLength', async () => {
      render(<Textarea maxLength={5} data-testid="test-textarea" />);
      
      const textarea = screen.getByTestId('test-textarea') as HTMLTextAreaElement;
      await user.type(textarea, '123456789');
      
      expect(textarea.value.length).toBeLessThanOrEqual(5);
    });
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './textarea';

describe('Textarea Component', () => {
  it('should render textarea element', () => {
    render(<Textarea placeholder="Enter message" />);
    
    const textarea = screen.getByPlaceholderText('Enter message');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type here" />);
    
    const textarea = screen.getByPlaceholderText('Type here');
    await user.type(textarea, 'Hello\nWorld');
    
    expect(textarea).toHaveValue('Hello\nWorld');
  });

  it('should handle controlled textarea', () => {
    const mockOnChange = vi.fn();
    render(<Textarea value="Initial text" onChange={mockOnChange} />);
    
    const textarea = screen.getByDisplayValue('Initial text');
    expect(textarea).toHaveValue('Initial text');
  });

  it('should handle disabled state', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    
    const textarea = screen.getByPlaceholderText('Disabled textarea');
    expect(textarea).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('should handle rows attribute', () => {
    render(<Textarea rows={5} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should forward ref properly', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    
    expect(ref.current).toBeTruthy();
  });
});
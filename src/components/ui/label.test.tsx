import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label Component', () => {
  it('should render label text', () => {
    render(<Label>Test Label</Label>);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should associate with form control via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </div>
    );
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label">Label</Label>);
    
    const label = screen.getByText('Label');
    expect(label).toHaveClass('custom-label');
  });

  it('should render as different HTML element', () => {
    const { container } = render(<Label asChild><span>Span Label</span></Label>);
    
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(screen.getByText('Span Label')).toBeInTheDocument();
  });
});
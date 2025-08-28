import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import React from 'react';

describe('Card Components', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Card Base Component', () => {
    it('should render card with default styling', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content').parentElement;
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should forward props to div element', () => {
      render(<Card data-testid="test-card">Content</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });

  describe('CardHeader Component', () => {
    it('should render header with proper styling', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header content').parentElement;
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should support custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header').parentElement;
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle Component', () => {
    it('should render title with proper styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should support custom className', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription Component', () => {
    it('should render description with proper styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
        </Card>
      );
      const description = screen.getByText('Card description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should support custom className', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="custom-desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('CardContent Component', () => {
    it('should render content with proper styling', () => {
      render(
        <Card>
          <CardContent>Main content</CardContent>
        </Card>
      );
      const content = screen.getByText('Main content').parentElement;
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should support custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );
      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter Component', () => {
    it('should render footer with proper styling', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer content').parentElement;
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should support custom className', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Structure', () => {
    it('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should handle nested components properly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Nested Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Inner Card</CardTitle>
              </CardHeader>
              <CardContent>Inner content</CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Nested Card')).toBeInTheDocument();
      expect(screen.getByText('Inner Card')).toBeInTheDocument();
      expect(screen.getByText('Inner content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper structure', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
            <CardDescription>Description for screen readers</CardDescription>
          </CardHeader>
          <CardContent>
            Accessible content
          </CardContent>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(screen.getByText('Accessible Card')).toHaveAttribute('id', 'card-title');
    });

    it('should support focus management', () => {
      render(
        <Card tabIndex={0}>
          <CardHeader>
            <CardTitle>Focusable Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByText('Focusable Card').closest('[tabindex]');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Interactive Cards', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} className="cursor-pointer">
          <CardHeader>
            <CardTitle>Clickable Card</CardTitle>
          </CardHeader>
          <CardContent>Click me</CardContent>
        </Card>
      );

      await user.click(screen.getByText('Clickable Card').closest('div')!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} tabIndex={0}>
          <CardHeader>
            <CardTitle>Keyboard Card</CardTitle>
          </CardHeader>
        </Card>
      );

      const card = screen.getByText('Keyboard Card').closest('[tabindex]')!;
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cards', () => {
      render(<Card />);
      const card = document.querySelector('[class*="rounded-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should handle cards with only header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Header Only')).toBeInTheDocument();
    });

    it('should handle cards with only content', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      );
      expect(screen.getByText('Content Only')).toBeInTheDocument();
    });

    it('should handle multiple titles and descriptions', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>First Title</CardTitle>
            <CardTitle>Second Title</CardTitle>
            <CardDescription>First Description</CardDescription>
            <CardDescription>Second Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('First Title')).toBeInTheDocument();
      expect(screen.getByText('Second Title')).toBeInTheDocument();
      expect(screen.getByText('First Description')).toBeInTheDocument();
      expect(screen.getByText('Second Description')).toBeInTheDocument();
    });
  });
});
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card Components', () => {
  it('should render Card with proper structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          Test Content
        </CardContent>
        <CardFooter>
          Test Footer
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('should apply custom className to Card', () => {
    const { container } = render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('should render CardHeader independently', () => {
    render(
      <CardHeader>
        <CardTitle>Standalone Header</CardTitle>
      </CardHeader>
    );

    expect(screen.getByText('Standalone Header')).toBeInTheDocument();
  });

  it('should render CardContent independently', () => {
    render(
      <CardContent>
        Standalone Content
      </CardContent>
    );

    expect(screen.getByText('Standalone Content')).toBeInTheDocument();
  });

  it('should render CardFooter independently', () => {
    render(
      <CardFooter>
        Standalone Footer
      </CardFooter>
    );

    expect(screen.getByText('Standalone Footer')).toBeInTheDocument();
  });
});
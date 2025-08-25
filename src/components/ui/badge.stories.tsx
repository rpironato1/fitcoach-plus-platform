import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

/**
 * Badge component - Small status indicators and labels
 */
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Small, rounded status indicators or labels. Perfect for showing status, categories, or important information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge style
 */
export const Default: Story = {
  args: {
    children: 'Mais Popular',
    variant: 'default',
  },
};

/**
 * Secondary badge style
 */
export const Secondary: Story = {
  args: {
    children: 'Novo',
    variant: 'secondary',
  },
};

/**
 * Destructive badge for warnings or errors
 */
export const Destructive: Story = {
  args: {
    children: 'Expirado',
    variant: 'destructive',
  },
};

/**
 * Outline badge style
 */
export const Outline: Story = {
  args: {
    children: 'Premium',
    variant: 'outline',
  },
};

/**
 * All badge variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Badge variant="default">Mais Popular</Badge>
      <Badge variant="secondary">Novo</Badge>
      <Badge variant="destructive">Expirado</Badge>
      <Badge variant="outline">Premium</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available badge variants with consistent styling and proper contrast.',
      },
    },
  },
};

/**
 * Badge usage examples
 */
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span>Status do plano:</span>
        <Badge variant="default">Ativo</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Notificações:</span>
        <Badge variant="destructive">3 pendentes</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Categoria:</span>
        <Badge variant="secondary">Força</Badge>
        <Badge variant="secondary">Cardio</Badge>
        <Badge variant="secondary">Flexibilidade</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Tipo de usuário:</span>
        <Badge variant="outline">Personal Trainer</Badge>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Real-world examples of badge usage in different contexts.',
      },
    },
  },
};
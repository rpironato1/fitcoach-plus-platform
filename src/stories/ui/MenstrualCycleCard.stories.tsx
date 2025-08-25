import type { Meta, StoryObj } from '@storybook/react';
import { MenstrualCycleCard } from '../../components/ui/menstrual-cycle-card';

const meta: Meta<typeof MenstrualCycleCard> = {
  title: 'UI Components/Menstrual Cycle Card',
  component: MenstrualCycleCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A specialized card component for managing menstrual cycle-based workout adaptations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isEnabled: {
      control: 'boolean',
    },
    onToggle: {
      action: 'toggle-changed',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  args: {
    isEnabled: false,
  },
};

export const Enabled: Story = {
  args: {
    isEnabled: true,
  },
};
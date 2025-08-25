import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../../components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'UI Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A separator component to visually divide content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
        <span>Content before</span>
        <Story />
        <span>Content after</span>
      </div>
    ),
  ],
};
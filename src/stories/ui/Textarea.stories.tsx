import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A textarea component for multi-line text input.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    rows: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithRows: Story = {
  args: {
    placeholder: 'Enter your message...',
    rows: 5,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: 'This is a multi-line\ntext input field\nwith some content.',
    placeholder: 'Enter your message...',
  },
};
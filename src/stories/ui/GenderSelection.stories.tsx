import type { Meta, StoryObj } from '@storybook/react';
import { GenderSelection } from '../../components/ui/gender-selection';

const meta: Meta<typeof GenderSelection> = {
  title: 'UI Components/Gender Selection',
  component: GenderSelection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A gender selection component that allows users to set their gender for personalized workouts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentGender: {
      control: 'select',
      options: [null, 'female', 'male', 'other'],
    },
    onGenderChange: {
      action: 'gender-changed',
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

export const Default: Story = {
  args: {
    currentGender: null,
  },
};

export const FemaleCurrent: Story = {
  args: {
    currentGender: 'female',
  },
};

export const MaleCurrent: Story = {
  args: {
    currentGender: 'male',
  },
};

export const OtherCurrent: Story = {
  args: {
    currentGender: 'other',
  },
};
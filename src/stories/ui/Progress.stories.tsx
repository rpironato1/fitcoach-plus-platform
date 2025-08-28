import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "../../components/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "UI Components/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A progress indicator component.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const AlmostDone: Story = {
  args: {
    value: 85,
  },
};

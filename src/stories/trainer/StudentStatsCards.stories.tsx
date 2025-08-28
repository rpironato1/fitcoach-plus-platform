import type { Meta, StoryObj } from "@storybook/react";
import { StudentStatsCards } from "../../components/trainer/StudentStatsCards";

const meta: Meta<typeof StudentStatsCards> = {
  title: "Trainer Components/Student Stats Cards",
  component: StudentStatsCards,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Dashboard cards showing student statistics for trainers.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    totalStudents: {
      control: "number",
    },
    activeStudents: {
      control: "number",
    },
    maxStudents: {
      control: "number",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "800px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalStudents: 15,
    activeStudents: 12,
    maxStudents: 20,
  },
};

export const AtCapacity: Story = {
  args: {
    totalStudents: 20,
    activeStudents: 18,
    maxStudents: 20,
  },
};

export const LowNumbers: Story = {
  args: {
    totalStudents: 3,
    activeStudents: 2,
    maxStudents: 10,
  },
};

export const NoStudents: Story = {
  args: {
    totalStudents: 0,
    activeStudents: 0,
    maxStudents: 5,
  },
};

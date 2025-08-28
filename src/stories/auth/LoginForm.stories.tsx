import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "../../components/auth/LoginForm";

const meta: Meta<typeof LoginForm> = {
  title: "Auth Components/Login Form",
  component: LoginForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A login form component with email and password inputs.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSuccess: {
      action: "login-success",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

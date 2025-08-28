import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "../../components/ui/label";

const meta: Meta<typeof Label> = {
  title: "UI Components/Label",
  component: Label,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A form label component with proper accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Email address",
  },
};

export const Required: Story = {
  args: {
    children: "Password *",
  },
};

export const WithHtmlFor: Story = {
  args: {
    htmlFor: "email",
    children: "Email",
  },
};

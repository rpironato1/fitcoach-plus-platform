import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

/**
 * Button component - Standard interactive element with multiple variants and sizes
 */
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants, sizes, and states. Built with accessibility in mind and following WCAG guidelines.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Visual style variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
      description: "Size variant of the button",
    },
    asChild: {
      control: { type: "boolean" },
      description: "Renders as a child component (using Slot)",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with primary styling
 */
export const Default: Story = {
  args: {
    children: "Começar Grátis",
    variant: "default",
    size: "default",
  },
};

/**
 * Secondary button variant
 */
export const Secondary: Story = {
  args: {
    children: "Ver Demo",
    variant: "secondary",
    size: "default",
  },
};

/**
 * Outline button variant
 */
export const Outline: Story = {
  args: {
    children: "Escolher Plano",
    variant: "outline",
    size: "default",
  },
};

/**
 * Destructive button for dangerous actions
 */
export const Destructive: Story = {
  args: {
    children: "Deletar",
    variant: "destructive",
    size: "default",
  },
};

/**
 * Ghost button with minimal styling
 */
export const Ghost: Story = {
  args: {
    children: "Cancelar",
    variant: "ghost",
    size: "default",
  },
};

/**
 * Link-styled button
 */
export const Link: Story = {
  args: {
    children: "Saiba mais",
    variant: "link",
    size: "default",
  },
};

/**
 * Small button size
 */
export const Small: Story = {
  args: {
    children: "Pequeno",
    variant: "default",
    size: "sm",
  },
};

/**
 * Large button size
 */
export const Large: Story = {
  args: {
    children: "Grande",
    variant: "default",
    size: "lg",
  },
};

/**
 * Icon-only button
 */
export const Icon: Story = {
  args: {
    children: "🔍",
    variant: "default",
    size: "icon",
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    children: "Desabilitado",
    variant: "default",
    size: "default",
    disabled: true,
  },
};

/**
 * All button variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Overview of all available button variants with consistent styling.",
      },
    },
  },
};

/**
 * All button sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Overview of all available button sizes ensuring proper text readability.",
      },
    },
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Layout Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Navigation component that adapts based on user role.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TrainerNavbar: Story = {
  parameters: {
    docs: {
      description: {
        story: "Navbar for trainer users with full navigation menu.",
      },
    },
  },
};

export const StudentNavbar: Story = {
  parameters: {
    docs: {
      description: {
        story: "Navbar for student users with simplified navigation.",
      },
    },
  },
};

export const GuestNavbar: Story = {
  parameters: {
    docs: {
      description: {
        story: "Navbar for guests/unauthenticated users.",
      },
    },
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const meta: Meta<typeof Table> = {
  title: "UI Components/Table",
  component: Table,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A table component for displaying tabular data.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">João Silva</TableCell>
          <TableCell>joao@email.com</TableCell>
          <TableCell>Ativo</TableCell>
          <TableCell className="text-right">...</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Maria Santos</TableCell>
          <TableCell>maria@email.com</TableCell>
          <TableCell>Inativo</TableCell>
          <TableCell className="text-right">...</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Pedro Costa</TableCell>
          <TableCell>pedro@email.com</TableCell>
          <TableCell>Ativo</TableCell>
          <TableCell className="text-right">...</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const SimpleTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Produto A</TableCell>
          <TableCell>10</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Produto B</TableCell>
          <TableCell>5</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

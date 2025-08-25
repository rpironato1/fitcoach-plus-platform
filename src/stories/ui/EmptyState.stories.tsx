import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Calendar, FileText, Search } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'UI Components/Empty State',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An empty state component to show when there is no data to display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['Users', 'Calendar', 'FileText', 'Search'],
      mapping: {
        Users,
        Calendar,
        FileText,
        Search,
      },
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoUsers: Story = {
  args: {
    icon: Users,
    title: 'Nenhum usuário encontrado',
    description: 'Não há usuários cadastrados no sistema.',
  },
};

export const NoAppointments: Story = {
  args: {
    icon: Calendar,
    title: 'Nenhum agendamento',
    description: 'Você não possui agendamentos para esta data.',
  },
};

export const NoDocuments: Story = {
  args: {
    icon: FileText,
    title: 'Nenhum documento',
    description: 'Não há documentos disponíveis no momento.',
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca.',
  },
};
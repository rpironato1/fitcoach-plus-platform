import type { Meta, StoryObj } from "@storybook/react";
import { Toast, ToastProvider, ToastViewport } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";

const meta: Meta<typeof Toast> = {
  title: "UI Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toast notification component for showing temporary messages.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

function SuccessToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Sucesso!",
          description: "Operação realizada com sucesso.",
        })
      }
    >
      Mostrar toast de sucesso
    </Button>
  );
}

function ErrorToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Erro!",
          description: "Algo deu errado.",
          variant: "destructive",
        })
      }
      variant="destructive"
    >
      Mostrar toast de erro
    </Button>
  );
}

function ActionToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Configuração salva",
          description: "Suas configurações foram atualizadas.",
          action: (
            <Button variant="outline" size="sm">
              Desfazer
            </Button>
          ),
        })
      }
    >
      Toast com ação
    </Button>
  );
}

export const Success: Story = {
  render: () => <SuccessToastDemo />,
};

export const Error: Story = {
  render: () => <ErrorToastDemo />,
};

export const WithAction: Story = {
  render: () => <ActionToastDemo />,
};

import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * Dialog component - Modal dialogs for important user interactions
 */
const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal dialogs for capturing user attention and handling important interactions. Built with accessibility and keyboard navigation support.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic dialog with header, content, and footer
 */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Ação</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Dialog with form inputs
 */
export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Adicionar Exercício</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Exercício</DialogTitle>
          <DialogDescription>
            Adicione um novo exercício ao seu treino. Preencha os campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Ex: Supino reto"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sets" className="text-right">
              Séries
            </Label>
            <Input
              id="sets"
              type="number"
              placeholder="3"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reps" className="text-right">
              Repetições
            </Label>
            <Input id="reps" placeholder="10-12" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Peso (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="80"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with form inputs for data collection. Demonstrates proper form layout within modal context.",
      },
    },
  },
};

/**
 * Destructive action dialog
 */
export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Deletar Conta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Deletar Conta</DialogTitle>
          <DialogDescription>
            Esta ação é permanente e não pode ser desfeita. Todos os seus dados,
            treinos e informações serão removidos definitivamente.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-destructive/10 p-4 rounded-lg">
          <p className="text-sm font-medium text-destructive">
            ⚠️ Atenção: Esta ação é irreversível
          </p>
          <p className="text-sm mt-2">
            Se você tem certeza, digite "DELETAR" no campo abaixo:
          </p>
          <Input className="mt-2" placeholder="Digite DELETAR para confirmar" />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Deletar Permanentemente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dialog for destructive actions with clear warnings and confirmation patterns.",
      },
    },
  },
};

/**
 * Success confirmation dialog
 */
export const Success: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Finalizar Treino</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-green-600">
            🎉 Treino Finalizado!
          </DialogTitle>
          <DialogDescription>
            Parabéns! Você completou seu treino de hoje com sucesso.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-4">
          <div className="text-6xl mb-4">💪</div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Estatísticas do Treino</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium">Duração</p>
                <p className="text-green-600 font-bold">45 minutos</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium">Exercícios</p>
                <p className="text-blue-600 font-bold">8 completos</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-medium">Calorias</p>
                <p className="text-purple-600 font-bold">~320 kcal</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="font-medium">Próximo</p>
                <p className="text-orange-600 font-bold">Amanhã</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full">Compartilhar Resultado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Success dialog with celebratory content and detailed feedback for user achievements.",
      },
    },
  },
};

/**
 * Information dialog
 */
export const Information: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">ℹ️ Sobre o App</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>FitCoach Plus Platform</DialogTitle>
          <DialogDescription>
            A plataforma mais completa para personal trainers e seus alunos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Funcionalidades Principais:</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Criação de treinos personalizados</li>
              <li>✅ Acompanhamento de progresso</li>
              <li>✅ Analytics detalhados</li>
              <li>✅ Sistema de agendamento</li>
              <li>✅ Chat integrado</li>
              <li>✅ Planos de nutrição</li>
            </ul>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Versão:</strong> 2.0.0
              <br />
              <strong>Última atualização:</strong> Dezembro 2024
              <br />
              <strong>Suporte:</strong> suporte@fitcoachplus.com
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Information dialog for displaying app details, help content, or feature explanations.",
      },
    },
  },
};

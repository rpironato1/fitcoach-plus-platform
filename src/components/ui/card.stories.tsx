import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

/**
 * Card component - Container for related content with optional header, content, and footer sections
 */
const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible container component for grouping related content. Includes header, content, and footer sections for structured layouts.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic card with header and content
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Plano Pro</CardTitle>
        <CardDescription>Ideal para personal trainers independentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">R$ 97/mês</div>
        <ul className="mt-4 space-y-2 text-sm">
          <li>✅ Até 50 alunos</li>
          <li>✅ Workouts personalizados</li>
          <li>✅ Analytics básicos</li>
          <li>✅ Suporte por email</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Começar Grátis</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Simple card with just content
 */
export const Simple: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="p-6">
        <p className="text-center text-gray-600">
          Este é um card simples com apenas conteúdo.
        </p>
      </CardContent>
    </Card>
  ),
};

/**
 * Card with pricing information
 */
export const Pricing: Story = {
  render: () => (
    <Card className="w-[350px] border-2 border-primary">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Elite</CardTitle>
        <CardDescription>Para academias e grandes estúdios</CardDescription>
        <div className="text-3xl font-bold text-primary">R$ 297/mês</div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Alunos ilimitados
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            IA personalizada
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Analytics avançados
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Suporte prioritário
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full" size="lg">
          Escolher Plano
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Card showcase with multiple cards
 */
export const Showcase: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Básico</CardTitle>
          <CardDescription>Para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">Grátis</div>
          <p className="text-sm text-gray-600 mt-2">Até 5 alunos</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Começar</Button>
        </CardFooter>
      </Card>
      
      <Card className="border-primary border-2 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            Mais Popular
          </span>
        </div>
        <CardHeader>
          <CardTitle>Pro</CardTitle>
          <CardDescription>Para profissionais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">R$ 97/mês</div>
          <p className="text-sm text-gray-600 mt-2">Até 50 alunos</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Começar Grátis</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Elite</CardTitle>
          <CardDescription>Para academias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">R$ 297/mês</div>
          <p className="text-sm text-gray-600 mt-2">Alunos ilimitados</p>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full">Falar com Vendas</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of multiple cards used together for pricing display with consistent styling and clear hierarchy.',
      },
    },
  },
};
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Design System - Colors, typography, and design tokens
 */
const meta: Meta = {
  title: "Design System/Colors & Typography",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "FitCoach Plus Platform design system with standardized colors, typography, and spacing following WCAG AA accessibility guidelines.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Color palette showcasing primary, secondary, and semantic colors
 */
export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Paleta de Cores Principal</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-20 w-full bg-primary rounded-lg mb-2"></div>
            <p className="font-medium">Primary</p>
            <p className="text-sm text-muted-foreground">HSL(238, 70%, 45%)</p>
            <p className="text-xs">Botões principais</p>
          </div>
          <div className="text-center">
            <div className="h-20 w-full bg-secondary rounded-lg mb-2"></div>
            <p className="font-medium">Secondary</p>
            <p className="text-sm text-muted-foreground">HSL(238, 70%, 45%)</p>
            <p className="text-xs">Botões secundários</p>
          </div>
          <div className="text-center">
            <div className="h-20 w-full bg-accent rounded-lg mb-2"></div>
            <p className="font-medium">Accent</p>
            <p className="text-sm text-muted-foreground">HSL(210, 40%, 96%)</p>
            <p className="text-xs">Destaques sutis</p>
          </div>
          <div className="text-center">
            <div className="h-20 w-full bg-muted rounded-lg mb-2"></div>
            <p className="font-medium">Muted</p>
            <p className="text-sm text-muted-foreground">HSL(0, 0%, 96%)</p>
            <p className="text-xs">Backgrounds sutis</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Cores Semânticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-20 w-full bg-destructive rounded-lg mb-2"></div>
            <p className="font-medium">Destructive</p>
            <p className="text-sm text-muted-foreground">
              Erros e ações perigosas
            </p>
          </div>
          <div className="text-center">
            <div className="h-20 w-full bg-green-500 rounded-lg mb-2"></div>
            <p className="font-medium">Success</p>
            <p className="text-sm text-muted-foreground">
              Sucesso e confirmações
            </p>
          </div>
          <div className="text-center">
            <div className="h-20 w-full bg-yellow-500 rounded-lg mb-2"></div>
            <p className="font-medium">Warning</p>
            <p className="text-sm text-muted-foreground">Avisos e atenção</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Contraste de Texto</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              <p className="font-medium">Texto em Primary</p>
              <p className="text-sm">Contraste WCAG AA: ✅ Aprovado</p>
            </div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
              <p className="font-medium">Texto em Secondary</p>
              <p className="text-sm">Contraste WCAG AA: ✅ Aprovado</p>
            </div>
            <div className="bg-destructive text-destructive-foreground p-4 rounded-lg">
              <p className="font-medium">Texto em Destructive</p>
              <p className="text-sm">Contraste WCAG AA: ✅ Aprovado</p>
            </div>
            <div className="bg-muted text-muted-foreground p-4 rounded-lg">
              <p className="font-medium">Texto em Muted</p>
              <p className="text-sm">Contraste WCAG AA: ✅ Aprovado</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete color palette with WCAG AA compliant contrast ratios. All colors maintain accessibility standards.",
      },
    },
  },
};

/**
 * Typography scale and font hierarchy
 */
export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Hierarquia Tipográfica</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1 - 36px</h1>
            <p className="text-sm text-muted-foreground">
              Para títulos principais de páginas
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Heading 2 - 30px</h2>
            <p className="text-sm text-muted-foreground">
              Para seções importantes
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Heading 3 - 24px</h3>
            <p className="text-sm text-muted-foreground">Para sub-seções</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Heading 4 - 20px</h4>
            <p className="text-sm text-muted-foreground">Para componentes</p>
          </div>
          <div>
            <p className="text-base">Parágrafo - 16px</p>
            <p className="text-sm text-muted-foreground">
              Texto principal com boa legibilidade
            </p>
          </div>
          <div>
            <p className="text-sm">Small text - 14px</p>
            <p className="text-xs text-muted-foreground">
              Para textos auxiliares e descrições
            </p>
          </div>
          <div>
            <p className="text-xs">Extra small - 12px</p>
            <p className="text-xs text-muted-foreground">
              Para metadados e informações secundárias
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Pesos de Fonte</h2>
        <div className="space-y-2">
          <p className="font-normal">Regular (400) - Texto padrão</p>
          <p className="font-medium">Medium (500) - Destaques sutis</p>
          <p className="font-semibold">Semibold (600) - Títulos secundários</p>
          <p className="font-bold">Bold (700) - Títulos principais</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">
          Tamanhos de Texto Acessíveis
        </h2>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm mb-2">
            ✅ Todos os tamanhos de texto atendem aos requisitos WCAG:
          </p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Tamanho mínimo: 12px (adequado para metadados)</li>
            <li>• Tamanho padrão: 16px (ótima legibilidade)</li>
            <li>• Contraste mínimo: 4.5:1 para texto normal</li>
            <li>• Contraste mínimo: 3:1 para texto grande (18px+)</li>
          </ul>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Typography system with accessible font sizes and proper hierarchy for optimal readability.",
      },
    },
  },
};

/**
 * Spacing and layout system
 */
export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Sistema de Espaçamento</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-primary"></div>
            <span>8px (0.5rem) - Espaçamento extra pequeno</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-8 bg-primary"></div>
            <span>16px (1rem) - Espaçamento pequeno</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-8 bg-primary"></div>
            <span>24px (1.5rem) - Espaçamento médio</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary"></div>
            <span>32px (2rem) - Espaçamento grande</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-primary"></div>
            <span>48px (3rem) - Espaçamento extra grande</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-8 bg-primary"></div>
            <span>64px (4rem) - Espaçamento de seção</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Border Radius</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-16 w-full bg-primary rounded-sm mb-2"></div>
            <p className="text-sm">Small (2px)</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-full bg-primary rounded mb-2"></div>
            <p className="text-sm">Default (6px)</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-full bg-primary rounded-lg mb-2"></div>
            <p className="text-sm">Large (8px)</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-full bg-primary rounded-full mb-2"></div>
            <p className="text-sm">Full (50%)</p>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Consistent spacing and border radius system for layout consistency.",
      },
    },
  },
};

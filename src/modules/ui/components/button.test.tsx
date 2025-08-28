import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// Helper para renderizar com providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Button Component", () => {
  it("deve renderizar botão com texto", () => {
    renderWithProviders(<Button>Clique aqui</Button>);

    expect(
      screen.getByRole("button", { name: /clique aqui/i })
    ).toBeInTheDocument();
  });

  it("deve executar onClick quando clicado", () => {
    const handleClick = vi.fn();
    renderWithProviders(<Button onClick={handleClick}>Clique</Button>);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("deve estar desabilitado quando prop disabled é true", () => {
    renderWithProviders(<Button disabled>Desabilitado</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("deve aplicar variante correta", () => {
    renderWithProviders(<Button variant="destructive">Excluir</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });
});

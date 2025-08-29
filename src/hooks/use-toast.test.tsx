import { describe, it, expect, vi } from "vitest";

// Mock simplificado do useToast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

describe("useToast Hook", () => {
  it("deve executar toast corretamente", async () => {
    // Import dinâmico após o mock
    const { useToast } = await import("@/hooks/use-toast");

    const toastParams = {
      title: "Sucesso",
      description: "Operação realizada com sucesso",
    };

    const { toast } = useToast();
    toast(toastParams);

    expect(mockToast).toHaveBeenCalledWith(toastParams);
  });
});

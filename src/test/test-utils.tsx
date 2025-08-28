import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do Supabase para testes
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      limit: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
};

// Provider personalizado para testes
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Função de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Exportar tudo da testing library
export * from "@testing-library/react";

// Sobrescrever o render method
export { customRender as render };

// Mock data factories
export const createMockUser = () => ({
  id: "test-user-id",
  email: "test@example.com",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const createMockProfile = (
  role: "admin" | "trainer" | "student" = "student"
) => ({
  id: "test-profile-id",
  first_name: "Test",
  last_name: "User",
  phone: "+5511999999999",
  role,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const createMockTrainer = () => ({
  id: "test-trainer-id",
  plan: "free" as const,
  active_until: null,
  whatsapp_number: "+5511999999999",
  bio: "Test trainer bio",
  avatar_url: null,
  max_students: 3,
  ai_credits: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const createMockStudent = () => ({
  id: "test-student-id",
  trainer_id: "test-trainer-id",
  start_date: new Date().toISOString(),
  status: "active" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

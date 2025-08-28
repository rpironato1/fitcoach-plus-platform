/**
 * LocalStorage Admin Dashboard Data Hooks
 *
 * These hooks provide localStorage-based data management for admin dashboard
 * structured to be compatible with Supabase for easy migration.
 */

import { useQuery } from "@tanstack/react-query";
import { localStorageService } from "@/services/localStorageService";

interface AdminDashboardStats {
  activeTrainers: number;
  totalStudents: number;
  totalRevenue: number;
  totalSessions: number;
  monthlyRevenue: number;
  weeklySignups: number;
  averageSessionsPerTrainer: number;
  systemHealth: {
    database: "online" | "offline";
    auth: "online" | "offline";
    storage: "online" | "offline";
  };
}

interface RecentPayment {
  id: string;
  trainer_id: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  method: string;
  created_at: string;
  trainer_name?: string;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

interface AdminActivity {
  id: string;
  type:
    | "trainer_signup"
    | "payment_processed"
    | "session_completed"
    | "system_update";
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export function useLocalStorageAdminStats() {
  return useQuery({
    queryKey: ["localstorage-admin-stats"],
    queryFn: async (): Promise<AdminDashboardStats> => {
      // Initialize data if it doesn't exist
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      // Calculate admin statistics
      const activeTrainers = data.trainer_profiles.length;
      const totalStudents = data.students.length;
      const totalRevenue = data.payments.reduce(
        (sum, payment) =>
          payment.status === "succeeded" ? sum + payment.amount : sum,
        0
      );

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRevenue = data.payments
        .filter(
          (payment) =>
            payment.status === "succeeded" &&
            new Date(payment.created_at) >= thirtyDaysAgo
        )
        .reduce((sum, payment) => sum + payment.amount, 0);

      const totalSessions = data.sessions.length;
      const completedSessions = data.sessions.filter(
        (s) => s.status === "completed"
      ).length;

      // Simulate weekly signups (would be calculated from user registration data)
      const weeklySignups = Math.floor(activeTrainers * 0.1) + 1;

      const averageSessionsPerTrainer =
        activeTrainers > 0
          ? Math.round((completedSessions / activeTrainers) * 10) / 10
          : 0;

      return {
        activeTrainers,
        totalStudents,
        totalRevenue,
        totalSessions,
        monthlyRevenue,
        weeklySignups,
        averageSessionsPerTrainer,
        systemHealth: {
          database: "online",
          auth: "online",
          storage: "online",
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLocalStorageAdminPayments() {
  return useQuery({
    queryKey: ["localstorage-admin-payments"],
    queryFn: async (): Promise<RecentPayment[]> => {
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      // Enhance payments with trainer names
      const recentPayments = data.payments
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10)
        .map((payment) => {
          const trainer = data.trainer_profiles.find(
            (t) => t.id === payment.trainer_id
          );
          return {
            ...payment,
            method: "Cartão de Crédito", // Mock payment method
            trainer_name: trainer
              ? `Trainer ${payment.trainer_id.slice(-3)}`
              : "Desconhecido",
          };
        });

      return recentPayments;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLocalStorageAdminSettings() {
  return useQuery({
    queryKey: ["localstorage-admin-settings"],
    queryFn: async (): Promise<SystemSetting[]> => {
      // Mock system settings since they don't exist in current localStorage structure
      const now = new Date().toISOString();

      const mockSettings: SystemSetting[] = [
        {
          id: "setting_1",
          key: "stripe_webhook_enabled",
          value: "true",
          description: "Webhook do Stripe ativo",
          updated_at: now,
        },
        {
          id: "setting_2",
          key: "email_notifications",
          value: "enabled",
          description: "Notificações por email",
          updated_at: now,
        },
        {
          id: "setting_3",
          key: "max_free_students",
          value: "3",
          description: "Máximo de alunos no plano gratuito",
          updated_at: now,
        },
        {
          id: "setting_4",
          key: "ai_credits_free_plan",
          value: "10",
          description: "Créditos IA para plano gratuito",
          updated_at: now,
        },
        {
          id: "setting_5",
          key: "maintenance_mode",
          value: "false",
          description: "Modo de manutenção",
          updated_at: now,
        },
      ];

      return mockSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLocalStorageAdminActivity() {
  return useQuery({
    queryKey: ["localstorage-admin-activity"],
    queryFn: async (): Promise<AdminActivity[]> => {
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      // Generate mock admin activities based on existing data
      const activities: AdminActivity[] = [];

      // Add activities for recent payments
      data.payments
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3)
        .forEach((payment) => {
          activities.push({
            id: `activity_payment_${payment.id}`,
            type: "payment_processed",
            description: `Pagamento de R$ ${(payment.amount / 100).toFixed(2)} processado com sucesso`,
            created_at: payment.created_at,
            metadata: { payment_id: payment.id, amount: payment.amount },
          });
        });

      // Add activities for recent completed sessions
      data.sessions
        .filter((session) => session.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
        )
        .slice(0, 2)
        .forEach((session) => {
          activities.push({
            id: `activity_session_${session.id}`,
            type: "session_completed",
            description: `Sessão com ${session.profiles.first_name} ${session.profiles.last_name} finalizada`,
            created_at: session.updated_at || session.created_at,
            metadata: { session_id: session.id },
          });
        });

      // Add mock trainer signups
      data.trainer_profiles
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 2)
        .forEach((trainer) => {
          activities.push({
            id: `activity_trainer_${trainer.id}`,
            type: "trainer_signup",
            description: `Novo trainer cadastrado no plano ${trainer.plan}`,
            created_at: trainer.created_at,
            metadata: { trainer_id: trainer.id, plan: trainer.plan },
          });
        });

      // Sort all activities by creation date
      return activities
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

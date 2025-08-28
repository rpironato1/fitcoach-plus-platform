/**
 * LocalStorage Dashboard Data Hooks
 *
 * These hooks mirror the functionality of useDashboardData.ts
 * but use localStorage instead of Supabase for testing and development.
 */

import { useQuery } from "@tanstack/react-query";
import { localStorageService } from "@/services/localStorageService";

interface DashboardStats {
  activeStudents: number;
  maxStudents: number;
  sessionsToday: number;
  totalSessions: number;
  monthlyRevenue: number;
  aiCredits: number;
}

interface UpcomingSession {
  id: string;
  student_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
}

interface RecentActivity {
  id: string;
  type:
    | "session_completed"
    | "student_added"
    | "workout_assigned"
    | "diet_created";
  description: string;
  created_at: string;
}

export function useLocalStorageDashboardStats() {
  return useQuery({
    queryKey: ["localstorage-dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Initialize data if it doesn't exist
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      const trainerId = localStorageService.getCurrentTrainerId();

      // Get active students count
      const activeStudents = data.students.filter(
        (student) =>
          student.trainer_id === trainerId && student.status === "active"
      );

      // Get trainer profile
      const trainerProfile = data.trainer_profiles.find(
        (profile) => profile.id === trainerId
      );

      // Get sessions today
      const today = new Date().toISOString().split("T")[0];
      const sessionsToday = data.sessions.filter((session) => {
        const sessionDate = new Date(session.scheduled_at)
          .toISOString()
          .split("T")[0];
        return session.trainer_id === trainerId && sessionDate === today;
      });

      // Get total sessions count
      const totalSessions = data.sessions.filter(
        (session) => session.trainer_id === trainerId
      );

      // Calculate monthly revenue
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      );

      const monthlyPayments = data.payments.filter((payment) => {
        const paymentDate = new Date(payment.created_at);
        return (
          payment.trainer_id === trainerId &&
          payment.status === "succeeded" &&
          paymentDate >= firstDayOfMonth &&
          paymentDate <= lastDayOfMonth
        );
      });

      const monthlyRevenue =
        monthlyPayments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        ) / 100; // Convert from cents to reais

      return {
        activeStudents: activeStudents.length,
        maxStudents: trainerProfile?.max_students || 3,
        sessionsToday: sessionsToday.length,
        totalSessions: totalSessions.length,
        monthlyRevenue,
        aiCredits: trainerProfile?.ai_credits || 0,
      };
    },
    // Add cache time and stale time for realistic behavior
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLocalStorageUpcomingSessions() {
  return useQuery({
    queryKey: ["localstorage-upcoming-sessions"],
    queryFn: async (): Promise<UpcomingSession[]> => {
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      const trainerId = localStorageService.getCurrentTrainerId();

      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingSessions = data.sessions
        .filter((session) => {
          const sessionDate = new Date(session.scheduled_at);
          return (
            session.trainer_id === trainerId &&
            sessionDate >= now &&
            sessionDate <= nextWeek
          );
        })
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime()
        )
        .slice(0, 5);

      return upcomingSessions.map((session) => ({
        id: session.id,
        student_name: `${session.profiles.first_name} ${session.profiles.last_name}`,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLocalStorageRecentActivity() {
  return useQuery({
    queryKey: ["localstorage-recent-activity"],
    queryFn: async (): Promise<RecentActivity[]> => {
      localStorageService.initializeData();

      const data = localStorageService.getData();
      if (!data) throw new Error("Failed to load localStorage data");

      const trainerId = localStorageService.getCurrentTrainerId();
      const activities: RecentActivity[] = [];

      // Get recent completed sessions
      const completedSessions = data.sessions
        .filter(
          (session) =>
            session.trainer_id === trainerId && session.status === "completed"
        )
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 3);

      completedSessions.forEach((session) => {
        activities.push({
          id: session.id,
          type: "session_completed",
          description: `Sessão concluída com ${session.profiles.first_name} ${session.profiles.last_name}`,
          created_at: session.updated_at,
        });
      });

      // Get recently added students
      const newStudents = data.students
        .filter((student) => student.trainer_id === trainerId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3);

      newStudents.forEach((student) => {
        activities.push({
          id: student.id,
          type: "student_added",
          description: `Novo aluno adicionado: ${student.profiles.first_name} ${student.profiles.last_name}`,
          created_at: student.created_at,
        });
      });

      // Get recent diet plans
      const dietPlans = data.diet_plans
        .filter((plan) => plan.trainer_id === trainerId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3);

      dietPlans.forEach((plan) => {
        activities.push({
          id: plan.id,
          type: "diet_created",
          description: `Plano "${plan.name}" criado para ${plan.profiles.first_name} ${plan.profiles.last_name}`,
          created_at: plan.created_at,
        });
      });

      // Get recent workout assignments
      const workoutPlans = data.workout_plans
        .filter((plan) => plan.trainer_id === trainerId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3);

      workoutPlans.forEach((plan) => {
        activities.push({
          id: plan.id,
          type: "workout_assigned",
          description: `Treino "${plan.name}" atribuído para ${plan.profiles.first_name} ${plan.profiles.last_name}`,
          created_at: plan.created_at,
        });
      });

      // Sort all activities by date and return top 10
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

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

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
  type: 'session_completed' | 'student_added' | 'workout_assigned' | 'diet_created';
  description: string;
  created_at: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
}

interface SessionWithProfile {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  student_id: string;
  profiles: ProfileData;
  updated_at?: string;
}

interface StudentWithProfile {
  id: string;
  created_at: string;
  profiles: ProfileData;
}

interface PlanWithProfile {
  id: string;
  created_at: string;
  name: string;
  profiles: ProfileData;
}

export function useDashboardStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', profile?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Get active students count
      const { data: students, error: studentsError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('trainer_id', profile.id)
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // Get trainer profile for max_students and ai_credits
      const { data: trainerProfile, error: trainerError } = await supabase
        .from('trainer_profiles')
        .select('max_students, ai_credits')
        .eq('id', profile.id)
        .single();

      if (trainerError) throw trainerError;

      // Get sessions today
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsToday, error: sessionsTodayError } = await supabase
        .from('sessions')
        .select('id')
        .eq('trainer_id', profile.id)
        .gte('scheduled_at', today)
        .lt('scheduled_at', today + 'T23:59:59');

      if (sessionsTodayError) throw sessionsTodayError;

      // Get total sessions count
      const { data: totalSessions, error: totalSessionsError } = await supabase
        .from('sessions')
        .select('id')
        .eq('trainer_id', profile.id);

      if (totalSessionsError) throw totalSessionsError;

      // Get monthly revenue from successful payments
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: payments, error: paymentsError } = await supabase
        .from('payment_intents')
        .select('amount')
        .eq('trainer_id', profile.id)
        .eq('status', 'succeeded')
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());

      if (paymentsError) throw paymentsError;

      const monthlyRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      return {
        activeStudents: students?.length || 0,
        maxStudents: trainerProfile?.max_students || 3,
        sessionsToday: sessionsToday?.length || 0,
        totalSessions: totalSessions?.length || 0,
        monthlyRevenue,
        aiCredits: trainerProfile?.ai_credits || 0,
      };
    },
    enabled: !!profile?.id,
  });
}

export function useUpcomingSessions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['upcoming-sessions', profile?.id],
    queryFn: async (): Promise<UpcomingSession[]> => {
      if (!profile?.id) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          student_id,
          profiles!sessions_student_id_fkey(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .gte('scheduled_at', now)
        .lte('scheduled_at', nextWeek.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) throw error;

      return sessions?.map((session: SessionWithProfile) => ({
        id: session.id,
        student_name: `${session.profiles.first_name} ${session.profiles.last_name}`,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
      })) || [];
    },
    enabled: !!profile?.id,
  });
}

export function useRecentActivity() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', profile?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!profile?.id) throw new Error('User not authenticated');

      const activities: RecentActivity[] = [];

      // Get recent completed sessions
      const { data: completedSessions } = await supabase
        .from('sessions')
        .select(`
          id,
          updated_at,
          profiles!sessions_student_id_fkey(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(3);

      completedSessions?.forEach((session: SessionWithProfile) => {
        activities.push({
          id: session.id,
          type: 'session_completed',
          description: `Sessão concluída com ${session.profiles.first_name} ${session.profiles.last_name}`,
          created_at: session.updated_at,
        });
      });

      // Get recently added students
      const { data: newStudents } = await supabase
        .from('student_profiles')
        .select(`
          id,
          created_at,
          profiles!student_profiles_id_fkey(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);

      newStudents?.forEach((student: StudentWithProfile) => {
        activities.push({
          id: student.id,
          type: 'student_added',
          description: `Novo aluno adicionado: ${student.profiles.first_name} ${student.profiles.last_name}`,
          created_at: student.created_at,
        });
      });

      // Get recent diet plans
      const { data: dietPlans } = await supabase
        .from('diet_plans')
        .select(`
          id,
          created_at,
          name,
          profiles!diet_plans_student_id_fkey(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);

      dietPlans?.forEach((plan: PlanWithProfile) => {
        activities.push({
          id: plan.id,
          type: 'diet_created',
          description: `Plano "${plan.name}" criado para ${plan.profiles.first_name} ${plan.profiles.last_name}`,
          created_at: plan.created_at,
        });
      });

      // Get recent workout assignments
      const { data: workoutPlans } = await supabase
        .from('workout_plans')
        .select(`
          id,
          created_at,
          name,
          profiles!workout_plans_student_id_fkey(first_name, last_name)
        `)
        .eq('trainer_id', profile.id)
        .not('student_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);

      workoutPlans?.forEach((plan: PlanWithProfile) => {
        activities.push({
          id: plan.id,
          type: 'workout_assigned',
          description: `Treino "${plan.name}" atribuído para ${plan.profiles.first_name} ${plan.profiles.last_name}`,
          created_at: plan.created_at,
        });
      });

      // Sort all activities by date and return top 10
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    },
    enabled: !!profile?.id,
  });
}
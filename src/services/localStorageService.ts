/**
 * LocalStorage Service for FitCoach Plus Platform
 *
 * This service provides comprehensive localStorage-based data management
 * structured to be compatible with Supabase for easy migration.
 * The JSON structure mirrors Supabase database schema.
 *
 * Features:
 * - Complete authentication system
 * - User profiles and role management
 * - Subscription and payment data
 * - Dashboard data for all user types
 */

// Auth & User Management
export interface LocalStorageUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  last_sign_in_at: string;
}

export interface LocalStorageProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "admin" | "trainer" | "student";
  created_at: string;
  updated_at: string;
}

export interface LocalStorageAuthSession {
  user: LocalStorageUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
}

export interface LocalStorageTrainerProfile {
  id: string;
  plan: "free" | "pro" | "elite";
  max_students: number;
  ai_credits: number;
  active_until: string | null;
  avatar_url: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalStorageStudent {
  id: string;
  trainer_id: string;
  status: "active" | "inactive";
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface LocalStorageStudentProfile {
  id: string;
  trainer_id: string;
  gender: string | null;
  menstrual_cycle_tracking: boolean;
  start_date: string;
  status: "active" | "paused" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface LocalStorageSession {
  id: string;
  trainer_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface LocalStoragePayment {
  id: string;
  trainer_id: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  created_at: string;
}

export interface LocalStorageDietPlan {
  id: string;
  trainer_id: string;
  student_id: string;
  name: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface LocalStorageWorkoutPlan {
  id: string;
  trainer_id: string;
  student_id: string;
  name: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface LocalStorageData {
  // Authentication & Session
  auth_session: LocalStorageAuthSession | null;
  users: LocalStorageUser[];
  profiles: LocalStorageProfile[];

  // Platform Data
  trainer_profiles: LocalStorageTrainerProfile[];
  student_profiles: LocalStorageStudentProfile[];
  students: LocalStorageStudent[];
  sessions: LocalStorageSession[];
  payments: LocalStoragePayment[];
  diet_plans: LocalStorageDietPlan[];
  workout_plans: LocalStorageWorkoutPlan[];

  // System Data
  notifications: LocalStorageNotification[];
  system_settings: LocalStorageSystemSetting[];

  // Metadata
  lastUpdated: string;
  dataVersion: string;
}

export interface LocalStorageNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface LocalStorageSystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

class LocalStorageService {
  private readonly STORAGE_KEY = "fitcoach_data";
  private readonly AUTH_KEY = "fitcoach_auth";
  private readonly USE_LOCALSTORAGE_KEY = "fitcoach_use_localStorage";

  // Demo user IDs
  private readonly DEMO_ADMIN_ID = "admin_123";
  private readonly DEMO_TRAINER_ID = "trainer_123";
  private readonly DEMO_STUDENT_ID = "student_123";

  /**
   * Check if localStorage should be used instead of Supabase
   */
  shouldUseLocalStorage(): boolean {
    return localStorage.getItem(this.USE_LOCALSTORAGE_KEY) === "true";
  }

  /**
   * Enable localStorage mode
   */
  enableLocalStorageMode(): void {
    localStorage.setItem(this.USE_LOCALSTORAGE_KEY, "true");
    this.initializeData();
  }

  /**
   * Disable localStorage mode
   */
  disableLocalStorageMode(): void {
    localStorage.setItem(this.USE_LOCALSTORAGE_KEY, "false");
  }

  /**
   * Initialize localStorage with mock data if it doesn't exist
   */
  initializeData(): void {
    const existingData = this.getData();
    if (!existingData) {
      this.setData(this.createMockData());
    }
  }

  /**
   * Get all data from localStorage
   */
  getData(): LocalStorageData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  /**
   * Set data to localStorage
   */
  setData(data: LocalStorageData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }

  /**
   * Authentication Methods
   */
  async signIn(
    email: string,
    password: string
  ): Promise<LocalStorageAuthSession> {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // In real implementation, you'd verify password
    const session = this.createAuthSession(user);
    this.setAuthSession(session);
    return session;
  }

  async signUp(
    email: string,
    password: string,
    userData: {
      first_name: string;
      last_name: string;
      role: "admin" | "trainer" | "student";
    }
  ): Promise<LocalStorageAuthSession> {
    const users = this.getUsers();

    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const userId = `${userData.role}_${Date.now()}`;
    const now = new Date().toISOString();

    // Create user
    const user: LocalStorageUser = {
      id: userId,
      email,
      created_at: now,
      email_confirmed_at: now,
      last_sign_in_at: now,
    };

    // Create profile
    const profile: LocalStorageProfile = {
      id: userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: null,
      role: userData.role,
      created_at: now,
      updated_at: now,
    };

    // Update localStorage
    const data = this.getData();
    if (data) {
      data.users.push(user);
      data.profiles.push(profile);

      // Create role-specific profile
      if (userData.role === "trainer") {
        data.trainer_profiles.push({
          id: userId,
          plan: "free",
          max_students: 5,
          ai_credits: 10,
          active_until: null,
          avatar_url: null,
          bio: null,
          whatsapp_number: null,
          created_at: now,
          updated_at: now,
        });
      } else if (userData.role === "student") {
        data.student_profiles.push({
          id: userId,
          trainer_id: this.DEMO_TRAINER_ID,
          gender: null,
          menstrual_cycle_tracking: false,
          start_date: now,
          status: "active",
          created_at: now,
          updated_at: now,
        });
      }

      this.setData(data);
    }

    const session = this.createAuthSession(user);
    this.setAuthSession(session);
    return session;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.AUTH_KEY);
  }

  getCurrentSession(): LocalStorageAuthSession | null {
    try {
      const session = localStorage.getItem(this.AUTH_KEY);
      if (!session) return null;

      const parsed = JSON.parse(session);

      // Check if session is expired
      if (Date.now() > parsed.expires_at) {
        this.signOut();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Error reading auth session:", error);
      return null;
    }
  }

  private createAuthSession(user: LocalStorageUser): LocalStorageAuthSession {
    return {
      user,
      access_token: `mock_token_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_${user.id}_${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      token_type: "bearer",
    };
  }

  private setAuthSession(session: LocalStorageAuthSession): void {
    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Error saving auth session:", error);
    }
  }

  getUsers(): LocalStorageUser[] {
    const data = this.getData();
    return data?.users || [];
  }

  getProfiles(): LocalStorageProfile[] {
    const data = this.getData();
    return data?.profiles || [];
  }

  getProfileByUserId(userId: string): LocalStorageProfile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === userId) || null;
  }

  getTrainerProfileByUserId(userId: string): LocalStorageTrainerProfile | null {
    const data = this.getData();
    return data?.trainer_profiles.find((tp) => tp.id === userId) || null;
  }

  getStudentProfileByUserId(userId: string): LocalStorageStudentProfile | null {
    const data = this.getData();
    return data?.student_profiles.find((sp) => sp.id === userId) || null;
  }

  /**
   * Create comprehensive mock data for testing
   */
  private createMockData(): LocalStorageData {
    const now = new Date().toISOString();
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    // Create demo users
    const demoUsers: LocalStorageUser[] = [
      {
        id: this.DEMO_ADMIN_ID,
        email: "admin@fitcoach.com",
        created_at: lastMonth.toISOString(),
        email_confirmed_at: lastMonth.toISOString(),
        last_sign_in_at: now,
      },
      {
        id: this.DEMO_TRAINER_ID,
        email: "trainer@fitcoach.com",
        created_at: lastMonth.toISOString(),
        email_confirmed_at: lastMonth.toISOString(),
        last_sign_in_at: now,
      },
      {
        id: this.DEMO_STUDENT_ID,
        email: "student@fitcoach.com",
        created_at: lastMonth.toISOString(),
        email_confirmed_at: lastMonth.toISOString(),
        last_sign_in_at: now,
      },
    ];

    // Create demo profiles
    const demoProfiles: LocalStorageProfile[] = [
      {
        id: this.DEMO_ADMIN_ID,
        first_name: "Admin",
        last_name: "FitCoach",
        phone: "+55 11 99999-9999",
        role: "admin",
        created_at: lastMonth.toISOString(),
        updated_at: now,
      },
      {
        id: this.DEMO_TRAINER_ID,
        first_name: "Personal",
        last_name: "Trainer",
        phone: "+55 11 98888-8888",
        role: "trainer",
        created_at: lastMonth.toISOString(),
        updated_at: now,
      },
      {
        id: this.DEMO_STUDENT_ID,
        first_name: "Ana",
        last_name: "Silva",
        phone: "+55 11 97777-7777",
        role: "student",
        created_at: lastMonth.toISOString(),
        updated_at: now,
      },
    ];

    return {
      // Authentication
      auth_session: null,
      users: demoUsers,
      profiles: demoProfiles,

      // Trainer profiles
      trainer_profiles: [
        {
          id: this.DEMO_TRAINER_ID,
          plan: "pro",
          max_students: 40,
          ai_credits: 25,
          active_until: new Date(
            today.getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          avatar_url: null,
          bio: "Personal trainer especializado em emagrecimento e hipertrofia",
          whatsapp_number: "+5511988888888",
          created_at: lastMonth.toISOString(),
          updated_at: now,
        },
      ],

      // Student profiles
      student_profiles: [
        {
          id: this.DEMO_STUDENT_ID,
          trainer_id: this.DEMO_TRAINER_ID,
          gender: "female",
          menstrual_cycle_tracking: true,
          start_date: lastMonth.toISOString(),
          status: "active",
          created_at: lastMonth.toISOString(),
          updated_at: now,
        },
        {
          id: "student_1",
          trainer_id: this.DEMO_TRAINER_ID,
          gender: "female",
          menstrual_cycle_tracking: false,
          start_date: new Date(
            today.getTime() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          created_at: new Date(
            today.getTime() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: now,
        },
        {
          id: "student_2",
          trainer_id: this.DEMO_TRAINER_ID,
          gender: "male",
          menstrual_cycle_tracking: false,
          start_date: new Date(
            today.getTime() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          created_at: new Date(
            today.getTime() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: now,
        },
      ],
      students: [
        {
          id: "student_1",
          trainer_id: this.DEMO_TRAINER_ID,
          status: "active",
          created_at: new Date(
            today.getTime() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Ana",
            last_name: "Silva",
          },
        },
        {
          id: "student_2",
          trainer_id: this.DEMO_TRAINER_ID,
          status: "active",
          created_at: new Date(
            today.getTime() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Carlos",
            last_name: "Santos",
          },
        },
        {
          id: "student_3",
          trainer_id: this.DEMO_TRAINER_ID,
          status: "active",
          created_at: new Date(
            today.getTime() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Maria",
            last_name: "Costa",
          },
        },
        {
          id: "student_4",
          trainer_id: this.DEMO_TRAINER_ID,
          status: "active",
          created_at: new Date(
            today.getTime() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "João",
            last_name: "Oliveira",
          },
        },
        {
          id: "student_5",
          trainer_id: this.DEMO_TRAINER_ID,
          status: "active",
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: "Fernanda",
            last_name: "Lima",
          },
        },
      ],
      sessions: [
        // Today's sessions
        {
          id: "session_1",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_1",
          scheduled_at: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            9,
            0
          ).toISOString(),
          duration_minutes: 60,
          status: "scheduled",
          created_at: new Date(
            today.getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: now,
          profiles: {
            first_name: "Ana",
            last_name: "Silva",
          },
        },
        {
          id: "session_2",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_2",
          scheduled_at: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            14,
            30
          ).toISOString(),
          duration_minutes: 45,
          status: "scheduled",
          created_at: new Date(
            today.getTime() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: now,
          profiles: {
            first_name: "Carlos",
            last_name: "Santos",
          },
        },
        // Tomorrow's sessions
        {
          id: "session_3",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_3",
          scheduled_at: new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            tomorrow.getDate(),
            10,
            0
          ).toISOString(),
          duration_minutes: 60,
          status: "scheduled",
          created_at: yesterday.toISOString(),
          updated_at: now,
          profiles: {
            first_name: "Maria",
            last_name: "Costa",
          },
        },
        // Next week sessions
        {
          id: "session_4",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_4",
          scheduled_at: new Date(
            nextWeek.getFullYear(),
            nextWeek.getMonth(),
            nextWeek.getDate(),
            16,
            0
          ).toISOString(),
          duration_minutes: 50,
          status: "scheduled",
          created_at: now,
          updated_at: now,
          profiles: {
            first_name: "João",
            last_name: "Oliveira",
          },
        },
        // Completed sessions
        {
          id: "session_5",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_1",
          scheduled_at: yesterday.toISOString(),
          duration_minutes: 60,
          status: "completed",
          created_at: new Date(
            yesterday.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: yesterday.toISOString(),
          profiles: {
            first_name: "Ana",
            last_name: "Silva",
          },
        },
        {
          id: "session_6",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_2",
          scheduled_at: new Date(
            yesterday.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          duration_minutes: 45,
          status: "completed",
          created_at: new Date(
            yesterday.getTime() - 48 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            yesterday.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Carlos",
            last_name: "Santos",
          },
        },
      ],
      payments: [
        {
          id: "payment_1",
          trainer_id: this.DEMO_TRAINER_ID,
          amount: 15000, // R$ 150.00 (in cents)
          status: "succeeded",
          created_at: new Date(
            today.getTime() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "payment_2",
          trainer_id: this.DEMO_TRAINER_ID,
          amount: 12000, // R$ 120.00 (in cents)
          status: "succeeded",
          created_at: new Date(
            today.getTime() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "payment_3",
          trainer_id: this.DEMO_TRAINER_ID,
          amount: 18000, // R$ 180.00 (in cents)
          status: "succeeded",
          created_at: new Date(
            today.getTime() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
      diet_plans: [
        {
          id: "diet_1",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_1",
          name: "Plano de Emagrecimento",
          created_at: new Date(
            today.getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Ana",
            last_name: "Silva",
          },
        },
        {
          id: "diet_2",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_3",
          name: "Dieta para Ganho de Massa",
          created_at: new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Maria",
            last_name: "Costa",
          },
        },
        {
          id: "diet_3",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_5",
          name: "Plano Detox",
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: "Fernanda",
            last_name: "Lima",
          },
        },
      ],
      workout_plans: [
        {
          id: "workout_1",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_2",
          name: "Treino de Força",
          created_at: new Date(
            today.getTime() - 4 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "Carlos",
            last_name: "Santos",
          },
        },
        {
          id: "workout_2",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_4",
          name: "Cardio Intensivo",
          created_at: new Date(
            today.getTime() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          profiles: {
            first_name: "João",
            last_name: "Oliveira",
          },
        },
        {
          id: "workout_3",
          trainer_id: this.DEMO_TRAINER_ID,
          student_id: "student_1",
          name: "Treino Funcional",
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: "Ana",
            last_name: "Silva",
          },
        },
      ],

      // Notifications
      notifications: [
        {
          id: "notif_1",
          user_id: this.DEMO_TRAINER_ID,
          title: "Nova sessão agendada",
          message: "Ana Silva agendou uma sessão para hoje às 09:00",
          type: "session",
          read: false,
          created_at: new Date(
            today.getTime() - 2 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "notif_2",
          user_id: this.DEMO_STUDENT_ID,
          title: "Novo plano de treino",
          message:
            "Seu personal trainer criou um novo plano de treino para você",
          type: "workout",
          read: false,
          created_at: new Date(
            today.getTime() - 4 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "notif_3",
          user_id: this.DEMO_ADMIN_ID,
          title: "Novo trainer cadastrado",
          message: "Um novo personal trainer se cadastrou na plataforma",
          type: "user",
          read: true,
          created_at: yesterday.toISOString(),
        },
      ],

      // System settings
      system_settings: [
        {
          id: "setting_1",
          key: "platform_commission",
          value: "10",
          description: "Comissão da plataforma em porcentagem",
          created_at: lastMonth.toISOString(),
          updated_at: now,
        },
        {
          id: "setting_2",
          key: "max_free_students",
          value: "5",
          description: "Número máximo de alunos no plano gratuito",
          created_at: lastMonth.toISOString(),
          updated_at: now,
        },
        {
          id: "setting_3",
          key: "ai_credits_per_month",
          value: "50",
          description: "Créditos de IA por mês no plano pro",
          created_at: lastMonth.toISOString(),
          updated_at: now,
        },
      ],

      lastUpdated: now,
      dataVersion: "2.0.0",
    };
  }

  /**
   * Subscription and Plan Management
   */
  async upgradeTrainerPlan(
    trainerId: string,
    newPlan: "pro" | "elite"
  ): Promise<void> {
    const data = this.getData();
    if (data) {
      const trainerProfile = data.trainer_profiles.find(
        (tp) => tp.id === trainerId
      );
      if (trainerProfile) {
        trainerProfile.plan = newPlan;
        trainerProfile.max_students = newPlan === "pro" ? 40 : 100;
        trainerProfile.ai_credits = newPlan === "pro" ? 50 : 200;
        trainerProfile.active_until = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        trainerProfile.updated_at = new Date().toISOString();
        this.setData(data);
      }
    }
  }

  /**
   * Student Profile Management
   */
  async updateStudentProfile(
    studentId: string,
    updates: Partial<LocalStorageStudentProfile>
  ): Promise<void> {
    const data = this.getData();
    if (data) {
      const studentProfile = data.student_profiles.find(
        (sp) => sp.id === studentId
      );
      if (studentProfile) {
        Object.assign(studentProfile, updates, {
          updated_at: new Date().toISOString(),
        });
        this.setData(data);
      }
    }
  }

  /**
   * Quick login methods for testing
   */
  async quickLoginAsAdmin(): Promise<LocalStorageAuthSession> {
    const adminUser = this.getUsers().find((u) => u.id === this.DEMO_ADMIN_ID);
    if (!adminUser) throw new Error("Admin user not found");

    const session = this.createAuthSession(adminUser);
    this.setAuthSession(session);
    return session;
  }

  async quickLoginAsTrainer(): Promise<LocalStorageAuthSession> {
    const trainerUser = this.getUsers().find(
      (u) => u.id === this.DEMO_TRAINER_ID
    );
    if (!trainerUser) throw new Error("Trainer user not found");

    const session = this.createAuthSession(trainerUser);
    this.setAuthSession(session);
    return session;
  }

  async quickLoginAsStudent(): Promise<LocalStorageAuthSession> {
    const studentUser = this.getUsers().find(
      (u) => u.id === this.DEMO_STUDENT_ID
    );
    if (!studentUser) throw new Error("Student user not found");

    const session = this.createAuthSession(studentUser);
    this.setAuthSession(session);
    return session;
  }
  /**
   * Add data variations for testing different scenarios
   */
  addDataVariation(variationType: "empty" | "full" | "minimal"): void {
    const baseData = this.createMockData();

    switch (variationType) {
      case "empty":
        this.setData({
          ...baseData,
          students: [],
          sessions: [],
          payments: [],
          diet_plans: [],
          workout_plans: [],
        });
        break;

      case "minimal":
        this.setData({
          ...baseData,
          students: baseData.students.slice(0, 1),
          sessions: baseData.sessions.slice(0, 2),
          payments: baseData.payments.slice(0, 1),
          diet_plans: baseData.diet_plans.slice(0, 1),
          workout_plans: baseData.workout_plans.slice(0, 1),
        });
        break;

      case "full":
      default:
        this.setData(baseData);
        break;
    }
  }

  /**
   * Clear all localStorage data
   */
  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.AUTH_KEY);
  }

  /**
   * Get current trainer ID from session or return demo trainer ID
   */
  getCurrentTrainerId(): string {
    const session = this.getCurrentSession();
    if (session) {
      const profile = this.getProfileByUserId(session.user.id);
      if (profile && profile.role === "trainer") {
        return session.user.id;
      }
    }
    // Default to demo trainer for testing
    return this.DEMO_TRAINER_ID;
  }

  /**
   * Get demo credentials for easy testing
   */
  getDemoCredentials() {
    return {
      admin: { email: "admin@fitcoach.com", password: "admin123" },
      trainer: { email: "trainer@fitcoach.com", password: "trainer123" },
      student: { email: "student@fitcoach.com", password: "student123" },
    };
  }

  /**
   * Export data as JSON for Supabase migration
   */
  exportForSupabase(): string {
    const data = this.getData();
    if (!data) return "{}";

    // Transform data to match Supabase structure
    const supabaseData = {
      // Users and profiles
      profiles: data.profiles,
      trainer_profiles: data.trainer_profiles,
      student_profiles: data.student_profiles.map((sp) => ({
        id: sp.id,
        trainer_id: sp.trainer_id,
        gender: sp.gender,
        menstrual_cycle_tracking: sp.menstrual_cycle_tracking,
        start_date: sp.start_date,
        status: sp.status,
        created_at: sp.created_at,
        updated_at: sp.updated_at,
      })),

      // Sessions and bookings
      sessions: data.sessions.map((session) => ({
        id: session.id,
        trainer_id: session.trainer_id,
        student_id: session.student_id,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
        created_at: session.created_at,
        updated_at: session.updated_at,
      })),

      // Financial
      payment_intents: data.payments,

      // Training content
      diet_plans: data.diet_plans.map((plan) => ({
        id: plan.id,
        trainer_id: plan.trainer_id,
        student_id: plan.student_id,
        name: plan.name,
        created_at: plan.created_at,
      })),
      workout_plans: data.workout_plans.map((plan) => ({
        id: plan.id,
        trainer_id: plan.trainer_id,
        student_id: plan.student_id,
        name: plan.name,
        created_at: plan.created_at,
      })),

      // System
      notifications: data.notifications,
      system_settings: data.system_settings,
    };

    return JSON.stringify(supabaseData, null, 2);
  }
}

export const localStorageService = new LocalStorageService();

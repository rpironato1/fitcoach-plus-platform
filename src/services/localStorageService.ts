/**
 * LocalStorage Service for FitCoach Plus Platform
 * 
 * This service provides localStorage-based data management
 * structured to be compatible with Supabase for easy migration.
 * The JSON structure mirrors Supabase database schema.
 */

export interface LocalStorageTrainerProfile {
  id: string;
  plan: 'free' | 'pro' | 'elite';
  max_students: number;
  ai_credits: number;
  created_at: string;
  updated_at: string;
}

export interface LocalStorageStudent {
  id: string;
  trainer_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface LocalStorageSession {
  id: string;
  trainer_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
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
  status: 'succeeded' | 'pending' | 'failed';
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
  trainer_profiles: LocalStorageTrainerProfile[];
  students: LocalStorageStudent[];
  sessions: LocalStorageSession[];
  payments: LocalStoragePayment[];
  diet_plans: LocalStorageDietPlan[];
  workout_plans: LocalStorageWorkoutPlan[];
  lastUpdated: string;
}

class LocalStorageService {
  private readonly STORAGE_KEY = 'fitcoach_data';
  private readonly CURRENT_TRAINER_ID = 'trainer_123'; // Simulated trainer ID

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
      console.error('Error reading from localStorage:', error);
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
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Get current trainer ID (simulated)
   */
  getCurrentTrainerId(): string {
    return this.CURRENT_TRAINER_ID;
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
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    return {
      trainer_profiles: [
        {
          id: this.CURRENT_TRAINER_ID,
          plan: 'pro',
          max_students: 40,
          ai_credits: 25,
          created_at: lastMonth.toISOString(),
          updated_at: now,
        }
      ],
      students: [
        {
          id: 'student_1',
          trainer_id: this.CURRENT_TRAINER_ID,
          status: 'active',
          created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Ana',
            last_name: 'Silva'
          }
        },
        {
          id: 'student_2',
          trainer_id: this.CURRENT_TRAINER_ID,
          status: 'active',
          created_at: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Carlos',
            last_name: 'Santos'
          }
        },
        {
          id: 'student_3',
          trainer_id: this.CURRENT_TRAINER_ID,
          status: 'active',
          created_at: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Maria',
            last_name: 'Costa'
          }
        },
        {
          id: 'student_4',
          trainer_id: this.CURRENT_TRAINER_ID,
          status: 'active',
          created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'João',
            last_name: 'Oliveira'
          }
        },
        {
          id: 'student_5',
          trainer_id: this.CURRENT_TRAINER_ID,
          status: 'active',
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: 'Fernanda',
            last_name: 'Lima'
          }
        }
      ],
      sessions: [
        // Today's sessions
        {
          id: 'session_1',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_1',
          scheduled_at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now,
          profiles: {
            first_name: 'Ana',
            last_name: 'Silva'
          }
        },
        {
          id: 'session_2',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_2',
          scheduled_at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).toISOString(),
          duration_minutes: 45,
          status: 'scheduled',
          created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now,
          profiles: {
            first_name: 'Carlos',
            last_name: 'Santos'
          }
        },
        // Tomorrow's sessions
        {
          id: 'session_3',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_3',
          scheduled_at: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0).toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          created_at: yesterday.toISOString(),
          updated_at: now,
          profiles: {
            first_name: 'Maria',
            last_name: 'Costa'
          }
        },
        // Next week sessions
        {
          id: 'session_4',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_4',
          scheduled_at: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 16, 0).toISOString(),
          duration_minutes: 50,
          status: 'scheduled',
          created_at: now,
          updated_at: now,
          profiles: {
            first_name: 'João',
            last_name: 'Oliveira'
          }
        },
        // Completed sessions
        {
          id: 'session_5',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_1',
          scheduled_at: yesterday.toISOString(),
          duration_minutes: 60,
          status: 'completed',
          created_at: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: yesterday.toISOString(),
          profiles: {
            first_name: 'Ana',
            last_name: 'Silva'
          }
        },
        {
          id: 'session_6',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_2',
          scheduled_at: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 45,
          status: 'completed',
          created_at: new Date(yesterday.getTime() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Carlos',
            last_name: 'Santos'
          }
        }
      ],
      payments: [
        {
          id: 'payment_1',
          trainer_id: this.CURRENT_TRAINER_ID,
          amount: 15000, // R$ 150.00 (in cents)
          status: 'succeeded',
          created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'payment_2',
          trainer_id: this.CURRENT_TRAINER_ID,
          amount: 12000, // R$ 120.00 (in cents)
          status: 'succeeded',
          created_at: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'payment_3',
          trainer_id: this.CURRENT_TRAINER_ID,
          amount: 18000, // R$ 180.00 (in cents)
          status: 'succeeded',
          created_at: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      diet_plans: [
        {
          id: 'diet_1',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_1',
          name: 'Plano de Emagrecimento',
          created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Ana',
            last_name: 'Silva'
          }
        },
        {
          id: 'diet_2',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_3',
          name: 'Dieta para Ganho de Massa',
          created_at: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Maria',
            last_name: 'Costa'
          }
        },
        {
          id: 'diet_3',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_5',
          name: 'Plano Detox',
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: 'Fernanda',
            last_name: 'Lima'
          }
        }
      ],
      workout_plans: [
        {
          id: 'workout_1',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_2',
          name: 'Treino de Força',
          created_at: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'Carlos',
            last_name: 'Santos'
          }
        },
        {
          id: 'workout_2',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_4',
          name: 'Cardio Intensivo',
          created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          profiles: {
            first_name: 'João',
            last_name: 'Oliveira'
          }
        },
        {
          id: 'workout_3',
          trainer_id: this.CURRENT_TRAINER_ID,
          student_id: 'student_1',
          name: 'Treino Funcional',
          created_at: yesterday.toISOString(),
          profiles: {
            first_name: 'Ana',
            last_name: 'Silva'
          }
        }
      ],
      lastUpdated: now
    };
  }

  /**
   * Add data variations for testing different scenarios
   */
  addDataVariation(variationType: 'empty' | 'full' | 'minimal'): void {
    const baseData = this.createMockData();
    
    switch (variationType) {
      case 'empty':
        this.setData({
          ...baseData,
          students: [],
          sessions: [],
          payments: [],
          diet_plans: [],
          workout_plans: []
        });
        break;
        
      case 'minimal':
        this.setData({
          ...baseData,
          students: baseData.students.slice(0, 1),
          sessions: baseData.sessions.slice(0, 2),
          payments: baseData.payments.slice(0, 1),
          diet_plans: baseData.diet_plans.slice(0, 1),
          workout_plans: baseData.workout_plans.slice(0, 1)
        });
        break;
        
      case 'full':
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
  }

  /**
   * Export data as JSON for Supabase migration
   */
  exportForSupabase(): string {
    const data = this.getData();
    if (!data) return '{}';
    
    // Transform data to match Supabase structure
    const supabaseData = {
      trainer_profiles: data.trainer_profiles,
      student_profiles: data.students.map(student => ({
        id: student.id,
        trainer_id: student.trainer_id,
        status: student.status,
        created_at: student.created_at,
        // profiles table would be separate in Supabase
        first_name: student.profiles.first_name,
        last_name: student.profiles.last_name
      })),
      sessions: data.sessions.map(session => ({
        id: session.id,
        trainer_id: session.trainer_id,
        student_id: session.student_id,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
        created_at: session.created_at,
        updated_at: session.updated_at
      })),
      payment_intents: data.payments,
      diet_plans: data.diet_plans.map(plan => ({
        id: plan.id,
        trainer_id: plan.trainer_id,
        student_id: plan.student_id,
        name: plan.name,
        created_at: plan.created_at
      })),
      workout_plans: data.workout_plans.map(plan => ({
        id: plan.id,
        trainer_id: plan.trainer_id,
        student_id: plan.student_id,
        name: plan.name,
        created_at: plan.created_at
      }))
    };
    
    return JSON.stringify(supabaseData, null, 2);
  }
}

export const localStorageService = new LocalStorageService();
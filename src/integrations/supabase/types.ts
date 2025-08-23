export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_credit_ledger: {
        Row: {
          amount: number
          id: string
          trainer_id: string
          type: string
          used_at: string
        }
        Insert: {
          amount: number
          id?: string
          trainer_id: string
          type: string
          used_at?: string
        }
        Update: {
          amount?: number
          id?: string
          trainer_id?: string
          type?: string
          used_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_paid: boolean
          name: string
          student_id: string
          total_calories: number | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_paid?: boolean
          name: string
          student_id: string
          total_calories?: number | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_paid?: boolean
          name?: string
          student_id?: string
          total_calories?: number | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          created_at: string
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          rpe: number | null
          set_number: number
          weight_kg: number | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_number: number
          weight_kg?: number | null
          workout_session_id: string
        }
        Update: {
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_number?: number
          weight_kg?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number | null
          equipment: string | null
          id: string
          instructions: string | null
          is_public: boolean
          muscle_groups: string[]
          name: string
          trainer_id: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean
          muscle_groups: string[]
          name: string
          trainer_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_public?: boolean
          muscle_groups?: string[]
          name?: string
          trainer_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string
          fee_percent: number
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          student_id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee_percent: number
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          student_id: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee_percent?: number
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          student_id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_processor_config: {
        Row: {
          created_at: string
          id: string
          markup_percent: number
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          markup_percent?: number
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          markup_percent?: number
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          payment_intent_id: string | null
          scheduled_at: string
          status: string
          student_id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          scheduled_at: string
          status?: string
          student_id: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string
          gender: string | null
          id: string
          menstrual_cycle_tracking: boolean
          start_date: string
          status: Database["public"]["Enums"]["student_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gender?: string | null
          id: string
          menstrual_cycle_tracking?: boolean
          start_date?: string
          status?: Database["public"]["Enums"]["student_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gender?: string | null
          id?: string
          menstrual_cycle_tracking?: boolean
          start_date?: string
          status?: Database["public"]["Enums"]["student_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      trainer_profiles: {
        Row: {
          active_until: string | null
          ai_credits: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          max_students: number
          plan: Database["public"]["Enums"]["trainer_plan"]
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          active_until?: string | null
          ai_credits?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          max_students?: number
          plan?: Database["public"]["Enums"]["trainer_plan"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          active_until?: string | null
          ai_credits?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          max_students?: number
          plan?: Database["public"]["Enums"]["trainer_plan"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      workout_plan_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_in_workout: number
          rest_seconds: number | null
          target_reps: string | null
          target_sets: number
          target_weight_kg: number | null
          workout_plan_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_in_workout: number
          rest_seconds?: number | null
          target_reps?: string | null
          target_sets?: number
          target_weight_kg?: number | null
          workout_plan_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_in_workout?: number
          rest_seconds?: number | null
          target_reps?: string | null
          target_sets?: number
          target_weight_kg?: number | null
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number | null
          estimated_duration_minutes: number
          id: string
          is_template: boolean
          muscle_groups: string[]
          name: string
          student_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number
          id?: string
          is_template?: boolean
          muscle_groups: string[]
          name: string
          student_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number
          id?: string
          is_template?: boolean
          muscle_groups?: string[]
          name?: string
          student_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          rating: number | null
          scheduled_date: string
          status: string
          student_id: string
          trainer_id: string
          updated_at: string
          workout_plan_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          scheduled_date: string
          status?: string
          student_id: string
          trainer_id: string
          updated_at?: string
          workout_plan_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          scheduled_date?: string
          status?: string
          student_id?: string
          trainer_id?: string
          updated_at?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      payment_method: "credit_card" | "pix" | "bank_transfer"
      payment_status: "pending" | "succeeded" | "failed" | "cancelled"
      student_status: "active" | "paused" | "cancelled"
      trainer_plan: "free" | "pro" | "elite"
      user_role: "admin" | "trainer" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["credit_card", "pix", "bank_transfer"],
      payment_status: ["pending", "succeeded", "failed", "cancelled"],
      student_status: ["active", "paused", "cancelled"],
      trainer_plan: ["free", "pro", "elite"],
      user_role: ["admin", "trainer", "student"],
    },
  },
} as const

/**
 * Simplified Database Types for LocalStorage-only Implementation
 *
 * These types replace the Supabase-generated types and are optimized
 * for localStorage usage.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: "admin" | "trainer" | "student";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role: "admin" | "trainer" | "student";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: "admin" | "trainer" | "student";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trainer_profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          plan?: "free" | "pro" | "elite";
          max_students?: number;
          ai_credits?: number;
          active_until?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan?: "free" | "pro" | "elite";
          max_students?: number;
          ai_credits?: number;
          active_until?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          trainer_id: string;
          gender: string | null;
          menstrual_cycle_tracking: boolean;
          start_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          gender?: string | null;
          menstrual_cycle_tracking?: boolean;
          start_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          gender?: string | null;
          menstrual_cycle_tracking?: boolean;
          start_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type TrainerProfile = Database["public"]["Tables"]["trainer_profiles"]["Row"];
type StudentProfile = Database["public"]["Tables"]["student_profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  trainerProfile: TrainerProfile | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(
    null
  );
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // If Supabase is not configured, set loading to false immediately
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);

        if (session?.user) {
          if (mounted) {
            loadUserProfile(session.user.id);
          }
        } else {
          setProfile(null);
          setTrainerProfile(null);
          setStudentProfile(null);
          setLoading(false);
        }
      }
    });

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setLoading(false);
        return;
      }

      if (profileData) {
        setProfile(profileData);

        if (profileData.role === "trainer") {
          const { data: trainerData } = await supabase
            .from("trainer_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (trainerData) {
            setTrainerProfile(trainerData);
          }
        } else if (profileData.role === "student") {
          const { data: studentData } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (studentData) {
            setStudentProfile(studentData);
          }
        }
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    trainerProfile,
    studentProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

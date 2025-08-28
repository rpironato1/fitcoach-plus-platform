import { supabase } from "@/integrations/supabase/client";
import type {
  DietPlan,
  WorkoutSuggestion,
  AIRequest,
  GenerateDietPlanRequest,
  GenerateWorkoutRequest,
  AIUsageStats,
  CreditTransaction,
} from "../types";

export interface IAIService {
  // Diet Plan methods
  generateDietPlan(
    trainerId: string,
    request: GenerateDietPlanRequest
  ): Promise<DietPlan>;
  getDietPlans(trainerId: string): Promise<DietPlan[]>;
  getDietPlan(id: string): Promise<DietPlan | null>;

  // Workout Suggestion methods
  generateWorkoutSuggestion(
    trainerId: string,
    request: GenerateWorkoutRequest
  ): Promise<WorkoutSuggestion>;
  getWorkoutSuggestions(trainerId: string): Promise<WorkoutSuggestion[]>;

  // AI Usage methods
  getAIUsageStats(trainerId: string): Promise<AIUsageStats>;
  getAIRequests(trainerId: string): Promise<AIRequest[]>;

  // Credits methods
  getCreditBalance(trainerId: string): Promise<number>;
  deductCredits(
    trainerId: string,
    amount: number,
    requestId: string
  ): Promise<void>;
  getCreditTransactions(trainerId: string): Promise<CreditTransaction[]>;
}

export class OpenAIService implements IAIService {
  private readonly apiKey: string;
  private readonly model: string = "gpt-3.5-turbo";
  private readonly baseURL: string = "https://api.openai.com/v1";

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
  }

  async generateDietPlan(
    trainerId: string,
    request: GenerateDietPlanRequest
  ): Promise<DietPlan> {
    try {
      // Check credit balance first
      const credits = await this.getCreditBalance(trainerId);
      if (credits < 5) {
        throw new Error(
          "Créditos insuficientes para gerar plano de dieta (necessário: 5 créditos)"
        );
      }

      // Create AI prompt for diet plan
      const prompt = this.createDietPlanPrompt(request);

      // Call OpenAI API (or use Edge Function)
      const aiResponse = await this.callOpenAI(prompt);

      // Parse AI response into diet plan structure
      const dietPlan = this.parseDietPlanResponse(
        aiResponse,
        trainerId,
        request.student_id
      );

      // Save to database
      const { data, error } = await supabase
        .from("diet_plans")
        .insert([dietPlan])
        .select()
        .single();

      if (error) throw error;

      // Record AI request and deduct credits
      await this.recordAIRequest(trainerId, "diet_plan", prompt, aiResponse, 5);
      await this.deductCredits(trainerId, 5, data.id);

      return data;
    } catch (error) {
      console.error("Error generating diet plan:", error);
      // For development, return a mock diet plan
      return this.getMockDietPlan(trainerId, request.student_id);
    }
  }

  async generateWorkoutSuggestion(
    trainerId: string,
    request: GenerateWorkoutRequest
  ): Promise<WorkoutSuggestion> {
    try {
      // Check credit balance first
      const credits = await this.getCreditBalance(trainerId);
      if (credits < 3) {
        throw new Error(
          "Créditos insuficientes para gerar sugestão de treino (necessário: 3 créditos)"
        );
      }

      // Create AI prompt for workout
      const prompt = this.createWorkoutPrompt(request);

      // Call OpenAI API
      const aiResponse = await this.callOpenAI(prompt);

      // Parse AI response
      const workoutSuggestion = this.parseWorkoutResponse(aiResponse);

      // Record AI request and deduct credits
      await this.recordAIRequest(
        trainerId,
        "workout_suggestion",
        prompt,
        aiResponse,
        3
      );
      await this.deductCredits(trainerId, 3, workoutSuggestion.id);

      return workoutSuggestion;
    } catch (error) {
      console.error("Error generating workout suggestion:", error);
      // For development, return a mock workout
      return this.getMockWorkoutSuggestion();
    }
  }

  async getDietPlans(trainerId: string): Promise<DietPlan[]> {
    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDietPlan(id: string): Promise<DietPlan | null> {
    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  async getWorkoutSuggestions(trainerId: string): Promise<WorkoutSuggestion[]> {
    // For now, return mock data since we don't have workout_suggestions table
    return [];
  }

  async getAIUsageStats(trainerId: string): Promise<AIUsageStats> {
    const { data, error } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("trainer_id", trainerId);

    if (error) throw error;

    const requests = data || [];
    const totalCreditsUsed = requests.reduce(
      (sum, req) => sum + req.cost_credits,
      0
    );
    const successfulRequests = requests.filter(
      (req) => req.response && req.response.length > 0
    );

    return {
      total_requests: requests.length,
      credits_used: totalCreditsUsed,
      credits_remaining: await this.getCreditBalance(trainerId),
      most_used_feature: "diet_plan", // Could be calculated from data
      success_rate:
        requests.length > 0
          ? (successfulRequests.length / requests.length) * 100
          : 0,
    };
  }

  async getAIRequests(trainerId: string): Promise<AIRequest[]> {
    const { data, error } = await supabase
      .from("ai_requests")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCreditBalance(trainerId: string): Promise<number> {
    // Get from trainer profile
    const { data, error } = await supabase
      .from("trainer_profiles")
      .select("ai_credits")
      .eq("id", trainerId)
      .single();

    if (error) throw error;
    return data?.ai_credits || 0;
  }

  async deductCredits(
    trainerId: string,
    amount: number,
    requestId: string
  ): Promise<void> {
    // Update trainer credits
    const { error: updateError } = await supabase
      .from("trainer_profiles")
      .update({ ai_credits: supabase.raw(`ai_credits - ${amount}`) })
      .eq("id", trainerId);

    if (updateError) throw updateError;

    // Record credit transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert([
        {
          trainer_id: trainerId,
          type: "usage",
          amount: -amount,
          description: `Uso de IA - ${amount} créditos`,
          ai_request_id: requestId,
        },
      ]);

    if (transactionError) throw transactionError;
  }

  async getCreditTransactions(trainerId: string): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // In production, this would call the OpenAI API
    // For development, return mock response
    return `Mock AI response for prompt: ${prompt.substring(0, 100)}...`;
  }

  private createDietPlanPrompt(request: GenerateDietPlanRequest): string {
    return `Crie um plano de dieta personalizado com as seguintes especificações:
    - Calorias alvo: ${request.target_calories}
    - Duração: ${request.duration_days} dias
    - Restrições dietéticas: ${request.dietary_restrictions?.join(", ") || "Nenhuma"}
    - Preferências: ${request.meal_preferences?.join(", ") || "Nenhuma"}
    - Objetivos: ${request.health_goals.join(", ")}
    
    Forneça um plano detalhado com refeições, ingredientes e informações nutricionais.`;
  }

  private createWorkoutPrompt(request: GenerateWorkoutRequest): string {
    return `Crie uma sugestão de treino com as seguintes especificações:
    - Nível de dificuldade: ${request.difficulty_level}/5
    - Duração: ${request.duration_minutes} minutos
    - Grupos musculares: ${request.muscle_groups.join(", ")}
    - Equipamentos disponíveis: ${request.equipment_available.join(", ")}
    - Objetivos: ${request.fitness_goals.join(", ")}
    
    Forneça exercícios detalhados com séries, repetições e instruções.`;
  }

  private parseDietPlanResponse(
    response: string,
    trainerId: string,
    studentId: string
  ): Omit<DietPlan, "id"> {
    // In production, this would parse the AI response
    // For development, return mock structure
    return {
      trainer_id: trainerId,
      student_id: studentId,
      title: "Plano de Dieta Personalizado",
      description: "Plano gerado por IA baseado nos seus objetivos",
      target_calories: 2000,
      target_protein: 150,
      target_carbs: 200,
      target_fat: 80,
      meals: [],
      duration_days: 7,
      created_at: new Date().toISOString(),
      is_ai_generated: true,
    };
  }

  private parseWorkoutResponse(response: string): WorkoutSuggestion {
    // In production, this would parse the AI response
    // For development, return mock structure
    return {
      id: "ws_" + Math.random().toString(36).substr(2, 9),
      title: "Treino Personalizado",
      description: "Treino gerado por IA baseado nos seus objetivos",
      difficulty_level: 3,
      estimated_duration_minutes: 45,
      muscle_groups: ["Peito", "Tríceps"],
      exercises: [],
      is_ai_generated: true,
    };
  }

  private async recordAIRequest(
    trainerId: string,
    type: string,
    prompt: string,
    response: string,
    credits: number
  ): Promise<void> {
    const { error } = await supabase.from("ai_requests").insert([
      {
        trainer_id: trainerId,
        type,
        prompt,
        response,
        tokens_used: response.length, // Rough estimate
        cost_credits: credits,
      },
    ]);

    if (error) console.error("Error recording AI request:", error);
  }

  private getMockDietPlan(trainerId: string, studentId: string): DietPlan {
    return {
      id: "dp_mock_" + Date.now(),
      trainer_id: trainerId,
      student_id: studentId,
      title: "Plano de Dieta Balanceada",
      description:
        "Plano focado em emagrecimento saudável com refeições equilibradas",
      target_calories: 1800,
      target_protein: 120,
      target_carbs: 180,
      target_fat: 70,
      meals: [],
      duration_days: 7,
      created_at: new Date().toISOString(),
      is_ai_generated: true,
    };
  }

  private getMockWorkoutSuggestion(): WorkoutSuggestion {
    return {
      id: "ws_mock_" + Date.now(),
      title: "Treino Upper Body",
      description: "Treino focado em membros superiores para hipertrofia",
      difficulty_level: 3,
      estimated_duration_minutes: 50,
      muscle_groups: ["Peito", "Costas", "Ombros", "Braços"],
      exercises: [],
      is_ai_generated: true,
    };
  }
}

/**
 * LocalStorage-only AI Service
 * 
 * Provides AI services using only localStorage,
 * removing all OpenAI API dependencies.
 */

import { localStorageService } from '@/services/localStorageService';
import type { 
  DietPlan,
  WorkoutSuggestion,
  AIRequest,
  GenerateDietPlanRequest,
  GenerateWorkoutRequest,
  AIUsageStats,
  CreditTransaction,
  Meal,
  ExerciseSuggestion
} from '../types';

export interface IAIService {
  // Diet Plan methods
  generateDietPlan(trainerId: string, request: GenerateDietPlanRequest): Promise<DietPlan>;
  getDietPlans(trainerId: string): Promise<DietPlan[]>;
  getDietPlan(id: string): Promise<DietPlan | null>;
  
  // Workout Suggestion methods
  generateWorkoutSuggestion(trainerId: string, request: GenerateWorkoutRequest): Promise<WorkoutSuggestion>;
  getWorkoutSuggestions(trainerId: string): Promise<WorkoutSuggestion[]>;
  
  // AI Usage methods
  getAIUsageStats(trainerId: string): Promise<AIUsageStats>;
  getAIRequests(trainerId: string): Promise<AIRequest[]>;
  
  // Credits methods
  getCreditBalance(trainerId: string): Promise<number>;
  deductCredits(trainerId: string, amount: number, requestId: string): Promise<void>;
  getCreditTransactions(trainerId: string): Promise<CreditTransaction[]>;
}

export class LocalStorageAIService implements IAIService {
  
  async generateDietPlan(trainerId: string, request: GenerateDietPlanRequest): Promise<DietPlan> {
    try {
      // Deduct credits first
      const creditsRequired = 5;
      const requestId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.deductCredits(trainerId, creditsRequired, requestId);
      
      // Generate mock diet plan
      const dietPlan: DietPlan = {
        id: `diet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trainer_id: trainerId,
        student_id: request.student_id,
        title: `Plano Alimentar ${request.duration_days} dias`,
        description: `Plano personalizado com ${request.target_calories} calorias/dia`,
        target_calories: request.target_calories,
        target_protein: Math.round(request.target_calories * 0.25 / 4),
        target_carbs: Math.round(request.target_calories * 0.45 / 4),
        target_fat: Math.round(request.target_calories * 0.30 / 9),
        meals: this.generateMockMeals(request.target_calories),
        duration_days: request.duration_days,
        created_at: new Date().toISOString(),
        is_ai_generated: true,
      };
      
      // Save to localStorage
      const data = localStorageService.getData();
      if (data) {
        if (!data.diet_plans) data.diet_plans = [];
        data.diet_plans.push(dietPlan);
        localStorageService.setData(data);
      }
      
      // Record AI request
      await this.recordAIRequest(trainerId, 'diet_plan', JSON.stringify(request), JSON.stringify(dietPlan), creditsRequired);
      
      return dietPlan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw error;
    }
  }

  async getDietPlans(trainerId: string): Promise<DietPlan[]> {
    try {
      const data = localStorageService.getData();
      return data?.diet_plans?.filter(plan => plan.trainer_id === trainerId) || [];
    } catch (error) {
      console.error('Error getting diet plans:', error);
      return [];
    }
  }

  async getDietPlan(id: string): Promise<DietPlan | null> {
    try {
      const data = localStorageService.getData();
      return data?.diet_plans?.find(plan => plan.id === id) || null;
    } catch (error) {
      console.error('Error getting diet plan:', error);
      return null;
    }
  }

  async generateWorkoutSuggestion(trainerId: string, request: GenerateWorkoutRequest): Promise<WorkoutSuggestion> {
    try {
      // Deduct credits first
      const creditsRequired = 3;
      const requestId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.deductCredits(trainerId, creditsRequired, requestId);
      
      // Generate mock workout suggestion
      const workoutSuggestion: WorkoutSuggestion = {
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Treino ${request.muscle_groups.join(' + ')}`,
        description: `Treino focado em ${request.muscle_groups.join(', ')} com duração de ${request.duration_minutes} minutos`,
        difficulty_level: request.difficulty_level,
        estimated_duration_minutes: request.duration_minutes,
        muscle_groups: request.muscle_groups,
        exercises: this.generateMockExercises(request),
        is_ai_generated: true,
      };
      
      // Save to localStorage
      const data = localStorageService.getData();
      if (data) {
        if (!data.workout_suggestions) data.workout_suggestions = [];
        data.workout_suggestions.push(workoutSuggestion);
        localStorageService.setData(data);
      }
      
      // Record AI request
      await this.recordAIRequest(trainerId, 'workout_suggestion', JSON.stringify(request), JSON.stringify(workoutSuggestion), creditsRequired);
      
      return workoutSuggestion;
    } catch (error) {
      console.error('Error generating workout suggestion:', error);
      throw error;
    }
  }

  async getWorkoutSuggestions(trainerId: string): Promise<WorkoutSuggestion[]> {
    try {
      const data = localStorageService.getData();
      return data?.workout_suggestions || [];
    } catch (error) {
      console.error('Error getting workout suggestions:', error);
      return [];
    }
  }

  async getAIUsageStats(trainerId: string): Promise<AIUsageStats> {
    try {
      const data = localStorageService.getData();
      const requests = data?.ai_requests?.filter(req => req.trainer_id === trainerId) || [];
      const transactions = data?.credit_transactions?.filter(tx => tx.trainer_id === trainerId && tx.type === 'usage') || [];
      
      const totalRequests = requests.length;
      const creditsUsed = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const creditsRemaining = await this.getCreditBalance(trainerId);
      
      const featureCount = requests.reduce((acc, req) => {
        acc[req.type] = (acc[req.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsedFeature = Object.keys(featureCount).reduce((a, b) => 
        featureCount[a] > featureCount[b] ? a : b, 'none'
      );
      
      return {
        total_requests: totalRequests,
        credits_used: creditsUsed,
        credits_remaining: creditsRemaining,
        most_used_feature: mostUsedFeature,
        success_rate: 100, // Always 100% in localStorage mode
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return {
        total_requests: 0,
        credits_used: 0,
        credits_remaining: 0,
        most_used_feature: 'none',
        success_rate: 0,
      };
    }
  }

  async getAIRequests(trainerId: string): Promise<AIRequest[]> {
    try {
      const data = localStorageService.getData();
      return data?.ai_requests?.filter(req => req.trainer_id === trainerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
    } catch (error) {
      console.error('Error getting AI requests:', error);
      return [];
    }
  }

  async getCreditBalance(trainerId: string): Promise<number> {
    try {
      const data = localStorageService.getData();
      const trainer = data?.trainer_profiles?.find(t => t.id === trainerId);
      return trainer?.ai_credits || 0;
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return 0;
    }
  }

  async deductCredits(trainerId: string, amount: number, requestId: string): Promise<void> {
    try {
      const data = localStorageService.getData();
      if (!data?.trainer_profiles) throw new Error('Trainer not found');
      
      const trainerIndex = data.trainer_profiles.findIndex(t => t.id === trainerId);
      if (trainerIndex < 0) throw new Error('Trainer not found');
      
      if (data.trainer_profiles[trainerIndex].ai_credits < amount) {
        throw new Error('Insufficient credits');
      }
      
      // Deduct credits
      data.trainer_profiles[trainerIndex].ai_credits -= amount;
      
      // Record transaction
      if (!data.credit_transactions) data.credit_transactions = [];
      data.credit_transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trainer_id: trainerId,
        type: 'usage',
        amount: -amount,
        description: `Uso de IA - ${amount} créditos`,
        ai_request_id: requestId,
        created_at: new Date().toISOString(),
      });
      
      localStorageService.setData(data);
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  async getCreditTransactions(trainerId: string): Promise<CreditTransaction[]> {
    try {
      const data = localStorageService.getData();
      return data?.credit_transactions?.filter(tx => tx.trainer_id === trainerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
    } catch (error) {
      console.error('Error getting credit transactions:', error);
      return [];
    }
  }

  private async recordAIRequest(trainerId: string, type: string, prompt: string, response: string, credits: number): Promise<void> {
    try {
      const data = localStorageService.getData();
      if (!data) return;
      
      if (!data.ai_requests) data.ai_requests = [];
      
      data.ai_requests.push({
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trainer_id: trainerId,
        type: type as AIRequest['type'],
        prompt,
        response,
        tokens_used: Math.floor(response.length / 4), // Rough estimate
        cost_credits: credits,
        created_at: new Date().toISOString(),
      });
      
      localStorageService.setData(data);
    } catch (error) {
      console.error('Error recording AI request:', error);
    }
  }

  private generateMockMeals(targetCalories: number): Meal[] {
    const caloriesPerMeal = Math.floor(targetCalories / 4); // 3 meals + 1 snack
    
    return [
      {
        id: `meal_${Date.now()}_1`,
        name: 'Café da Manhã Balanceado',
        meal_type: 'breakfast',
        calories: caloriesPerMeal,
        protein: Math.floor(caloriesPerMeal * 0.25 / 4),
        carbs: Math.floor(caloriesPerMeal * 0.55 / 4),
        fat: Math.floor(caloriesPerMeal * 0.20 / 9),
        ingredients: [],
        instructions: 'Preparar conforme orientações nutricionais',
        prep_time_minutes: 15,
      },
      {
        id: `meal_${Date.now()}_2`,
        name: 'Almoço Nutritivo',
        meal_type: 'lunch',
        calories: caloriesPerMeal,
        protein: Math.floor(caloriesPerMeal * 0.30 / 4),
        carbs: Math.floor(caloriesPerMeal * 0.45 / 4),
        fat: Math.floor(caloriesPerMeal * 0.25 / 9),
        ingredients: [],
        instructions: 'Preparar conforme orientações nutricionais',
        prep_time_minutes: 30,
      },
      {
        id: `meal_${Date.now()}_3`,
        name: 'Jantar Leve',
        meal_type: 'dinner',
        calories: caloriesPerMeal,
        protein: Math.floor(caloriesPerMeal * 0.35 / 4),
        carbs: Math.floor(caloriesPerMeal * 0.35 / 4),
        fat: Math.floor(caloriesPerMeal * 0.30 / 9),
        ingredients: [],
        instructions: 'Preparar conforme orientações nutricionais',
        prep_time_minutes: 25,
      },
      {
        id: `meal_${Date.now()}_4`,
        name: 'Lanche Saudável',
        meal_type: 'snack',
        calories: caloriesPerMeal,
        protein: Math.floor(caloriesPerMeal * 0.20 / 4),
        carbs: Math.floor(caloriesPerMeal * 0.60 / 4),
        fat: Math.floor(caloriesPerMeal * 0.20 / 9),
        ingredients: [],
        instructions: 'Consumir entre as refeições',
        prep_time_minutes: 5,
      },
    ];
  }

  private generateMockExercises(request: GenerateWorkoutRequest): ExerciseSuggestion[] {
    const exerciseTemplates = {
      peito: { name: 'Flexão de Braços', equipment: 'Peso corporal' },
      costas: { name: 'Remada', equipment: 'Halteres' },
      pernas: { name: 'Agachamento', equipment: 'Peso corporal' },
      braços: { name: 'Rosca Bíceps', equipment: 'Halteres' },
      abdomen: { name: 'Prancha', equipment: 'Peso corporal' },
    };

    const exercises: ExerciseSuggestion[] = [];
    const exercisesPerGroup = Math.max(1, Math.floor(request.duration_minutes / (request.muscle_groups.length * 3)));

    for (const group of request.muscle_groups) {
      const template = exerciseTemplates[group as keyof typeof exerciseTemplates] || exerciseTemplates.peito;
      
      exercises.push({
        name: template.name,
        description: `Exercício para fortalecimento de ${group}`,
        muscle_groups: [group],
        equipment: template.equipment,
        sets: 3,
        reps: request.difficulty_level <= 3 ? '10-12' : '12-15',
        rest_seconds: request.difficulty_level <= 3 ? 60 : 45,
        instructions: 'Execute o movimento de forma controlada, mantendo a postura correta.',
      });
    }

    return exercises;
  }
}
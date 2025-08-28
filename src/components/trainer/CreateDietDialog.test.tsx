import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateDietDialog } from './CreateDietDialog';
import { z } from 'zod';
import React from 'react';

// Mock the hooks
vi.mock('../../hooks/useDietPlans', () => ({
  useDietPlans: vi.fn(),
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

const mockUseDietPlans = vi.mocked(vi.importMock('../../hooks/useDietPlans').useDietPlans);
const mockUseToast = vi.mocked(vi.importMock('../../hooks/use-toast').useToast);

const mockToast = vi.fn();

// Diet plan validation schema using zod
const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  foods: z.array(z.object({
    name: z.string().min(1, 'Food name is required'),
    quantity: z.number().min(0.1, 'Quantity must be at least 0.1'),
    unit: z.string().min(1, 'Unit is required'),
    calories: z.number().min(1, 'Calories must be at least 1'),
    protein: z.number().min(0, 'Protein cannot be negative'),
    carbs: z.number().min(0, 'Carbs cannot be negative'),
    fat: z.number().min(0, 'Fat cannot be negative'),
  })).min(1, 'At least one food item is required'),
  totalCalories: z.number().min(1, 'Total calories must be at least 1'),
  totalProtein: z.number().min(0, 'Total protein cannot be negative'),
  totalCarbs: z.number().min(0, 'Total carbs cannot be negative'),
  totalFat: z.number().min(0, 'Total fat cannot be negative'),
});

const dietPlanSchema = z.object({
  name: z.string()
    .min(3, 'Diet plan name must be at least 3 characters')
    .max(50, 'Diet plan name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description must be less than 300 characters'),
  goals: z.array(z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'performance']))
    .min(1, 'At least one goal must be selected'),
  targetCalories: z.number()
    .min(800, 'Daily calories must be at least 800')
    .max(5000, 'Daily calories cannot exceed 5000'),
  targetProtein: z.number()
    .min(10, 'Daily protein must be at least 10g')
    .max(300, 'Daily protein cannot exceed 300g'),
  targetCarbs: z.number()
    .min(20, 'Daily carbs must be at least 20g')
    .max(800, 'Daily carbs cannot exceed 800g'),
  targetFat: z.number()
    .min(10, 'Daily fat must be at least 10g')
    .max(200, 'Daily fat cannot exceed 200g'),
  meals: z.array(mealSchema)
    .min(3, 'At least 3 meals are required')
    .max(8, 'Maximum 8 meals allowed'),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  duration: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 1 year'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

describe('CreateDietDialog', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;
  const mockCreateDietPlan = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockUseDietPlans.mockReturnValue({
      createDietPlanMutation: { 
        mutate: mockCreateDietPlan, 
        isLoading: false,
        isSuccess: false,
        error: null 
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const openDialog = async () => {
    render(<CreateDietDialog trainerId="trainer123" />, { wrapper });
    const openButton = screen.getByText(/create diet plan/i);
    await user.click(openButton);
  };

  describe('form validation with zod', () => {
    describe('diet plan name validation', () => {
      it('should validate minimum name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/diet plan name/i);
        await user.type(nameInput, 'AB'); // Too short
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/diet plan name must be at least 3 characters/i)).toBeInTheDocument();
      });

      it('should validate maximum name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/diet plan name/i);
        const longName = 'A'.repeat(51); // Too long
        await user.type(nameInput, longName);
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/diet plan name must be less than 50 characters/i)).toBeInTheDocument();
      });

      it('should accept valid name length', async () => {
        await openDialog();
        
        const nameInput = screen.getByLabelText(/diet plan name/i);
        await user.type(nameInput, 'Weight Loss Diet');

        expect(screen.queryByText(/diet plan name must be/i)).not.toBeInTheDocument();
      });
    });

    describe('description validation', () => {
      it('should validate minimum description length', async () => {
        await openDialog();
        
        const descriptionInput = screen.getByLabelText(/description/i);
        await user.type(descriptionInput, 'Too short'); // Less than 10 characters
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });

      it('should validate maximum description length', async () => {
        await openDialog();
        
        const descriptionInput = screen.getByLabelText(/description/i);
        const longDescription = 'A'.repeat(301); // Too long
        await user.type(descriptionInput, longDescription);
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/description must be less than 300 characters/i)).toBeInTheDocument();
      });
    });

    describe('goals validation', () => {
      it('should require at least one goal', async () => {
        await openDialog();
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least one goal must be selected/i)).toBeInTheDocument();
      });

      it('should accept valid goal selection', async () => {
        await openDialog();
        
        const weightLossGoal = screen.getByLabelText(/weight loss/i);
        await user.click(weightLossGoal);

        expect(screen.queryByText(/at least one goal must be selected/i)).not.toBeInTheDocument();
      });
    });

    describe('target macros validation', () => {
      it('should validate minimum calories', async () => {
        await openDialog();
        
        const caloriesInput = screen.getByLabelText(/target calories/i);
        await user.clear(caloriesInput);
        await user.type(caloriesInput, '500'); // Too low
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily calories must be at least 800/i)).toBeInTheDocument();
      });

      it('should validate maximum calories', async () => {
        await openDialog();
        
        const caloriesInput = screen.getByLabelText(/target calories/i);
        await user.clear(caloriesInput);
        await user.type(caloriesInput, '6000'); // Too high
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily calories cannot exceed 5000/i)).toBeInTheDocument();
      });

      it('should validate protein range', async () => {
        await openDialog();
        
        const proteinInput = screen.getByLabelText(/target protein/i);
        await user.clear(proteinInput);
        await user.type(proteinInput, '5'); // Too low
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily protein must be at least 10g/i)).toBeInTheDocument();
      });

      it('should validate maximum protein', async () => {
        await openDialog();
        
        const proteinInput = screen.getByLabelText(/target protein/i);
        await user.clear(proteinInput);
        await user.type(proteinInput, '350'); // Too high
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily protein cannot exceed 300g/i)).toBeInTheDocument();
      });

      it('should validate carbs range', async () => {
        await openDialog();
        
        const carbsInput = screen.getByLabelText(/target carbs/i);
        await user.clear(carbsInput);
        await user.type(carbsInput, '10'); // Too low
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily carbs must be at least 20g/i)).toBeInTheDocument();
      });

      it('should validate fat range', async () => {
        await openDialog();
        
        const fatInput = screen.getByLabelText(/target fat/i);
        await user.clear(fatInput);
        await user.type(fatInput, '5'); // Too low
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/daily fat must be at least 10g/i)).toBeInTheDocument();
      });
    });

    describe('meals validation', () => {
      it('should require at least 3 meals', async () => {
        await openDialog();
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least 3 meals are required/i)).toBeInTheDocument();
      });

      it('should validate maximum meals', async () => {
        await openDialog();
        
        // Add 9 meals (exceeds limit)
        for (let i = 0; i < 9; i++) {
          const addMealButton = screen.getByText(/add meal/i);
          await user.click(addMealButton);
        }
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/maximum 8 meals allowed/i)).toBeInTheDocument();
      });

      it('should validate meal name', async () => {
        await openDialog();
        
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);

        const mealNameInput = screen.getByLabelText(/meal name/i);
        await user.clear(mealNameInput); // Empty name
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/meal name is required/i)).toBeInTheDocument();
      });

      it('should require at least one food item per meal', async () => {
        await openDialog();
        
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);

        const mealNameInput = screen.getByLabelText(/meal name/i);
        await user.type(mealNameInput, 'Breakfast');
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/at least one food item is required/i)).toBeInTheDocument();
      });

      it('should validate food item properties', async () => {
        await openDialog();
        
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);

        const mealNameInput = screen.getByLabelText(/meal name/i);
        await user.type(mealNameInput, 'Breakfast');

        const addFoodButton = screen.getByText(/add food/i);
        await user.click(addFoodButton);

        const foodNameInput = screen.getByLabelText(/food name/i);
        await user.clear(foodNameInput); // Empty food name

        const quantityInput = screen.getByLabelText(/quantity/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '0'); // Invalid quantity

        const caloriesInput = screen.getByLabelText(/calories/i);
        await user.clear(caloriesInput);
        await user.type(caloriesInput, '0'); // Invalid calories
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/food name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/quantity must be at least 0.1/i)).toBeInTheDocument();
        expect(screen.getByText(/calories must be at least 1/i)).toBeInTheDocument();
      });

      it('should validate negative macro values', async () => {
        await openDialog();
        
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);

        const addFoodButton = screen.getByText(/add food/i);
        await user.click(addFoodButton);

        const proteinInput = screen.getByLabelText(/protein/i);
        await user.clear(proteinInput);
        await user.type(proteinInput, '-5'); // Negative protein

        const carbsInput = screen.getByLabelText(/carbs/i);
        await user.clear(carbsInput);
        await user.type(carbsInput, '-10'); // Negative carbs

        const fatInput = screen.getByLabelText(/fat/i);
        await user.clear(fatInput);
        await user.type(fatInput, '-3'); // Negative fat
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/protein cannot be negative/i)).toBeInTheDocument();
        expect(screen.getByText(/carbs cannot be negative/i)).toBeInTheDocument();
        expect(screen.getByText(/fat cannot be negative/i)).toBeInTheDocument();
      });
    });

    describe('duration validation', () => {
      it('should validate minimum duration', async () => {
        await openDialog();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '0'); // Too short
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/duration must be at least 1 day/i)).toBeInTheDocument();
      });

      it('should validate maximum duration', async () => {
        await openDialog();
        
        const durationInput = screen.getByLabelText(/duration/i);
        await user.clear(durationInput);
        await user.type(durationInput, '400'); // Too long
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/duration cannot exceed 1 year/i)).toBeInTheDocument();
      });
    });

    describe('notes validation', () => {
      it('should validate maximum notes length', async () => {
        await openDialog();
        
        const notesInput = screen.getByLabelText(/notes/i);
        const longNotes = 'A'.repeat(501); // Too long
        await user.type(notesInput, longNotes);
        
        const submitButton = screen.getByText(/create diet plan/i);
        await user.click(submitButton);

        expect(screen.getByText(/notes cannot exceed 500 characters/i)).toBeInTheDocument();
      });

      it('should accept valid notes', async () => {
        await openDialog();
        
        const notesInput = screen.getByLabelText(/notes/i);
        await user.type(notesInput, 'This diet plan focuses on sustainable weight loss');

        expect(screen.queryByText(/notes cannot exceed/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission with zod validation', () => {
    const fillValidForm = async () => {
      const nameInput = screen.getByLabelText(/diet plan name/i);
      await user.type(nameInput, 'Weight Loss Plan');

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Comprehensive weight loss diet plan with balanced nutrition');

      const weightLossGoal = screen.getByLabelText(/weight loss/i);
      await user.click(weightLossGoal);

      const caloriesInput = screen.getByLabelText(/target calories/i);
      await user.clear(caloriesInput);
      await user.type(caloriesInput, '1500');

      const proteinInput = screen.getByLabelText(/target protein/i);
      await user.clear(proteinInput);
      await user.type(proteinInput, '120');

      const carbsInput = screen.getByLabelText(/target carbs/i);
      await user.clear(carbsInput);
      await user.type(carbsInput, '150');

      const fatInput = screen.getByLabelText(/target fat/i);
      await user.clear(fatInput);
      await user.type(fatInput, '50');

      // Add 3 meals
      for (let i = 0; i < 3; i++) {
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);

        const mealNameInputs = screen.getAllByLabelText(/meal name/i);
        await user.type(mealNameInputs[i], `Meal ${i + 1}`);

        const addFoodButtons = screen.getAllByText(/add food/i);
        await user.click(addFoodButtons[i]);

        const foodNameInputs = screen.getAllByLabelText(/food name/i);
        await user.type(foodNameInputs[i], `Food ${i + 1}`);

        const quantityInputs = screen.getAllByLabelText(/quantity/i);
        await user.clear(quantityInputs[i]);
        await user.type(quantityInputs[i], '1');

        const unitInputs = screen.getAllByLabelText(/unit/i);
        await user.type(unitInputs[i], 'serving');

        const foodCaloriesInputs = screen.getAllByLabelText(/calories/i);
        await user.clear(foodCaloriesInputs[i]);
        await user.type(foodCaloriesInputs[i], '200');

        const foodProteinInputs = screen.getAllByLabelText(/protein/i);
        await user.clear(foodProteinInputs[i]);
        await user.type(foodProteinInputs[i], '20');

        const foodCarbsInputs = screen.getAllByLabelText(/carbs/i);
        await user.clear(foodCarbsInputs[i]);
        await user.type(foodCarbsInputs[i], '25');

        const foodFatInputs = screen.getAllByLabelText(/fat/i);
        await user.clear(foodFatInputs[i]);
        await user.type(foodFatInputs[i], '8');
      }

      const durationInput = screen.getByLabelText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '30');
    };

    it('should submit valid form successfully', async () => {
      mockCreateDietPlan.mockResolvedValue({ id: '1', name: 'Weight Loss Plan' });
      
      await openDialog();
      await fillValidForm();

      const submitButton = screen.getByText(/create diet plan/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDietPlan).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Weight Loss Plan',
            description: 'Comprehensive weight loss diet plan with balanced nutrition',
            goals: expect.arrayContaining(['weight_loss']),
            targetCalories: 1500,
            targetProtein: 120,
            targetCarbs: 150,
            targetFat: 50,
            meals: expect.arrayContaining([
              expect.objectContaining({
                name: 'Meal 1',
                foods: expect.arrayContaining([
                  expect.objectContaining({
                    name: 'Food 1',
                    quantity: 1,
                    unit: 'serving',
                    calories: 200,
                    protein: 20,
                    carbs: 25,
                    fat: 8,
                  })
                ])
              })
            ]),
            duration: 30,
          })
        );
      });
    });

    it('should not submit form with validation errors', async () => {
      await openDialog();
      
      // Submit form with missing required fields
      const submitButton = screen.getByText(/create diet plan/i);
      await user.click(submitButton);

      expect(mockCreateDietPlan).not.toHaveBeenCalled();
      expect(screen.getByText(/diet plan name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('should calculate total macros correctly', async () => {
      await openDialog();
      await fillValidForm();

      // Check that meal totals are calculated
      expect(screen.getByText(/total calories: 600/i)).toBeInTheDocument(); // 3 meals × 200 calories
      expect(screen.getByText(/total protein: 60g/i)).toBeInTheDocument(); // 3 meals × 20g protein
    });

    it('should validate macro consistency', async () => {
      await openDialog();
      
      // Set targets that don't match meal totals
      const nameInput = screen.getByLabelText(/diet plan name/i);
      await user.type(nameInput, 'Test Plan');

      const caloriesInput = screen.getByLabelText(/target calories/i);
      await user.clear(caloriesInput);
      await user.type(caloriesInput, '2000'); // Much higher than meal totals

      // Add minimal meals
      const addMealButton = screen.getByText(/add meal/i);
      await user.click(addMealButton);
      
      const submitButton = screen.getByText(/create diet plan/i);
      await user.click(submitButton);

      expect(screen.getByText(/meal totals don't match target macros/i)).toBeInTheDocument();
    });
  });

  describe('dietary restrictions and allergies', () => {
    it('should handle dietary restrictions selection', async () => {
      await openDialog();
      
      const vegetarianOption = screen.getByLabelText(/vegetarian/i);
      await user.click(vegetarianOption);

      const glutenFreeOption = screen.getByLabelText(/gluten free/i);
      await user.click(glutenFreeOption);

      expect(vegetarianOption).toBeChecked();
      expect(glutenFreeOption).toBeChecked();
    });

    it('should handle custom allergies input', async () => {
      await openDialog();
      
      const allergiesInput = screen.getByLabelText(/allergies/i);
      await user.type(allergiesInput, 'Nuts, Shellfish');

      expect(allergiesInput).toHaveValue('Nuts, Shellfish');
    });

    it('should validate conflicting dietary restrictions', async () => {
      await openDialog();
      
      const vegetarianOption = screen.getByLabelText(/vegetarian/i);
      await user.click(vegetarianOption);

      // Try to add meat to a meal
      const addMealButton = screen.getByText(/add meal/i);
      await user.click(addMealButton);

      const addFoodButton = screen.getByText(/add food/i);
      await user.click(addFoodButton);

      const foodNameInput = screen.getByLabelText(/food name/i);
      await user.type(foodNameInput, 'Chicken Breast');

      const submitButton = screen.getByText(/create diet plan/i);
      await user.click(submitButton);

      expect(screen.getByText(/contains meat but vegetarian diet selected/i)).toBeInTheDocument();
    });
  });

  describe('accessibility and user experience', () => {
    it('should have proper ARIA labels', async () => {
      await openDialog();

      expect(screen.getByLabelText(/diet plan name/i)).toHaveAttribute('aria-describedby');
      expect(screen.getByLabelText(/target calories/i)).toHaveAttribute('aria-describedby');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    });

    it('should show character count for text inputs', async () => {
      await openDialog();
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText(/16\/300 characters/i)).toBeInTheDocument();
    });

    it('should provide nutritional guidance', async () => {
      await openDialog();

      expect(screen.getByText(/recommended protein: 0.8-1.2g per kg body weight/i)).toBeInTheDocument();
      expect(screen.getByText(/recommended calories vary by activity level/i)).toBeInTheDocument();
    });

    it('should auto-calculate macro percentages', async () => {
      await openDialog();
      
      const caloriesInput = screen.getByLabelText(/target calories/i);
      await user.clear(caloriesInput);
      await user.type(caloriesInput, '2000');

      const proteinInput = screen.getByLabelText(/target protein/i);
      await user.clear(proteinInput);
      await user.type(proteinInput, '150'); // 150g = 600 calories = 30%

      expect(screen.getByText(/protein: 30%/i)).toBeInTheDocument();
    });
  });

  describe('meal planning features', () => {
    it('should support meal templates', async () => {
      await openDialog();
      
      const useTemplateButton = screen.getByText(/use meal template/i);
      await user.click(useTemplateButton);

      const breakfastTemplate = screen.getByText(/healthy breakfast/i);
      await user.click(breakfastTemplate);

      expect(screen.getByDisplayValue(/oatmeal with berries/i)).toBeInTheDocument();
    });

    it('should duplicate meals', async () => {
      await openDialog();
      
      const addMealButton = screen.getByText(/add meal/i);
      await user.click(addMealButton);

      const mealNameInput = screen.getByLabelText(/meal name/i);
      await user.type(mealNameInput, 'Breakfast');

      const duplicateButton = screen.getByText(/duplicate meal/i);
      await user.click(duplicateButton);

      const mealNameInputs = screen.getAllByLabelText(/meal name/i);
      expect(mealNameInputs).toHaveLength(2);
      expect(mealNameInputs[1]).toHaveValue('Breakfast (Copy)');
    });

    it('should reorder meals', async () => {
      await openDialog();
      
      // Add multiple meals
      for (let i = 0; i < 3; i++) {
        const addMealButton = screen.getByText(/add meal/i);
        await user.click(addMealButton);
      }

      const moveUpButton = screen.getAllByText(/move up/i)[2]; // Move third meal up
      await user.click(moveUpButton);

      const mealCards = screen.getAllByTestId('meal-card');
      expect(mealCards[1]).toHaveTextContent('Meal 3');
      expect(mealCards[2]).toHaveTextContent('Meal 2');
    });
  });
});
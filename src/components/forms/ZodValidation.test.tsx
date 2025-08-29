import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import React from 'react';

// Zod validation schemas for testing
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
});

const workoutSchema = z.object({
  name: z.string().min(3, 'Workout name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name is required'),
    sets: z.number().min(1, 'Must have at least 1 set'),
    reps: z.number().min(1, 'Must have at least 1 rep'),
  })).min(1, 'Must have at least one exercise'),
});

const dietPlanSchema = z.object({
  name: z.string().min(3, 'Diet plan name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  calories: z.number().min(800, 'Minimum 800 calories').max(5000, 'Maximum 5000 calories'),
  protein: z.number().min(0, 'Protein cannot be negative'),
  carbs: z.number().min(0, 'Carbs cannot be negative'),
  fats: z.number().min(0, 'Fats cannot be negative'),
  meals: z.array(z.object({
    name: z.string().min(1, 'Meal name is required'),
    calories: z.number().min(1, 'Calories must be positive'),
    ingredients: z.array(z.string()).min(1, 'Must have at least one ingredient'),
  })).min(1, 'Must have at least one meal'),
});

// Mock form components with zod validation
const ValidatedForm = ({ 
  schema, 
  onSubmit, 
  defaultValues = {},
  children 
}: {
  schema: z.ZodSchema;
  onSubmit: (data: any) => void;
  defaultValues?: any;
  children: React.ReactNode;
}) => {
  const [values, setValues] = React.useState(defaultValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validData = schema.parse(values);
      setErrors({});
      onSubmit(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errorMap[path] = err.message;
        });
        setErrors(errorMap);
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} data-testid="validated-form">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            values,
            errors,
            onChange: handleChange,
          });
        }
        return child;
      })}
      <button type="submit">Submit</button>
      {Object.entries(errors).map(([field, error]) => (
        <div key={field} role="alert" data-testid={`error-${field}`}>
          {error}
        </div>
      ))}
    </form>
  );
};

const TextInput = ({ 
  name, 
  label, 
  type = 'text',
  values = {}, 
  errors = {}, 
  onChange 
}: any) => (
  <div>
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={values[name] || ''}
      onChange={(e) => onChange?.(name, e.target.value)}
      data-testid={`input-${name}`}
    />
    {errors[name] && (
      <span role="alert" data-testid={`field-error-${name}`}>
        {errors[name]}
      </span>
    )}
  </div>
);

const NumberInput = ({ 
  name, 
  label, 
  values = {}, 
  errors = {}, 
  onChange 
}: any) => (
  <div>
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type="number"
      value={values[name] || ''}
      onChange={(e) => onChange?.(name, parseFloat(e.target.value) || 0)}
      data-testid={`input-${name}`}
    />
    {errors[name] && (
      <span role="alert" data-testid={`field-error-${name}`}>
        {errors[name]}
      </span>
    )}
  </div>
);

const SelectInput = ({ 
  name, 
  label, 
  options, 
  values = {}, 
  errors = {}, 
  onChange 
}: any) => (
  <div>
    <label htmlFor={name}>{label}</label>
    <select
      id={name}
      name={name}
      value={values[name] || ''}
      onChange={(e) => onChange?.(name, e.target.value)}
      data-testid={`select-${name}`}
    >
      <option value="">Select {label}</option>
      {options.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {errors[name] && (
      <span role="alert" data-testid={`field-error-${name}`}>
        {errors[name]}
      </span>
    )}
  </div>
);

describe('Zod Schema Validation Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe('User Registration Form Validation', () => {
    it('should validate email format', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      const emailInput = screen.getByTestId('input-email');
      const submitButton = screen.getByText('Submit');

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-email')).toHaveTextContent('Invalid email format');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate password length', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      const passwordInput = screen.getByTestId('input-password');
      const submitButton = screen.getByText('Submit');

      await user.type(passwordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-password')).toHaveTextContent('Password must be at least 8 characters');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate age restrictions', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      const ageInput = screen.getByTestId('input-age');
      const submitButton = screen.getByText('Submit');

      await user.clear(ageInput);
      await user.type(ageInput, '16');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-age')).toHaveTextContent('Must be at least 18 years old');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid user data', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      await user.type(screen.getByTestId('input-email'), 'test@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.type(screen.getByTestId('input-name'), 'John Doe');
      await user.clear(screen.getByTestId('input-age'));
      await user.type(screen.getByTestId('input-age'), '25');

      await user.click(screen.getByText('Submit'));

      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        age: 25,
      });
    });
  });

  describe('Workout Creation Form Validation', () => {
    it('should validate workout name length', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={workoutSchema} onSubmit={handleSubmit}>
          <TextInput name="name" label="Workout Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="duration" label="Duration (minutes)" />
          <SelectInput 
            name="difficulty" 
            label="Difficulty" 
            options={['beginner', 'intermediate', 'advanced']} 
          />
        </ValidatedForm>
      );

      const nameInput = screen.getByTestId('input-name');
      await user.type(nameInput, 'AB');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toHaveTextContent('Workout name must be at least 3 characters');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate description length', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={workoutSchema} onSubmit={handleSubmit}>
          <TextInput name="name" label="Workout Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="duration" label="Duration (minutes)" />
          <SelectInput 
            name="difficulty" 
            label="Difficulty" 
            options={['beginner', 'intermediate', 'advanced']} 
          />
        </ValidatedForm>
      );

      const descInput = screen.getByTestId('input-description');
      await user.type(descInput, 'Short');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-description')).toHaveTextContent('Description must be at least 10 characters');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate difficulty selection', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm 
          schema={workoutSchema} 
          onSubmit={handleSubmit}
          defaultValues={{
            name: 'Test Workout',
            description: 'A comprehensive test workout',
            duration: 30,
            exercises: [{ name: 'Push-ups', sets: 3, reps: 10 }]
          }}
        >
          <TextInput name="name" label="Workout Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="duration" label="Duration (minutes)" />
          <SelectInput 
            name="difficulty" 
            label="Difficulty" 
            options={['beginner', 'intermediate', 'advanced']} 
          />
        </ValidatedForm>
      );

      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-difficulty')).toHaveTextContent('Invalid enum value');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Diet Plan Form Validation', () => {
    it('should validate calorie ranges', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={dietPlanSchema} onSubmit={handleSubmit}>
          <TextInput name="name" label="Diet Plan Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="calories" label="Daily Calories" />
          <NumberInput name="protein" label="Protein (g)" />
          <NumberInput name="carbs" label="Carbs (g)" />
          <NumberInput name="fats" label="Fats (g)" />
        </ValidatedForm>
      );

      const caloriesInput = screen.getByTestId('input-calories');
      await user.clear(caloriesInput);
      await user.type(caloriesInput, '500');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-calories')).toHaveTextContent('Minimum 800 calories');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should validate negative macronutrients', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={dietPlanSchema} onSubmit={handleSubmit}>
          <TextInput name="name" label="Diet Plan Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="calories" label="Daily Calories" />
          <NumberInput name="protein" label="Protein (g)" />
          <NumberInput name="carbs" label="Carbs (g)" />
          <NumberInput name="fats" label="Fats (g)" />
        </ValidatedForm>
      );

      const proteinInput = screen.getByTestId('input-protein');
      await user.clear(proteinInput);
      await user.type(proteinInput, '-10');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-protein')).toHaveTextContent('Protein cannot be negative');
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid diet plan data', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm 
          schema={dietPlanSchema} 
          onSubmit={handleSubmit}
          defaultValues={{
            meals: [{ name: 'Breakfast', calories: 400, ingredients: ['Oats', 'Banana'] }]
          }}
        >
          <TextInput name="name" label="Diet Plan Name" />
          <TextInput name="description" label="Description" />
          <NumberInput name="calories" label="Daily Calories" />
          <NumberInput name="protein" label="Protein (g)" />
          <NumberInput name="carbs" label="Carbs (g)" />
          <NumberInput name="fats" label="Fats (g)" />
        </ValidatedForm>
      );

      await user.type(screen.getByTestId('input-name'), 'Healthy Diet');
      await user.type(screen.getByTestId('input-description'), 'A balanced and nutritious diet plan');
      await user.clear(screen.getByTestId('input-calories'));
      await user.type(screen.getByTestId('input-calories'), '2000');
      await user.clear(screen.getByTestId('input-protein'));
      await user.type(screen.getByTestId('input-protein'), '150');
      await user.clear(screen.getByTestId('input-carbs'));
      await user.type(screen.getByTestId('input-carbs'), '200');
      await user.clear(screen.getByTestId('input-fats'));
      await user.type(screen.getByTestId('input-fats'), '80');

      await user.click(screen.getByText('Submit'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Healthy Diet',
        description: 'A balanced and nutritious diet plan',
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 80,
        meals: [{ name: 'Breakfast', calories: 400, ingredients: ['Oats', 'Banana'] }]
      });
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle multiple validation errors', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      await user.type(screen.getByTestId('input-email'), 'invalid');
      await user.type(screen.getByTestId('input-password'), '123');
      await user.type(screen.getByTestId('input-name'), 'A');
      await user.clear(screen.getByTestId('input-age'));
      await user.type(screen.getByTestId('input-age'), '16');

      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-email')).toBeInTheDocument();
        expect(screen.getByTestId('error-password')).toBeInTheDocument();
        expect(screen.getByTestId('error-name')).toBeInTheDocument();
        expect(screen.getByTestId('error-age')).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should clear errors when valid data is entered', async () => {
      const handleSubmit = vi.fn();

      render(
        <ValidatedForm schema={userSchema} onSubmit={handleSubmit}>
          <TextInput name="email" label="Email" type="email" />
          <TextInput name="password" label="Password" type="password" />
          <TextInput name="name" label="Name" />
          <NumberInput name="age" label="Age" />
        </ValidatedForm>
      );

      // First submit with invalid data
      await user.type(screen.getByTestId('input-email'), 'invalid');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('error-email')).toBeInTheDocument();
      });

      // Fix the email and submit again
      await user.clear(screen.getByTestId('input-email'));
      await user.type(screen.getByTestId('input-email'), 'valid@example.com');
      await user.type(screen.getByTestId('input-password'), 'password123');
      await user.type(screen.getByTestId('input-name'), 'John Doe');
      await user.clear(screen.getByTestId('input-age'));
      await user.type(screen.getByTestId('input-age'), '25');

      await user.click(screen.getByText('Submit'));

      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'password123',
        name: 'John Doe',
        age: 25,
      });

      // Error should be cleared
      expect(screen.queryByTestId('error-email')).not.toBeInTheDocument();
    });
  });
});
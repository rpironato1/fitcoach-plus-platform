-- Workout Management System Tables
-- This migration adds the core workout functionality that was missing

-- Exercise library table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] NOT NULL, -- ['chest', 'shoulders', 'triceps']
  equipment TEXT, -- 'dumbbell', 'barbell', 'bodyweight', etc.
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 1,
  instructions TEXT,
  video_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true, -- public exercises vs trainer-created
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null for public exercises
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout plans/templates table
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 1,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 60,
  muscle_groups TEXT[] NOT NULL,
  is_template BOOLEAN NOT NULL DEFAULT true, -- template vs assigned workout
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null for templates
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercises within workout plans
CREATE TABLE public.workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_in_workout INTEGER NOT NULL,
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_reps TEXT, -- '8-12', '15', 'to failure', etc.
  target_weight_kg DECIMAL(5,2),
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workout_plan_id, order_in_workout)
);

-- Actual workout sessions performed
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id),
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'skipped'
  duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- student self-rating
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual exercise sets performed in workout sessions
CREATE TABLE public.exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(5,2),
  duration_seconds INTEGER, -- for time-based exercises
  distance_meters DECIMAL(8,2), -- for cardio
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Public exercises are viewable by everyone" ON public.exercises
  FOR SELECT USING (is_public = true OR trainer_id = auth.uid());

CREATE POLICY "Trainers can manage their own exercises" ON public.exercises
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Students can view exercises in their workouts" ON public.exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      JOIN public.workout_plan_exercises wpe ON wp.id = wpe.workout_plan_id
      WHERE wpe.exercise_id = exercises.id
      AND wp.student_id = auth.uid()
    )
  );

-- RLS Policies for workout_plans
CREATE POLICY "Trainers can view their own workout plans" ON public.workout_plans
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Students can view their assigned workouts" ON public.workout_plans
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Trainers can manage their workout plans" ON public.workout_plans
  FOR ALL USING (trainer_id = auth.uid());

-- RLS Policies for workout_plan_exercises
CREATE POLICY "Users can view workout plan exercises" ON public.workout_plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      WHERE wp.id = workout_plan_exercises.workout_plan_id
      AND (wp.trainer_id = auth.uid() OR wp.student_id = auth.uid())
    )
  );

CREATE POLICY "Trainers can manage workout plan exercises" ON public.workout_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans wp
      WHERE wp.id = workout_plan_exercises.workout_plan_id
      AND wp.trainer_id = auth.uid()
    )
  );

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their workout sessions" ON public.workout_sessions
  FOR SELECT USING (student_id = auth.uid() OR trainer_id = auth.uid());

CREATE POLICY "Trainers can manage workout sessions" ON public.workout_sessions
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Students can update their workout sessions" ON public.workout_sessions
  FOR UPDATE USING (student_id = auth.uid());

-- RLS Policies for exercise_sets
CREATE POLICY "Users can view exercise sets" ON public.exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = exercise_sets.workout_session_id
      AND (ws.student_id = auth.uid() OR ws.trainer_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage exercise sets" ON public.exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = exercise_sets.workout_session_id
      AND (ws.student_id = auth.uid() OR ws.trainer_id = auth.uid())
    )
  );

-- Insert some basic exercises to start with
INSERT INTO public.exercises (name, description, muscle_groups, equipment, difficulty_level, instructions, is_public, trainer_id) VALUES
  ('Flexão de Braço', 'Exercício fundamental para peito, ombros e tríceps', ARRAY['peito', 'ombros', 'triceps'], 'peso_corporal', 2, 'Deite de bruços, mãos na largura dos ombros, suba e desça o corpo mantendo-o reto.', true, null),
  ('Agachamento', 'Exercício fundamental para pernas e glúteos', ARRAY['quadriceps', 'gluteos', 'panturrilha'], 'peso_corporal', 2, 'Pés na largura dos ombros, desça como se fosse sentar numa cadeira, suba novamente.', true, null),
  ('Prancha', 'Exercício isométrico para fortalecimento do core', ARRAY['abdomen', 'core'], 'peso_corporal', 2, 'Apoie-se nos antebraços e pontas dos pés, mantenha o corpo reto como uma prancha.', true, null),
  ('Burpee', 'Exercício funcional completo', ARRAY['corpo_todo'], 'peso_corporal', 4, 'Agachamento, apoio, flexão, pulo. Movimento contínuo e explosivo.', true, null),
  ('Supino Reto', 'Exercício para desenvolvimento do peitoral', ARRAY['peito', 'triceps', 'ombros'], 'barra', 3, 'Deitado no banco, desça a barra até o peito e empurre para cima.', true, null),
  ('Levantamento Terra', 'Exercício fundamental para posterior', ARRAY['gluteos', 'isquiotibiais', 'lombar'], 'barra', 4, 'Pegue a barra do chão com as costas retas, suba estendendo quadril e joelhos.', true, null),
  ('Puxada Frontal', 'Exercício para desenvolvimento das costas', ARRAY['costas', 'biceps'], 'cabo', 3, 'Puxe a barra em direção ao peito, contraia as escápulas.', true, null),
  ('Desenvolvimento Militar', 'Exercício para ombros', ARRAY['ombros', 'triceps'], 'barra', 3, 'Empurre a barra acima da cabeça, partindo dos ombros.', true, null);

-- Create indexes for better performance
CREATE INDEX idx_exercises_muscle_groups ON public.exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_trainer_id ON public.exercises(trainer_id);
CREATE INDEX idx_workout_plans_trainer_id ON public.workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_student_id ON public.workout_plans(student_id);
CREATE INDEX idx_workout_sessions_student_id ON public.workout_sessions(student_id);
CREATE INDEX idx_workout_sessions_trainer_id ON public.workout_sessions(trainer_id);
CREATE INDEX idx_workout_sessions_scheduled_date ON public.workout_sessions(scheduled_date);
CREATE INDEX idx_exercise_sets_workout_session_id ON public.exercise_sets(workout_session_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON public.exercises 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at 
  BEFORE UPDATE ON public.workout_plans 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at 
  BEFORE UPDATE ON public.workout_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
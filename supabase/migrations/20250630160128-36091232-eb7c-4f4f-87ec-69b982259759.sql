
-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'student');

-- Criar enum para planos do trainer
CREATE TYPE trainer_plan AS ENUM ('free', 'pro', 'elite');

-- Criar enum para status do aluno
CREATE TYPE student_status AS ENUM ('active', 'paused', 'cancelled');

-- Criar enum para status de pagamento
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');

-- Criar enum para método de pagamento
CREATE TYPE payment_method AS ENUM ('credit_card', 'pix', 'bank_transfer');

-- Tabela de perfis de usuário (extende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de perfis de personal trainers
CREATE TABLE public.trainer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan trainer_plan NOT NULL DEFAULT 'free',
  active_until TIMESTAMPTZ,
  whatsapp_number TEXT,
  bio TEXT,
  avatar_url TEXT,
  max_students INTEGER NOT NULL DEFAULT 3,
  ai_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de perfis de alunos
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status student_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de configuração do processador de pagamentos
CREATE TABLE public.payment_processor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  markup_percent DECIMAL(5,2) NOT NULL DEFAULT 1.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Tabela de intenções de pagamento
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  fee_percent DECIMAL(5,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de sessões de treino
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES public.payment_intents(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de planos de dieta
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_calories INTEGER,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de créditos de IA
CREATE TABLE public.ai_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'genDiet', 'genWorkout', 'chat'
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_processor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_ledger ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para trainer_profiles
CREATE POLICY "Trainers can view own profile" ON public.trainer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Trainers can update own profile" ON public.trainer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view their trainer profile" ON public.trainer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles 
      WHERE student_profiles.trainer_id = trainer_profiles.id 
      AND student_profiles.id = auth.uid()
    )
  );

-- Políticas RLS para student_profiles
CREATE POLICY "Students can view own profile" ON public.student_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Trainers can view their students" ON public.student_profiles
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their students" ON public.student_profiles
  FOR UPDATE USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert students" ON public.student_profiles
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

-- Políticas RLS para payment_processor_config
CREATE POLICY "Trainers can view own config" ON public.payment_processor_config
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update own config" ON public.payment_processor_config
  FOR UPDATE USING (auth.uid() = trainer_id);

CREATE POLICY "System can insert config" ON public.payment_processor_config
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para payment_intents
CREATE POLICY "Users can view own payment intents" ON public.payment_intents
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = trainer_id);

CREATE POLICY "System can manage payment intents" ON public.payment_intents
  FOR ALL USING (true);

-- Políticas RLS para sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage sessions" ON public.sessions
  FOR ALL USING (auth.uid() = trainer_id);

-- Políticas RLS para diet_plans
CREATE POLICY "Users can view own diet plans" ON public.diet_plans
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can manage diet plans" ON public.diet_plans
  FOR ALL USING (auth.uid() = trainer_id);

-- Políticas RLS para ai_credit_ledger
CREATE POLICY "Trainers can view own credits" ON public.ai_credit_ledger
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "System can manage credits" ON public.ai_credit_ledger
  FOR ALL USING (true);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  
  -- Se for trainer, criar também o trainer_profile
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student') = 'trainer' THEN
    INSERT INTO public.trainer_profiles (id)
    VALUES (NEW.id);
    
    -- Criar configuração de pagamento
    INSERT INTO public.payment_processor_config (trainer_id, markup_percent)
    VALUES (NEW.id, 1.5);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar markup_percent baseado no plano
CREATE OR REPLACE FUNCTION public.update_markup_percent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.payment_processor_config
  SET markup_percent = CASE 
    WHEN NEW.plan = 'free' THEN 1.5
    WHEN NEW.plan = 'pro' THEN 0
    WHEN NEW.plan = 'elite' THEN -0.5
  END,
  updated_at = now()
  WHERE trainer_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar markup quando plano muda
CREATE TRIGGER on_trainer_plan_changed
  AFTER UPDATE OF plan ON public.trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_markup_percent();

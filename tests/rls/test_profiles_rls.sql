-- Testes de RLS para a tabela profiles
-- Verificar se usuários só podem ver/editar seus próprios perfis

BEGIN;

-- Configurar usuários de teste
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('trainer-1-id', 'trainer1@test.com', 'encrypted', now(), now(), now()),
  ('trainer-2-id', 'trainer2@test.com', 'encrypted', now(), now(), now()),
  ('student-1-id', 'student1@test.com', 'encrypted', now(), now(), now());

-- Inserir perfis
INSERT INTO public.profiles (id, first_name, last_name, role)
VALUES 
  ('trainer-1-id', 'Trainer', 'One', 'trainer'),
  ('trainer-2-id', 'Trainer', 'Two', 'trainer'),
  ('student-1-id', 'Student', 'One', 'student');

-- Teste 1: Trainer só pode ver próprio perfil
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "trainer-1-id"}';

SELECT plan(1);
SELECT is(
  (SELECT count(*) FROM public.profiles WHERE id = 'trainer-1-id'),
  1::bigint,
  'Trainer pode ver próprio perfil'
);

-- Teste 2: Trainer não pode ver perfil de outro trainer
SELECT is(
  (SELECT count(*) FROM public.profiles WHERE id = 'trainer-2-id'),
  0::bigint,
  'Trainer não pode ver perfil de outro trainer'
);

-- Teste 3: Trainer pode atualizar próprio perfil
UPDATE public.profiles 
SET first_name = 'Updated' 
WHERE id = 'trainer-1-id';

SELECT is(
  (SELECT first_name FROM public.profiles WHERE id = 'trainer-1-id'),
  'Updated',
  'Trainer pode atualizar próprio perfil'
);

-- Teste 4: Trainer não pode atualizar perfil de outro
UPDATE public.profiles 
SET first_name = 'Hacked' 
WHERE id = 'trainer-2-id';

SELECT is(
  (SELECT first_name FROM public.profiles WHERE id = 'trainer-2-id'),
  'Trainer',
  'Trainer não pode atualizar perfil de outro'
);

SELECT finish();
ROLLBACK;

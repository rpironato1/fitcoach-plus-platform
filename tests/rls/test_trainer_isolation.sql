-- Testes de RLS para isolamento entre trainers e alunos
-- Verificar se trainers só veem seus próprios alunos

BEGIN;

-- Inserir dados de teste
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('trainer-a-id', 'trainera@test.com', 'encrypted', now(), now(), now()),
  ('trainer-b-id', 'trainerb@test.com', 'encrypted', now(), now(), now()),
  ('student-a1-id', 'studenta1@test.com', 'encrypted', now(), now(), now()),
  ('student-a2-id', 'studenta2@test.com', 'encrypted', now(), now(), now()),
  ('student-b1-id', 'studentb1@test.com', 'encrypted', now(), now(), now());

-- Perfis
INSERT INTO public.profiles (id, first_name, last_name, role)
VALUES 
  ('trainer-a-id', 'Trainer', 'A', 'trainer'),
  ('trainer-b-id', 'Trainer', 'B', 'trainer'),
  ('student-a1-id', 'Student', 'A1', 'student'),
  ('student-a2-id', 'Student', 'A2', 'student'),
  ('student-b1-id', 'Student', 'B1', 'student');

-- Vincular alunos aos trainers
INSERT INTO public.student_profiles (id, trainer_id, status)
VALUES 
  ('student-a1-id', 'trainer-a-id', 'active'),
  ('student-a2-id', 'trainer-a-id', 'active'),
  ('student-b1-id', 'trainer-b-id', 'active');

-- Teste como Trainer A
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "trainer-a-id"}';

SELECT plan(4);

-- Teste 1: Trainer A vê apenas seus alunos
SELECT is(
  (SELECT count(*) FROM public.student_profiles WHERE trainer_id = 'trainer-a-id'),
  2::bigint,
  'Trainer A vê seus 2 alunos'
);

-- Teste 2: Trainer A não vê alunos de outro trainer
SELECT is(
  (SELECT count(*) FROM public.student_profiles WHERE trainer_id = 'trainer-b-id'),
  0::bigint,
  'Trainer A não vê alunos do Trainer B'
);

-- Teste 3: Trainer A pode criar sessão para seus alunos
INSERT INTO public.sessions (student_id, trainer_id, scheduled_at)
VALUES ('student-a1-id', 'trainer-a-id', now() + interval '1 day');

SELECT is(
  (SELECT count(*) FROM public.sessions WHERE trainer_id = 'trainer-a-id'),
  1::bigint,
  'Trainer A pode criar sessão para seu aluno'
);

-- Teste 4: Trainer A não pode criar sessão para aluno de outro trainer
INSERT INTO public.sessions (student_id, trainer_id, scheduled_at)
VALUES ('student-b1-id', 'trainer-a-id', now() + interval '1 day');

-- Esta inserção deve falhar devido às políticas RLS
SELECT is(
  (SELECT count(*) FROM public.sessions WHERE student_id = 'student-b1-id'),
  0::bigint,
  'Trainer A não pode criar sessão para aluno de outro trainer'
);

SELECT finish();
ROLLBACK;

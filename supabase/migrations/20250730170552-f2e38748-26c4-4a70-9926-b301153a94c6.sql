-- Criar usuário trainer personal@fitcoach.com
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'personal@fitcoach.com',
  crypt('senha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Personal","last_name":"Trainer","role":"trainer"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Criar perfil do usuário
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT 
  id,
  'Personal',
  'Trainer',
  'trainer'::user_role
FROM auth.users 
WHERE email = 'personal@fitcoach.com';

-- Criar trainer_profile
INSERT INTO public.trainer_profiles (id)
SELECT id FROM auth.users WHERE email = 'personal@fitcoach.com';
-- Criar usuário personal@fitcoach.com no auth.users
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
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Personal","last_name":"Trainer","role":"trainer"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Criar perfil usando o trigger que já existe
-- O trigger handle_new_user() será disparado automaticamente
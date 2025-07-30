-- Atualizar senha e garantir role de trainer para personal@fitcoach.com
UPDATE auth.users 
SET encrypted_password = crypt('senha123', gen_salt('bf')),
    updated_at = now()
WHERE email = 'personal@fitcoach.com';

-- Atualizar role para trainer
UPDATE public.profiles 
SET role = 'trainer'::user_role 
WHERE id = (SELECT id FROM auth.users WHERE email = 'personal@fitcoach.com');
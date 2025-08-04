-- Atualizar senha do usuário personal@fitcoach.com se já existir, ou criar se não existir
DO $$
DECLARE
    user_exists boolean;
    user_uuid uuid;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'personal@fitcoach.com') INTO user_exists;
    
    IF user_exists THEN
        -- Se existe, apenas atualizar a senha
        UPDATE auth.users 
        SET encrypted_password = crypt('senha123', gen_salt('bf')),
            updated_at = now()
        WHERE email = 'personal@fitcoach.com';
        
        -- Atualizar o role para trainer se não for
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'personal@fitcoach.com';
        
        UPDATE public.profiles 
        SET role = 'trainer'::user_role 
        WHERE id = user_uuid AND role != 'trainer';
        
        -- Criar trainer_profile se não existir
        INSERT INTO public.trainer_profiles (id)
        SELECT user_uuid
        WHERE NOT EXISTS (SELECT 1 FROM public.trainer_profiles WHERE id = user_uuid);
        
    ELSE
        -- Se não existe, criar o usuário completo
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
    END IF;
END $$;
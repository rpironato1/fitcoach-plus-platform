-- Alterar senha do usuário admin@fitcoach.com para senha123
UPDATE auth.users 
SET encrypted_password = crypt('senha123', gen_salt('bf'))
WHERE email = 'admin@fitcoach.com';
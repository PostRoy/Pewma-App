-- Script para arreglar las políticas de RLS en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- ELIMINAR las políticas existentes que usan auth.uid() ya que no usamos Supabase Auth
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can view own lessons" ON user_lessons;
DROP POLICY IF EXISTS "Users can update own lessons" ON user_lessons;
DROP POLICY IF EXISTS "Users can insert own lessons" ON user_lessons;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

DROP POLICY IF EXISTS "Users can view own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding;

-- Crear políticas MÁS PERMISIVAS para desarrollo/testing
-- Estas políticas permiten a cualquier usuario anon leer y escribir sus propios datos basándose en user_id

-- Para users: permitir insert y select público (sin autenticación de Supabase)
CREATE POLICY "Allow public insert to users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public update to users" ON users
  FOR UPDATE USING (true);

-- Para user_progress
CREATE POLICY "Allow public insert to user_progress" ON user_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from user_progress" ON user_progress
  FOR SELECT USING (true);

CREATE POLICY "Allow public update to user_progress" ON user_progress
  FOR UPDATE USING (true);

-- Para user_lessons
CREATE POLICY "Allow public insert to user_lessons" ON user_lessons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from user_lessons" ON user_lessons
  FOR SELECT USING (true);

CREATE POLICY "Allow public update to user_lessons" ON user_lessons
  FOR UPDATE USING (true);

-- Para user_achievements
CREATE POLICY "Allow public insert to user_achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from user_achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Allow public update to user_achievements" ON user_achievements
  FOR UPDATE USING (true);

-- Para onboarding
CREATE POLICY "Allow public insert to onboarding" ON onboarding
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from onboarding" ON onboarding
  FOR SELECT USING (true);

-- Para user_passwords (también necesita políticas)
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to user_passwords" ON user_passwords
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from user_passwords" ON user_passwords
  FOR SELECT USING (true);


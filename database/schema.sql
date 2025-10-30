-- SCHEMA PARA PEUMA APP
-- Ejecuta este script en tu base de datos de Supabase (SQL Editor)

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de autenticación (Supabase Auth ya tiene una tabla auth.users)
-- Solo necesitamos almacenar contraseñas de forma segura
CREATE TABLE IF NOT EXISTS user_passwords (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso de usuarios
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_completed_date TIMESTAMPTZ,
  daily_goal INTEGER DEFAULT 20,
  daily_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de lecciones de usuarios (trackeo de lecciones completadas)
CREATE TABLE IF NOT EXISTS user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tabla de logros de usuarios
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Tabla de onboarding
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  daily_goal INTEGER DEFAULT 20,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lessons_user_id ON user_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lessons_lesson_id ON user_lessons(lesson_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lessons_updated_at BEFORE UPDATE ON user_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de Row Level Security (RLS)
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Política para user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Política para user_lessons
CREATE POLICY "Users can view own lessons" ON user_lessons
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own lessons" ON user_lessons
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own lessons" ON user_lessons
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Política para user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Política para onboarding
CREATE POLICY "Users can view own onboarding" ON onboarding
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own onboarding" ON onboarding
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);


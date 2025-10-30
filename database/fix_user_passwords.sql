-- Script para arreglar la tabla user_passwords
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la tabla antigua si existe
DROP TABLE IF EXISTS user_passwords CASCADE;

-- Crear la tabla con la referencia correcta
CREATE TABLE user_passwords (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Políticas para user_passwords
DROP POLICY IF EXISTS "Allow public insert to user_passwords" ON user_passwords;
DROP POLICY IF EXISTS "Allow public select from user_passwords" ON user_passwords;

CREATE POLICY "Allow public insert to user_passwords" ON user_passwords
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from user_passwords" ON user_passwords
  FOR SELECT USING (true);


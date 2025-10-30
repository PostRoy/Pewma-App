-- Script para limpiar datos de prueba
-- Ejecuta este script en el SQL Editor de Supabase

-- ELIMINAR estos comentarios y reemplazar con tus datos reales:
-- DELETE FROM users WHERE email = 'tu-email@ejemplo.com';

-- O si quieres eliminar TODOS los datos de prueba:
DELETE FROM user_progress;
DELETE FROM user_lessons;
DELETE FROM user_achievements;
DELETE FROM onboarding;
DELETE FROM user_passwords;
DELETE FROM users;

-- Ver qué usuarios quedan
SELECT id, email, username FROM users;


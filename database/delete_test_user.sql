-- Script para eliminar el usuario de prueba
-- Ejecuta este script en el SQL Editor de Supabase

-- IMPORTANTE: Reemplaza el email con el del usuario que quieres eliminar
DELETE FROM users WHERE email = 'tu-email@ejemplo.com';

-- O si quieres ver todos los usuarios primero:
-- SELECT id, email, username FROM users;




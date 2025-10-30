-- Script para verificar los datos guardados
-- Ejecuta este script en el SQL Editor de Supabase

-- Ver todos los usuarios
SELECT id, email, username, bio FROM users;

-- Ver el progreso de todos los usuarios
SELECT 
  user_id,
  current_level,
  total_xp,
  streak,
  daily_goal,
  daily_xp,
  last_completed_date
FROM user_progress;

-- Ver el onboarding de todos los usuarios
SELECT 
  user_id,
  level,
  daily_goal,
  completed_at
FROM onboarding;

-- Ver el progreso de un usuario específico (reemplaza el email)
SELECT 
  up.user_id,
  u.username,
  up.current_level,
  up.total_xp,
  up.daily_goal,
  up.daily_xp,
  o.level as onboarding_level,
  o.daily_goal as onboarding_goal
FROM user_progress up
JOIN users u ON u.id = up.user_id
LEFT JOIN onboarding o ON o.user_id = up.user_id
WHERE u.email = 'tu-email@ejemplo.com';




# 🚀 Configuración de Supabase para Pewma

## 📋 Pasos para Configurar la Base de Datos en la Nube

### 1. Crear Cuenta en Supabase

1. Ve a **https://supabase.com** y crea una cuenta gratuita
2. Inicia sesión en el dashboard

### 2. Crear un Nuevo Proyecto

1. Haz clic en "**New Project**"
2. Elige tu organización
3. Configura:
   - **Name**: `pewma-app` (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña (la necesitarás después)
   - **Region**: Elige la región más cercana a tus usuarios (por ejemplo: South America)
4. Haz clic en "**Create new project**"
5. Espera 1-2 minutos mientras se crea tu proyecto

### 3. Configurar el Esquema de Base de Datos

1. Una vez creado el proyecto, ve a **SQL Editor** (en el menú lateral izquierdo)
2. Haz clic en "**New query**"
3. Abre el archivo `database/schema.sql` de este proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en "**Run**" (botón verde) o presiona `Ctrl + Enter`
7. Deberías ver "**Success. No rows returned**" o similar

### 4. Obtener las Credenciales

1. Ve a **Project Settings** (ícono de engranaje)
2. Haz clic en "**API**" en el menú
3. Verás dos valores importantes:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Una clave larga que empieza con `eyJ...`

### 5. Configurar en el Código

1. Abre el archivo `services/supabase.ts`
2. Reemplaza estos valores:

```typescript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';
```

Con tus valores reales de Supabase:

```typescript
const SUPABASE_URL = 'https://xxxxx.supabase.co';  // Tu Project URL
const SUPABASE_ANON_KEY = 'eyJ...';  // Tu anon public key
```

### 6. Probar la Conexión

1. Ejecuta tu app normalmente
2. Intenta registrarte o iniciar sesión
3. Ve a la pestaña "**Table Editor**" en Supabase
4. Deberías ver tus datos en las tablas:
   - `users`
   - `user_progress`
   - `user_lessons`
   - `user_achievements`
   - `onboarding`

## 🎯 ¿Qué Cambió en el Código?

### ✅ Ahora tus datos se guardan en la nube

**Antes** (AsyncStorage - solo local):
- Los datos estaban solo en el celular del usuario
- Se perdían al desinstalar la app
- No se sincronizaban entre dispositivos

**Ahora** (Supabase - en la nube):
- Los datos están en servidores de Supabase
- No se pierden al desinstalar
- Se pueden sincronizar entre dispositivos
- Siempre accesibles en línea

### 📁 Archivos Modificados

1. **`services/supabase.ts`** - Cliente de Supabase
2. **`contexts/AuthContext.tsx`** - Login/Registro/Perfil usando Supabase
3. **`contexts/AppContext.tsx`** - Progreso, lecciones y logros usando Supabase
4. **`database/schema.sql`** - Esquema de base de datos

### 📊 Estructura de la Base de Datos

Tu app ahora tiene estas tablas en Supabase:

- **`users`** - Información de usuarios (email, username, bio)
- **`user_progress`** - XP total, nivel, racha diaria
- **`user_lessons`** - Lecciones completadas y bloqueadas
- **`user_achievements`** - Logros desbloqueados
- **`onboarding`** - Datos del onboarding inicial

### 🔒 Seguridad

Las credenciales (URL y API Key) que necesitas son **públicas** y seguras:
- Son las `anon` keys (solo lectura/escritura limitada)
- Supabase usa **Row Level Security (RLS)** para proteger tus datos
- Cada usuario solo puede ver/modificar sus propios datos

### 💡 Tips

1. **Desarrollo**: Puedes crear múltiples proyectos en Supabase para desarrollo y producción
2. **Backups**: Supabase hace backups automáticos cada cierto tiempo
3. **Escalabilidad**: El plan gratuito es muy generoso, pero puedes actualizar cuando crezcas
4. **Monitoreo**: Ve a "**Database**" → "**Logs**" para ver qué queries se están ejecutando

### 🐛 Troubleshooting

**Error: "Invalid API key"**
- Verifica que copiaste bien el anon key
- Asegúrate de que sea el "anon public" key, no el "service_role"

**Error: "relation does not exist"**
- Ejecuta el SQL del archivo `schema.sql` en el SQL Editor

**No veo mis datos en la app**
- Verifica que el usuario está logueado
- Revisa la consola para errores
- Ve a "**Table Editor**" en Supabase para verificar que los datos se guardaron

**Error de conexión**
- Verifica tu conexión a internet
- Asegúrate de que la URL de Supabase sea correcta

## 🎉 ¡Listo!

Tu app ahora está conectada a una base de datos en la nube que:
- ✅ Está siempre activa (24/7)
- ✅ No depende de tu computador
- ✅ Guarda todos los datos de usuario
- ✅ Es escalable y segura
- ✅ Es gratuita para proyectos pequeños

## 📞 Ayuda

Si tienes problemas:
1. Revisa la documentación de Supabase: https://supabase.com/docs
2. Mira los logs en el dashboard de Supabase
3. Verifica que el SQL se ejecutó correctamente


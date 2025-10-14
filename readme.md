# Pewma APP
Esta app viene como proyecto de ingeniería de software para la universidad Diego Portales (Chile)

  ## Cómo compilar la aplicación
  Se probó en Ubuntu 24.04 LTS
  ### Actualizar librerías
  ```bash
  apt update  
  ```
  ```bash
  apt upgrade  
  ```
  ### Descargar NodeJS y JDK25
  [JDK25](https://www.oracle.com/java/technologies/downloads/)
  ```bash
  NODE_MAJOR=24
  curl -sL https://deb.nodesource.com/setup_$NODE_MAJOR.x -o nodesource_setup.sh
  bash nodesource_setup.sh
  ```
  ```bash
  apt install nodejs -y
  ```
  
  ### Agregar git y clonar el repositorio 
  ```bash
  git clone https://github.com/PostRoy/Pewma-App.git
  ```
  ```bash
  cd Pewma-App
  ```
  ### Instalar expo y correr el cliente
  ```bash
  npm install expo
  ```
  ```bash
  npx expo start
  ```

  <img width="400"  alt="image" src="https://github.com/user-attachments/assets/7749f11b-77d6-48fe-856f-9a86f63b2023" />
  
  Debe salir algo como esto, para ver la app hay 3 opciones
  - Web (No recomendado): No tiene mensajes de error, ni popups para parte de la funcionalidad. 
  - iOS (Recomendado): Probado en iOS 18 y 26, en iPhone 13 pro y 14, en los dos funcional, con leves detalles gráficos.
  - Android:
    

  ## Troubleshoot
  ### Problemas al instalar Expo
  lucide-react-native tiene problemas, al ser una versión mas vieja, requiere paquetes más viejos, los que chocan y entorpecen el proyecto
  la mejor solución es actualizar el paquete a su ultima versión para hacerlo compatible y volver a correrlo
  
  ```bash
  npm install lucide-react-native@latest --save
  ```
  ### Problemas expo-go iOS
  Expo-GO en iOS solo es compatible con la última versión disponible, por lo que para correrlo necesitamos actualizar el sdk

  ```bash
  npm install expo@^54.0.0
  ```
  Lo que al mismo tiempo nos lleva a otro error ya que las librerías quedan una/unas versión más atrás, esto lo solucioné con bun
  ```bash
  sudo apt update
  sudo apt install -y unzip curl
  ```

  ```bash
  curl -fsSL https://bun.sh/install | bash
  # cierra y abre la terminal o carga bun en esta sesión:
  export PATH="$HOME/.bun/bin:$PATH"
  bun -v   # debe mostrar la versión
  ```
  ```bash
  npx expo install
  ```
  ### Problema Incompatible react versions
  ```bash
  npx expo install expo@^54.0.0 --fix
  ```
  ### Problema _lruCache constructor 
  ```bash
  rm -rf node_modules
  ```
  y correr denuevo.

  <img width="643" height="84" alt="image" src="https://github.com/user-attachments/assets/613256c1-8f36-40d2-9bf2-f2fca810c088" />
  @rofernweh

---
#  Guía de Desarrollo - Pewma

Esta guía explica la estructura principal del código de la aplicación **Pewma** y dónde realizar las modificaciones más comunes.

---

##  Navegación y Layout

###  Layout Principal
- **Archivo:** `app/_layout.tsx`  
- **Función:** Controla las redirecciones según autenticación y progreso de onboarding.

```typescript
useEffect(() => {
  if (authLoading || appLoading) return;

  const inAuth = segments[0] === 'login' || segments[0] === 'register';
  const inOnboarding = segments[0] === 'onboarding';

  if (!isAuthenticated && !inAuth) {
    router.replace('/login' as any);
  } else if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
    router.replace('/onboarding');
  } else if (isAuthenticated && hasCompletedOnboarding && (inAuth || inOnboarding)) {
    router.replace('/(tabs)');
  }
}, [isAuthenticated, hasCompletedOnboarding, authLoading, appLoading, segments, router]);
````

###  Tabs Navigation

* **Archivo:** `app/(tabs)/_layout.tsx`
* **Función:** Configuración de las pestañas principales (Inicio / Perfil).

Para agregar más pestañas, añade nuevos `Tabs.Screen`:

```typescript
<Tabs.Screen
  name="index"
  options={{ title: "Inicio", tabBarIcon: ({ color }) => <Home size={24} color={color} /> }}
/>
<Tabs.Screen
  name="profile"
  options={{ title: "Perfil", tabBarIcon: ({ color }) => <User size={24} color={color} /> }}
/>
```

---

##  Autenticación

###  Login

* **Pantalla:** `app/login.tsx`
* **Lógica principal:** Función `handleLogin`
* **Modifica validaciones y mensajes aquí:**

```typescript
const handleLogin = async () => {
  if (!email.trim() || !password.trim()) { ... }
  if (!email.includes('@')) { ... }

  setIsLoading(true);
  const result = await login({ email: email.trim(), password });
  setIsLoading(false);

  if (result.success) {
    router.replace('/(tabs)');
  } else {
    Alert.alert('Error', result.error || 'Error al iniciar sesión');
  }
};
```

###  Registro

* **Pantalla:** `app/register.tsx`
* **Lógica principal:** Función `handleRegister`
* **Ajusta validaciones y navegación post-registro:**

```typescript
const handleRegister = async () => {
  if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) { ... }
  if (!email.includes('@')) { ... }
  if (username.length < 3) { ... }
  if (password.length < 6) { ... }
  if (password !== confirmPassword) { ... }

  setIsLoading(true);
  const result = await register({ email: email.trim(), username: username.trim(), password });
  setIsLoading(false);

  if (result.success) {
    router.replace('/onboarding');
  } else {
    Alert.alert('Error', result.error || 'Error al registrar');
  }
};
```

---

##  Lecciones y Progreso

###  Pantalla Principal / Lista de Lecciones

* **Archivo:** `app/(tabs)/index.tsx`
* **Modifica el listado o diseño de las tarjetas de lecciones:**

```typescript
{lessons.map((lesson, index) => {
  const isLocked = lesson.isLocked;
  const isCompleted = lesson.isCompleted;

  return (
    <TouchableOpacity
      key={lesson.id}
      style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}
      onPress={() => handleLessonPress(lesson.id, isLocked)}
      disabled={isLocked}
    >
```

###  Pantalla de Lección (Detalle / Ejercicios)

* **Archivo:** `app/lesson/[id].tsx`
* **Lógica de ejercicios y verificación:**

```typescript
const handleCheck = () => {
  const answer = (currentExercise.type === 'fill-in' || currentExercise.type === 'translation') 
    ? userInput.trim() 
    : selectedAnswer;
  const correct = answer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
  setIsCorrect(correct);
  setShowFeedback(true);
  // ...
};

const handleNext = async () => {
  // ...
  if (currentExerciseIndex < lesson.exercises.length - 1) {
    setCurrentExerciseIndex(currentExerciseIndex + 1);
  } else {
    const xp = lesson.xpReward;
    setEarnedXP(xp);
    setIsCompleted(true);
    await completeLesson(lesson.id, xp, mistakes === 0);
  }
};
```

---

##  Perfil de Usuario

###  Pantalla de Perfil

* **Archivo:** `app/(tabs)/profile.tsx`
* **Funcionalidades clave:**

  * Editar perfil (modal)
  * Reiniciar progreso
  * Cerrar sesión

**Editar perfil:**

```typescript
const handleEditProfile = () => { ... setIsEditModalVisible(true); };
const handleSaveProfile = async () => {
  if (!editUsername.trim()) { ... }
  if (editUsername.length < 3) { ... }
  setIsUpdating(true);
  const result = await updateProfile({ username: editUsername.trim(), bio: editBio.trim() });
  setIsUpdating(false);
  if (result.success) { setIsEditModalVisible(false); ... }
};
```

**Botones de acción:**

```typescript
<TouchableOpacity style={styles.resetButton} onPress={handleReset}>
// ...
<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
```

---

##  Contextos (Lógica de Negocio)

###  Contexto de Autenticación

* **Archivo:** `contexts/AuthContext.tsx`
* **Contiene:** Lógica de login, registro y actualización de perfil.

**Login real:**

```typescript
const login = useCallback(async (credentials: LoginCredentials) => {
  const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const foundUser = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
  if (!foundUser) { return { success: false, error: 'Correo o contraseña incorrectos' }; }
  // ...
}, []);
```

**Registro real:**

```typescript
const register = useCallback(async (credentials: RegisterCredentials) => {
  const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const existingUser = users.find((u) => 
    u.email.toLowerCase() === credentials.email.toLowerCase() || 
    u.username.toLowerCase() === credentials.username.toLowerCase()
  );
  if (existingUser) { ... }
  // ...
}, []);
```

---

### Contexto de Aplicación

* **Archivo:** `contexts/AppContext.tsx`
* **Contiene:** Progreso, lecciones, logros, XP y niveles.

**Completar lección:**

```typescript
const completeLesson = useCallback(async (lessonId: string, earnedXP: number, isPerfect: boolean) => {
  // ...
  const updatedProgress: UserProgress = { ... };
  setProgress(updatedProgress); await saveProgress(updatedProgress);

  const updatedLessons = lessons.map((lesson) => {
    if (lesson.id === lessonId) { return { ...lesson, isCompleted: true }; }
    // ...
    if (lessonLevel === updatedProgress.currentLevel || lessonLevel === updatedProgress.currentLevel + 1) {
      return { ...lesson, isLocked: false };
    }
    return lesson;
  });
  setLessons(updatedLessons); await saveLessons(updatedLessons);
  checkAndUnlockAchievements(updatedProgress, isPerfect);
}, [progress, lessons, achievements]);
```

**Onboarding:**

```typescript
const completeOnboarding = useCallback(async (data: OnboardingData) => {
  await AsyncStorage.setItem(`${STORAGE_KEYS.ONBOARDING}_${userId}`, JSON.stringify(data));
  const updatedProgress = { ...progress, dailyGoal: data.dailyGoal };
  setProgress(updatedProgress); await saveProgress(updatedProgress);
  setHasCompletedOnboarding(true);
}, [progress, user?.id]);
```

---

##  Personalización

###  Colores y Temas

* **Archivo:** `constants/colors.ts`
* Modifica aquí la paleta de colores y gradientes usados en toda la aplicación.

---

## Resumen Rápido

| Sección                | Archivos Principales                                  | Descripción                        |
| ---------------------- | ----------------------------------------------------- | ---------------------------------- |
| **Login**              | `app/login.tsx`, `contexts/AuthContext.tsx`           | UI / validaciones / lógica real    |
| **Registro**           | `app/register.tsx`, `contexts/AuthContext.tsx`        | UI / validaciones / registro real  |
| **Inicio / Lecciones** | `app/(tabs)/index.tsx`, `contexts/AppContext.tsx`     | UI de cards / progreso / XP        |
| **Detalle de Lección** | `app/lesson/[id].tsx`                                 | Ejercicios / flujo de verificación |
| **Perfil**             | `app/(tabs)/profile.tsx`, `AuthContext`, `AppContext` | Edición / reset / logout           |
| **Tabs**               | `app/(tabs)/_layout.tsx`                              | Agregar pestañas nuevas            |
| **Redirección Global** | `app/_layout.tsx`                                     | Control de flujo de navegación     |
| **Colores**            | `constants/colors.ts`                                 | Paleta y estilos globales          |








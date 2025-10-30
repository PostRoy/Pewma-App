import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { User, AuthData, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { supabase } from '@/services/supabase';
import { Tables } from '@/services/supabase';

// Clave para guardar datos de autenticación localmente (como fallback)
const STORAGE_KEYS = {
  AUTH_DATA: '@pewma_auth_data',
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      // Intentar cargar desde AsyncStorage primero
      const authDataStr = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      if (authDataStr) {
        const authData: AuthData = JSON.parse(authDataStr);
        setUser(authData.user);
        setToken(authData.token);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (authData: AuthData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const register = useCallback(async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar si el usuario ya existe en Supabase
      const { data: existingEmail } = await supabase
        .from(Tables.USERS)
        .select('id')
        .eq('email', credentials.email.toLowerCase())
        .single();

      if (existingEmail) {
        return { success: false, error: 'Este correo ya está registrado' };
      }

      const { data: existingUsername } = await supabase
        .from(Tables.USERS)
        .select('id')
        .eq('username', credentials.username.toLowerCase())
        .single();

      if (existingUsername) {
        return { success: false, error: 'Este nombre de usuario ya está en uso' };
      }

      // Crear usuario en Supabase
      const { data: newUserData, error: insertError } = await supabase
        .from(Tables.USERS)
        .insert({
          email: credentials.email.toLowerCase(),
          username: credentials.username,
          bio: '',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Guardar contraseña 
      const { error: passwordError } = await supabase
        .from('user_passwords')
        .insert({
          user_id: newUserData.id,
          password_hash: credentials.password,
        });

      if (passwordError) {
        console.warn('Error saving password:', passwordError);
        // Continuar aunque falle la contraseña por ahora
      }

      // Crear progreso inicial para el usuario
      await supabase.from(Tables.USER_PROGRESS).insert({
        user_id: newUserData.id,
        current_level: 1,
        total_xp: 0,
        streak: 0,
        daily_goal: 20,
        daily_xp: 0,
      });

      const newUser: User = {
        id: newUserData.id,
        email: newUserData.email,
        username: newUserData.username,
        bio: newUserData.bio || '',
        createdAt: newUserData.created_at,
      };

      const authData: AuthData = {
        user: newUser,
        token: `token_${newUserData.id}`,
      };

      await saveAuthData(authData);
      setUser(newUser);
      setToken(authData.token);

      return { success: true };
    } catch (error) {
      console.error('Error registering:', error);
      return { success: false, error: 'Error al registrar. Intenta de nuevo.' };
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Buscar usuario por email en Supabase
      const { data: foundUser, error: userError } = await supabase
        .from(Tables.USERS)
        .select('*')
        .eq('email', credentials.email.toLowerCase())
        .single();

      if (userError || !foundUser) {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }

      // Verificar contraseña
      const { data: passwordData, error: passwordError } = await supabase
        .from('user_passwords')
        .select('password_hash')
        .eq('user_id', foundUser.id)
        .single();

      if (passwordError || !passwordData) {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }

      // En producción, compara hashes: bcrypt.compare(password, passwordData.password_hash)
      if (passwordData.password_hash !== credentials.password) {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }

      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        bio: foundUser.bio || '',
        createdAt: foundUser.created_at,
      };

      const authData: AuthData = {
        user,
        token: `token_${foundUser.id}`,
      };

      await saveAuthData(authData);
      setUser(user);
      setToken(authData.token);

      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'username' | 'bio'>>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    try {
      // Verificar si el nuevo username ya existe
      if (updates.username && updates.username !== user.username) {
        const { data: existingUser } = await supabase
          .from(Tables.USERS)
          .select('id')
          .eq('username', updates.username.toLowerCase())
          .neq('id', user.id)
          .single();

        if (existingUser) {
          return { success: false, error: 'Este nombre de usuario ya está en uso' };
        }
      }

      // Actualizar en Supabase
      const { error: updateError } = await supabase
        .from(Tables.USERS)
        .update({
          ...(updates.username && { username: updates.username }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedUser: User = {
        ...user,
        ...updates,
      };

      const authData: AuthData = {
        user: updatedUser,
        token: token!,
      };
      await saveAuthData(authData);
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Error al actualizar perfil. Intenta de nuevo.' };
    }
  }, [user, token]);

  return useMemo(
    () => ({
      isLoading,
      user,
      token,
      isAuthenticated: !!user && !!token,
      register,
      login,
      logout,
      updateProfile,
    }),
    [isLoading, user, token, register, login, logout, updateProfile]
  );
});

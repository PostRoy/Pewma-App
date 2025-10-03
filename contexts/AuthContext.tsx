import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { User, AuthData, LoginCredentials, RegisterCredentials } from '@/types/auth';

const STORAGE_KEYS = {
  AUTH_DATA: '@pewma_auth_data',
  USERS: '@pewma_users',
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
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      const existingUser = users.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase() || 
               u.username.toLowerCase() === credentials.username.toLowerCase()
      );

      if (existingUser) {
        if (existingUser.email.toLowerCase() === credentials.email.toLowerCase()) {
          return { success: false, error: 'Este correo ya está registrado' };
        }
        return { success: false, error: 'Este nombre de usuario ya está en uso' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        username: credentials.username,
        bio: '',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const userPasswords = await AsyncStorage.getItem('@pewma_passwords');
      const passwords: Record<string, string> = userPasswords ? JSON.parse(userPasswords) : {};
      passwords[newUser.id] = credentials.password;
      await AsyncStorage.setItem('@pewma_passwords', JSON.stringify(passwords));

      const authData: AuthData = {
        user: newUser,
        token: `token_${newUser.id}`,
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
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      const foundUser = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

      if (!foundUser) {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }

      const userPasswords = await AsyncStorage.getItem('@pewma_passwords');
      const passwords: Record<string, string> = userPasswords ? JSON.parse(userPasswords) : {};

      if (passwords[foundUser.id] !== credentials.password) {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }

      const authData: AuthData = {
        user: foundUser,
        token: `token_${foundUser.id}`,
      };

      await saveAuthData(authData);
      setUser(foundUser);
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
      const usersStr = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      if (updates.username && updates.username !== user.username) {
        const existingUser = users.find(
          (u) => u.id !== user.id && u.username.toLowerCase() === updates.username!.toLowerCase()
        );
        if (existingUser) {
          return { success: false, error: 'Este nombre de usuario ya está en uso' };
        }
      }

      const updatedUser: User = {
        ...user,
        ...updates,
      };

      const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

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

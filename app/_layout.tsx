import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: appLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

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

  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="lesson/[id]" 
        options={{ 
          headerShown: true,
          title: "Lección",
          headerStyle: {
            backgroundColor: '#F5F7FA',
          },
          headerTintColor: '#2C3E50',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppProvider>
            <RootLayoutNav />
          </AppProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setIsLoading(true);
    const result = await login({ email: email.trim(), password });
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={Colors.gradient.primary as any} style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <LogIn size={60} color={Colors.white} strokeWidth={1.5} />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta a Pewma</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={Colors.textLight} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={20} color={Colors.textLight} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register' as any)}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>Crear una cuenta nueva</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 8,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textLight,
  },
  registerButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});

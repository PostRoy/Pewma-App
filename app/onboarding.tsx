import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Target, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedGoal, setSelectedGoal] = useState<number>(20);

  const handleComplete = async () => {
    await completeOnboarding({
      level: selectedLevel,
      dailyGoal: selectedGoal,
    });
    router.replace('/(tabs)');
  };

  if (step === 0) {
    return (
      <LinearGradient colors={Colors.gradient.primary as any} style={styles.container}>
        <View style={styles.content}>
          <Sparkles size={80} color={Colors.white} strokeWidth={1.5} />
          <Text style={styles.title}>¡Bienvenido a Pewma!</Text>
          <Text style={styles.subtitle}>
            Aprende Mapudungun, la lengua del pueblo Mapuche, de forma divertida y gamificada
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (step === 1) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>¿Cuál es tu nivel?</Text>
          <Text style={styles.headerSubtitle}>Selecciona tu nivel de conocimiento</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, selectedLevel === 'beginner' && styles.optionCardSelected]}
            onPress={() => setSelectedLevel('beginner')}
          >
            <View style={styles.optionIcon}>
              <Sparkles size={32} color={selectedLevel === 'beginner' ? Colors.primary : Colors.textLight} />
            </View>
            <Text style={[styles.optionTitle, selectedLevel === 'beginner' && styles.optionTitleSelected]}>
              Principiante
            </Text>
            <Text style={styles.optionDescription}>Nunca he estudiado Mapudungun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, selectedLevel === 'intermediate' && styles.optionCardSelected]}
            onPress={() => setSelectedLevel('intermediate')}
          >
            <View style={styles.optionIcon}>
              <Target size={32} color={selectedLevel === 'intermediate' ? Colors.primary : Colors.textLight} />
            </View>
            <Text style={[styles.optionTitle, selectedLevel === 'intermediate' && styles.optionTitleSelected]}>
              Intermedio
            </Text>
            <Text style={styles.optionDescription}>Conozco algunas palabras básicas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, selectedLevel === 'advanced' && styles.optionCardSelected]}
            onPress={() => setSelectedLevel('advanced')}
          >
            <View style={styles.optionIcon}>
              <Zap size={32} color={selectedLevel === 'advanced' ? Colors.primary : Colors.textLight} />
            </View>
            <Text style={[styles.optionTitle, selectedLevel === 'advanced' && styles.optionTitleSelected]}>
              Avanzado
            </Text>
            <Text style={styles.optionDescription}>Puedo mantener conversaciones simples</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={() => setStep(2)}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meta diaria</Text>
        <Text style={styles.headerSubtitle}>¿Cuánto XP quieres ganar cada día?</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.goalCard, selectedGoal === 10 && styles.goalCardSelected]}
          onPress={() => setSelectedGoal(10)}
        >
          <Text style={[styles.goalValue, selectedGoal === 10 && styles.goalValueSelected]}>10 XP</Text>
          <Text style={styles.goalDescription}>Casual</Text>
          <Text style={styles.goalTime}>~5 min/día</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.goalCard, selectedGoal === 20 && styles.goalCardSelected]}
          onPress={() => setSelectedGoal(20)}
        >
          <Text style={[styles.goalValue, selectedGoal === 20 && styles.goalValueSelected]}>20 XP</Text>
          <Text style={styles.goalDescription}>Regular</Text>
          <Text style={styles.goalTime}>~10 min/día</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.goalCard, selectedGoal === 50 && styles.goalCardSelected]}
          onPress={() => setSelectedGoal(50)}
        >
          <Text style={[styles.goalValue, selectedGoal === 50 && styles.goalValueSelected]}>50 XP</Text>
          <Text style={styles.goalDescription}>Serio</Text>
          <Text style={styles.goalTime}>~20 min/día</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
        <Text style={styles.continueButtonText}>¡Empezar a aprender!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
  },
  button: {
    backgroundColor: Colors.white,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 48,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  goalValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  goalValueSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  goalTime: {
    fontSize: 14,
    color: Colors.textLight,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});

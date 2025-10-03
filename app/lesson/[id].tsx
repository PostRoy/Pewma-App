import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Mascot from '@/components/Mascot';
import Colors from '@/constants/colors';
import { Exercise } from '@/types/lesson';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lessons, completeLesson } = useApp();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const lesson = lessons.find((l) => l.id === id);

  useEffect(() => {
    if (lesson) {
      const progress = (currentExerciseIndex / lesson.exercises.length) * 100;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentExerciseIndex, lesson, progressAnim]);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lección no encontrada</Text>
      </View>
    );
  }

  const currentExercise: Exercise = lesson.exercises[currentExerciseIndex];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleCheck = () => {
    const answer = (currentExercise.type === 'fill-in' || currentExercise.type === 'translation') 
      ? userInput.trim() 
      : selectedAnswer;
    const correct = answer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setMistakes(mistakes + 1);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = async () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setSelectedAnswer('');
    setUserInput('');

    Animated.timing(feedbackAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      const xp = lesson.xpReward;
      setEarnedXP(xp);
      setIsCompleted(true);
      await completeLesson(lesson.id, xp, mistakes === 0);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  if (isCompleted) {
    return (
      <LinearGradient colors={Colors.gradient.success as any} style={styles.container}>
        <View style={styles.completionContainer}>
          <Mascot emotion="excited" size={120} />
          <Text style={styles.completionTitle}>¡Lección Completada!</Text>
          <Text style={styles.completionSubtitle}>{lesson.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>+{earnedXP}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mistakes}</Text>
              <Text style={styles.statLabel}>Errores</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{lesson.exercises.length}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
          </View>

          {mistakes === 0 && (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectText}>✨ ¡Perfecto! ✨</Text>
            </View>
          )}

          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const canCheck =
    (currentExercise.type === 'fill-in' || currentExercise.type === 'translation') 
      ? userInput.trim().length > 0 
      : selectedAnswer.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mascotContainer}>
          <Mascot emotion={showFeedback ? (isCorrect ? 'happy' : 'sad') : 'thinking'} size={80} />
        </View>

        <Text style={styles.question}>{currentExercise.question}</Text>

        {currentExercise.type === 'multiple-choice' && currentExercise.options && (
          <View style={styles.optionsContainer}>
            {currentExercise.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.optionButtonSelected,
                  showFeedback &&
                    selectedAnswer === option &&
                    (isCorrect ? styles.optionButtonCorrect : styles.optionButtonWrong),
                ]}
                onPress={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === option && styles.optionTextSelected,
                    showFeedback && selectedAnswer === option && styles.optionTextFeedback,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentExercise.type === 'fill-in' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                showFeedback && (isCorrect ? styles.inputCorrect : styles.inputWrong),
              ]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor={Colors.textLight}
              editable={!showFeedback}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {currentExercise.type === 'translation' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                showFeedback && (isCorrect ? styles.inputCorrect : styles.inputWrong),
              ]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Traduce al Mapudungun..."
              placeholderTextColor={Colors.textLight}
              editable={!showFeedback}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {showFeedback && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
              { opacity: feedbackAnim },
            ]}
          >
            <View style={styles.feedbackContent}>
              {isCorrect ? (
                <Check size={24} color={Colors.white} />
              ) : (
                <X size={24} color={Colors.white} />
              )}
              <Text style={styles.feedbackText}>
                {isCorrect ? '¡Correcto!' : `Incorrecto. La respuesta es: ${currentExercise.correctAnswer}`}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[styles.checkButton, !canCheck && styles.checkButtonDisabled]}
            onPress={handleCheck}
            disabled={!canCheck}
          >
            <Text style={styles.checkButtonText}>Verificar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continuar</Text>
            <ArrowRight size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  optionButtonCorrect: {
    borderColor: Colors.success,
    backgroundColor: '#E8F5E9',
  },
  optionButtonWrong: {
    borderColor: Colors.error,
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  optionTextFeedback: {
    fontWeight: '600' as const,
  },
  inputContainer: {
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    color: Colors.text,
  },
  inputCorrect: {
    borderColor: Colors.success,
    backgroundColor: '#E8F5E9',
  },
  inputWrong: {
    borderColor: Colors.error,
    backgroundColor: '#FFEBEE',
  },
  feedbackContainer: {
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
  },
  feedbackCorrect: {
    backgroundColor: Colors.success,
  },
  feedbackWrong: {
    backgroundColor: Colors.error,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600' as const,
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  checkButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: Colors.border,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  nextButton: {
    backgroundColor: Colors.success,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 24,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 20,
    color: Colors.white,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 90,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 4,
    opacity: 0.9,
  },
  perfectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  perfectText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  finishButton: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 16,
    marginTop: 40,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});

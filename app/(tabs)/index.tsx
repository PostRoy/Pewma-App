import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Flame, Target, Lock, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Mascot from '@/components/Mascot';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { progress, lessons } = useApp();

  const progressPercentage = (progress.dailyXP / progress.dailyGoal) * 100;

  const handleLessonPress = (lessonId: string, isLocked: boolean) => {
    if (!isLocked) {
      router.push(`/lesson/${lessonId}`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradient.primary as any} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.mascotContainer}>
            <Mascot emotion="happy" size={60} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Flame size={20} color={Colors.streak} />
              <Text style={styles.statValue}>{progress.streak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>

            <View style={styles.statItem}>
              <Trophy size={20} color={Colors.xp} />
              <Text style={styles.statValue}>{progress.totalXP}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>

            <View style={styles.statItem}>
              <Target size={20} color={Colors.white} />
              <Text style={styles.statValue}>Nv. {progress.currentLevel}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>

          <View style={styles.dailyGoalContainer}>
            <View style={styles.dailyGoalHeader}>
              <Text style={styles.dailyGoalTitle}>Meta Diaria</Text>
              <Text style={styles.dailyGoalText}>
                {progress.dailyXP} / {progress.dailyGoal} XP
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Lecciones</Text>

        <View style={styles.lessonsContainer}>
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
                <View style={styles.lessonIconContainer}>
                  {isLocked ? (
                    <Lock size={32} color={Colors.textLight} />
                  ) : isCompleted ? (
                    <CheckCircle2 size={32} color={Colors.success} />
                  ) : (
                    <View style={styles.lessonNumber}>
                      <Text style={styles.lessonNumberText}>{index + 1}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonDescription, isLocked && styles.lessonDescriptionLocked]}>
                    {lesson.description}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.xpBadge}>
                      <Trophy size={14} color={Colors.xp} />
                      <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
                    </View>
                    <Text style={styles.levelBadge}>Nivel {lesson.level}</Text>
                  </View>
                </View>

                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  dailyGoalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dailyGoalTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  dailyGoalText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonIconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  lessonInfo: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  lessonTitleLocked: {
    color: Colors.textLight,
  },
  lessonDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  lessonDescriptionLocked: {
    color: Colors.textLight,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#F9A825',
  },
  levelBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700' as const,
  },
});

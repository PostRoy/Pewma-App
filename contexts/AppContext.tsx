import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { UserProgress, Achievement, Lesson, OnboardingData } from '@/types/lesson';
import { lessons as initialLessons, achievements as initialAchievements } from '@/mocks/lessons';
import { useAuth } from './AuthContext';

const STORAGE_KEYS = {
  PROGRESS: '@pewma_progress',
  ONBOARDING: '@pewma_onboarding',
  ACHIEVEMENTS: '@pewma_achievements',
  LESSONS: '@pewma_lessons',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgress>({
    currentLevel: 1,
    totalXP: 0,
    streak: 0,
    lastCompletedDate: null,
    completedLessons: [],
    dailyGoal: 20,
    dailyXP: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user?.id]);

  const loadData = async () => {
    try {
      const userId = user?.id || 'guest';
      const [onboardingData, progressData, achievementsData, lessonsData] = await Promise.all([
        AsyncStorage.getItem(`${STORAGE_KEYS.ONBOARDING}_${userId}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.PROGRESS}_${userId}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.ACHIEVEMENTS}_${userId}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.LESSONS}_${userId}`),
      ]);

      if (onboardingData) {
        setHasCompletedOnboarding(true);
      }

      if (progressData) {
        const parsedProgress = JSON.parse(progressData);
        setProgress(parsedProgress);
        updateStreak(parsedProgress);
      }

      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }

      if (lessonsData) {
        setLessons(JSON.parse(lessonsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = (currentProgress: UserProgress) => {
    const today = new Date().toDateString();
    const lastDate = currentProgress.lastCompletedDate
      ? new Date(currentProgress.lastCompletedDate).toDateString()
      : null;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate === yesterdayStr) {
        return;
      } else if (lastDate && lastDate !== yesterdayStr) {
        const updatedProgress = { ...currentProgress, streak: 0, dailyXP: 0 };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
      } else {
        const updatedProgress = { ...currentProgress, dailyXP: 0 };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
      }
    }
  };

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    try {
      const userId = user?.id || 'guest';
      await AsyncStorage.setItem(`${STORAGE_KEYS.ONBOARDING}_${userId}`, JSON.stringify(data));
      const updatedProgress = { ...progress, dailyGoal: data.dailyGoal };
      setProgress(updatedProgress);
      await saveProgress(updatedProgress);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  }, [progress, user?.id]);

  const saveProgress = async (updatedProgress: UserProgress) => {
    try {
      const userId = user?.id || 'guest';
      await AsyncStorage.setItem(`${STORAGE_KEYS.PROGRESS}_${userId}`, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const saveLessons = async (updatedLessons: Lesson[]) => {
    try {
      const userId = user?.id || 'guest';
      await AsyncStorage.setItem(`${STORAGE_KEYS.LESSONS}_${userId}`, JSON.stringify(updatedLessons));
    } catch (error) {
      console.error('Error saving lessons:', error);
    }
  };

  const saveAchievements = async (updatedAchievements: Achievement[]) => {
    try {
      const userId = user?.id || 'guest';
      await AsyncStorage.setItem(`${STORAGE_KEYS.ACHIEVEMENTS}_${userId}`, JSON.stringify(updatedAchievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const completeLesson = useCallback(async (lessonId: string, earnedXP: number, isPerfect: boolean) => {
    const today = new Date().toDateString();
    const lastDate = progress.lastCompletedDate
      ? new Date(progress.lastCompletedDate).toDateString()
      : null;

    let newStreak = progress.streak;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate === yesterdayStr || lastDate === null) {
        newStreak = progress.streak + 1;
      } else {
        newStreak = 1;
      }
    }

    const newTotalXP = progress.totalXP + earnedXP;
    const newDailyXP = lastDate === today ? progress.dailyXP + earnedXP : earnedXP;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    const updatedProgress: UserProgress = {
      ...progress,
      totalXP: newTotalXP,
      dailyXP: newDailyXP,
      currentLevel: newLevel,
      streak: newStreak,
      lastCompletedDate: new Date().toISOString(),
      completedLessons: [...new Set([...progress.completedLessons, lessonId])],
    };

    setProgress(updatedProgress);
    await saveProgress(updatedProgress);

    const updatedLessons = lessons.map((lesson) => {
      if (lesson.id === lessonId) {
        return { ...lesson, isCompleted: true };
      }
      const lessonLevel = lesson.level;


      if (lessonLevel === updatedProgress.currentLevel || lessonLevel === updatedProgress.currentLevel + 1) {
        return { ...lesson, isLocked: false };
      }
      return lesson;
    });

    setLessons(updatedLessons);
    await saveLessons(updatedLessons);

    checkAndUnlockAchievements(updatedProgress, isPerfect);
  }, [progress, lessons, achievements]);

  const checkAndUnlockAchievements = async (updatedProgress: UserProgress, isPerfect: boolean) => {
    const newAchievements = [...achievements];
    let hasChanges = false;

    newAchievements.forEach((achievement) => {
      if (!achievement.isUnlocked) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first-lesson':
            shouldUnlock = updatedProgress.completedLessons.length >= 1;
            break;
          case 'streak-3':
            shouldUnlock = updatedProgress.streak >= 3;
            break;
          case 'streak-7':
            shouldUnlock = updatedProgress.streak >= 7;
            break;
          case 'xp-100':
            shouldUnlock = updatedProgress.totalXP >= 100;
            break;
          case 'xp-500':
            shouldUnlock = updatedProgress.totalXP >= 500;
            break;
          case 'level-2':
            shouldUnlock = updatedProgress.currentLevel >= 2;
            break;
          case 'perfect-lesson':
            shouldUnlock = isPerfect;
            break;
        }

        if (shouldUnlock) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setAchievements(newAchievements);
      await saveAchievements(newAchievements);
    }
  };

  const resetProgress = useCallback(async () => {
    try {
      const userId = user?.id || 'guest';
      await AsyncStorage.multiRemove([
        `${STORAGE_KEYS.PROGRESS}_${userId}`,
        `${STORAGE_KEYS.ONBOARDING}_${userId}`,
        `${STORAGE_KEYS.ACHIEVEMENTS}_${userId}`,
        `${STORAGE_KEYS.LESSONS}_${userId}`,
      ]);
      setProgress({
        currentLevel: 1,
        totalXP: 0,
        streak: 0,
        lastCompletedDate: null,
        completedLessons: [],
        dailyGoal: 20,
        dailyXP: 0,
      });
      setHasCompletedOnboarding(false);
      setAchievements(initialAchievements);
      setLessons(initialLessons);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [user?.id]);

  return useMemo(() => ({
    isLoading,
    hasCompletedOnboarding,
    progress,
    achievements,
    lessons,
    completeOnboarding,
    completeLesson,
    resetProgress,
  }), [isLoading, hasCompletedOnboarding, progress, achievements, lessons, completeOnboarding, completeLesson, resetProgress]);
});

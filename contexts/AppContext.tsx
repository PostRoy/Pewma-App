import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { UserProgress, Achievement, Lesson, OnboardingData } from '@/types/lesson';
import { lessons as initialLessons, achievements as initialAchievements } from '@/mocks/lessons';
import { useAuth } from './AuthContext';
import { supabase } from '@/services/supabase';
import { Tables } from '@/services/supabase';

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
    if (!authLoading && user?.id) {
      // Resetear estado al cambiar de usuario para evitar arrastrar datos previos
      setHasCompletedOnboarding(false);
      setProgress({
        currentLevel: 1,
        totalXP: 0,
        streak: 0,
        lastCompletedDate: null,
        completedLessons: [],
        dailyGoal: 20,
        dailyXP: 0,
      });
      setAchievements(initialAchievements);
      setLessons(initialLessons);
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, user?.id]);

  const loadData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Por defecto, considerar que el onboarding NO está completo hasta confirmar
      setHasCompletedOnboarding(false);

      // Cargar progreso desde Supabase
      const { data: progressData, error: progressError } = await supabase
        .from(Tables.USER_PROGRESS)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData && !progressError) {
        const parsedProgress: UserProgress = {
          currentLevel: progressData.current_level,
          totalXP: progressData.total_xp,
          streak: progressData.streak,
          lastCompletedDate: progressData.last_completed_date,
          completedLessons: [], // Lo cargaremos después
          dailyGoal: progressData.daily_goal,
          dailyXP: progressData.daily_xp,
        };
        setProgress(parsedProgress);
        updateStreak(parsedProgress);

        // Cargar lecciones completadas
        const { data: lessonsData } = await supabase
          .from(Tables.USER_LESSONS)
          .select('lesson_id, is_completed, is_locked')
          .eq('user_id', user.id);

        if (lessonsData) {
          const completedIds = lessonsData
            .filter((l) => l.is_completed)
            .map((l) => l.lesson_id);
          parsedProgress.completedLessons = completedIds;

          // Actualizar estado de lecciones
          const updatedLessons = initialLessons.map((lesson) => {
            const userLesson = lessonsData.find((l) => l.lesson_id === lesson.id);
            return {
              ...lesson,
              isCompleted: userLesson?.is_completed || false,
              isLocked: userLesson?.is_locked !== false && userLesson?.is_locked !== undefined 
                ? userLesson.is_locked 
                : lesson.isLocked,
            };
          });
          setLessons(updatedLessons);
        }
      }

      // Cargar onboarding desde Supabase
      const { data: onboardingData } = await supabase
        .from(Tables.ONBOARDING)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboardingData) {
        setHasCompletedOnboarding(true);
        setProgress((prev) => ({ ...prev, dailyGoal: onboardingData.daily_goal }));
      } else {
        // Asegurar que el nuevo usuario sea enviado a onboarding
        setHasCompletedOnboarding(false);
      }

      // Cargar logros desde Supabase
      const { data: achievementsData } = await supabase
        .from(Tables.USER_ACHIEVEMENTS)
        .select('*')
        .eq('user_id', user.id);

      if (achievementsData) {
        const updatedAchievements = initialAchievements.map((achievement) => {
          const userAchievement = achievementsData.find((a) => a.achievement_id === achievement.id);
          return {
            ...achievement,
            isUnlocked: userAchievement?.is_unlocked || false,
            unlockedAt: userAchievement?.unlocked_at || undefined,
          };
        });
        setAchievements(updatedAchievements);
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
        saveProgressToSupabase(updatedProgress);
      } else {
        const updatedProgress = { ...currentProgress, dailyXP: 0 };
        setProgress(updatedProgress);
        saveProgressToSupabase(updatedProgress);
      }
    }
  };

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!user?.id) return;

    try {
      // Guardar onboarding en Supabase
      const { error: onboardingError } = await supabase.from(Tables.ONBOARDING).insert({
        user_id: user.id,
        level: data.level,
        daily_goal: data.dailyGoal,
      });

      if (onboardingError) {
        console.error('Error saving onboarding:', onboardingError);
        return;
      }

      // Actualizar el progreso con la nueva meta diaria
      const updatedProgress = { ...progress, dailyGoal: data.dailyGoal };
      setProgress(updatedProgress);
      await saveProgressToSupabase(updatedProgress);
      setHasCompletedOnboarding(true);
      console.log('Onboarding completed with daily goal:', data.dailyGoal);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  }, [progress, user?.id]);

  const saveProgressToSupabase = async (updatedProgress: UserProgress) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from(Tables.USER_PROGRESS)
        .upsert(
          {
            user_id: user.id,
            current_level: updatedProgress.currentLevel,
            total_xp: updatedProgress.totalXP,
            streak: updatedProgress.streak,
            last_completed_date: updatedProgress.lastCompletedDate,
            daily_goal: updatedProgress.dailyGoal,
            daily_xp: updatedProgress.dailyXP,
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          }
        );

      if (error) {
        console.error('Error saving progress to Supabase:', error);
      } else {
        console.log('Progress saved to Supabase with daily_goal:', updatedProgress.dailyGoal);
      }
    } catch (error) {
      console.error('Error saving progress to Supabase:', error);
    }
  };

  const saveLessonsToSupabase = async (lesson: Lesson) => {
    if (!user?.id) return;

    try {
      await supabase.from(Tables.USER_LESSONS).upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        is_completed: lesson.isCompleted,
        is_locked: lesson.isLocked,
        completed_at: lesson.isCompleted ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error('Error saving lesson to Supabase:', error);
    }
  };

  const saveAchievementToSupabase = async (achievementId: string, isUnlocked: boolean, unlockedAt?: string) => {
    if (!user?.id) return;

    try {
      await supabase.from(Tables.USER_ACHIEVEMENTS).upsert({
        user_id: user.id,
        achievement_id: achievementId,
        is_unlocked: isUnlocked,
        unlocked_at: unlockedAt || null,
      });
    } catch (error) {
      console.error('Error saving achievement to Supabase:', error);
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
    await saveProgressToSupabase(updatedProgress);

    const updatedLessons = lessons.map((lesson) => {
      if (lesson.id === lessonId) {
        const updatedLesson = { ...lesson, isCompleted: true };
        saveLessonsToSupabase(updatedLesson);
        return updatedLesson;
      }
      const lessonLevel = lesson.level;

      if (lessonLevel === updatedProgress.currentLevel || lessonLevel === updatedProgress.currentLevel + 1) {
        const updatedLesson = { ...lesson, isLocked: false };
        saveLessonsToSupabase(updatedLesson);
        return updatedLesson;
      }
      return lesson;
    });

    setLessons(updatedLessons);
    checkAndUnlockAchievements(updatedProgress, isPerfect);
  }, [progress, lessons, user?.id]);

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
          saveAchievementToSupabase(achievement.id, true, achievement.unlockedAt);
        }
      }
    });

    if (hasChanges) {
      setAchievements(newAchievements);
    }
  };

  const resetProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Borrar todos los datos de Supabase
      await supabase.from(Tables.USER_PROGRESS).delete().eq('user_id', user.id);
      await supabase.from(Tables.USER_LESSONS).delete().eq('user_id', user.id);
      await supabase.from(Tables.USER_ACHIEVEMENTS).delete().eq('user_id', user.id);
      await supabase.from(Tables.ONBOARDING).delete().eq('user_id', user.id);

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

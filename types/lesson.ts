export type ExerciseType = 'multiple-choice' | 'fill-in' | 'translation' | 'listening' | 'speaking';

export type Exercise = {
  id: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options?: string[];
  translation?: string;
  audioUrl?: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  level: number;
  xpReward: number;
  exercises: Exercise[];
  isLocked: boolean;
  isCompleted: boolean;
};

export type UserProgress = {
  currentLevel: number;
  totalXP: number;
  streak: number;
  lastCompletedDate: string | null;
  completedLessons: string[];
  dailyGoal: number;
  dailyXP: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
};

export type OnboardingData = {
  level: 'beginner' | 'intermediate' | 'advanced';
  dailyGoal: number;
};

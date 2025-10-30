import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://mcszwpulsiznsgbumula.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jc3p3cHVsc2l6bnNnYnVtdWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzI3OTgsImV4cCI6MjA3NzI0ODc5OH0.QJ5Ca3TQPx8M9edflKmRhbgIz_zzsJQVfgz8qxOUW48';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export enum Tables {
  USERS = 'users',
  USER_PROGRESS = 'user_progress',
  USER_LESSONS = 'user_lessons',
  USER_ACHIEVEMENTS = 'user_achievements',
  ONBOARDING = 'onboarding',
}


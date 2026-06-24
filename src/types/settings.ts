import { ReminderConfig } from "./reminders";

export interface FocusPreferences {
  preferredSessionDuration: number; // in minutes
  preferredBreakDuration: number; // in minutes
  autoStartBreak: boolean;
  defaultFocusMode: "pomodoro" | "stopwatch";
}

export interface ReminderPreferences {
  remindersEnabled: boolean;
  defaultReminderTiming: number;
  defaultReminderUnit: "minutes" | "hours" | "days";
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  university: string;
  major: string;
  academicYear: string;
  currentGPA: string; // Stored as string to handle both 4.0 and 100%
  totalCreditHours: string;
  completedCreditHours: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  
  focusPreferences: FocusPreferences;
  reminderPreferences: ReminderPreferences;
  themePreference: "light" | "dark" | "system";
  
  createdAt: string;
  updatedAt: string;

  streak?: {
    currentCount: number;
    longestCount: number;
    lastActiveDate: string;
    activeDays: string[];
  };
}

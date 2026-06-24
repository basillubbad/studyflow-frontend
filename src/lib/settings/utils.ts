import { UserProfile } from "@/types/settings";

const STORAGE_KEY = "studyflow_user_data";

export const getDefaultProfile = (): UserProfile => ({
  id: "user-1",
  name: "",
  university: "",
  major: "",
  academicYear: "",
  currentGPA: "",
  totalCreditHours: "",
  completedCreditHours: "",
  onboardingCompleted: false,
  focusPreferences: {
    preferredSessionDuration: 25,
    preferredBreakDuration: 5,
    autoStartBreak: false,
    defaultFocusMode: "pomodoro",
  },
  reminderPreferences: {
    remindersEnabled: true,
    defaultReminderTiming: 15,
    defaultReminderUnit: "minutes",
    emailNotificationsEnabled: false,
    inAppNotificationsEnabled: true,
  },
  themePreference: "system",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const loadProfile = (): UserProfile => {
  return getDefaultProfile();
};

export const saveProfile = (profile: UserProfile): void => {
  // Data should be handled by backend
};

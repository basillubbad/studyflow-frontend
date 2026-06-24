import { UserProfile } from "./settings";
import { Course } from "./course";
import { TaskItem } from "./tasks";
import { PlannerSemester, AcademicPlannerConfig } from "./academic-planning";
import { LearningPlan } from "./self-learning";
import { ReflectionEntry } from "./reflections";
import { Notification } from "./notifications";

export interface AppState {
  userProfile: UserProfile;
  onboardingCompleted: boolean;
  courses: Course[];
  tasks: TaskItem[];
  academicPlanning: {
    semesters: PlannerSemester[];
    config: AcademicPlannerConfig;
  };
  selfLearningPlans: LearningPlan[];
  reflections: ReflectionEntry[];
  notifications: Notification[];
  streak: {
    currentCount: number;
    longestCount: number;
    lastActiveDate: string; // ISO date string (YYYY-MM-DD)
    activeDays: string[]; // List of dates in YYYY-MM-DD format
  };
  demoMode: boolean;
  loadedModules: string[];
  lastUpdated: string;
}

export const EMPTY_APP_STATE: AppState = {
  userProfile: {
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
      defaultReminderTiming: 30,
      defaultReminderUnit: "minutes",
      emailNotificationsEnabled: true,
      inAppNotificationsEnabled: true,
    },
    themePreference: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  onboardingCompleted: false,
  courses: [],
  tasks: [],
  academicPlanning: {
    semesters: [],
    config: {
      totalRequiredCredits: 144,
      defaultSemesterLoad: 15,
    },
  },
  selfLearningPlans: [],
  reflections: [],
  notifications: [],
  streak: {
    currentCount: 0,
    longestCount: 0,
    lastActiveDate: "",
    activeDays: [],
  },
  demoMode: false,
  loadedModules: [],
  lastUpdated: new Date().toISOString(),
};

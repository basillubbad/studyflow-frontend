import { ReminderConfig } from "./reminders";

export type TaskType =
  | "general"
  | "study-task"
  | "assignment"
  | "quiz"
  | "exam"
  | "self-learning-milestone";

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskSourceModule = "general" | "course" | "self-learning";

export interface RecurrenceConfig {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[]; // 0-6
  endDate?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  sourceModule: TaskSourceModule;

  // Linkages for deep integration where possible
  linkedCourseId?: string;
  linkedCourseTitle?: string;
  linkedWeekId?: string;
  linkedWeekLabel?: string;
  linkedLearningPlanId?: string;
  linkedLearningPlanTitle?: string;

  // Timing
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm

  priority: TaskPriority;
  status: TaskStatus;
  previousStatus?: TaskStatus; // Track status before "done" for restoration
  recurrence?: RecurrenceConfig;
  savedRecurrence?: RecurrenceConfig; // Preserve recurrence settings when toggled off
  reminder?: boolean;
  reminderConfig?: ReminderConfig;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

// Stats interface for the UI top cards
export interface TaskStatsSummary {
  total: number;
  completed: number;
  overdue: number;
  highPriority: number;
  dueToday: number;
}

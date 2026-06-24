import { ReminderConfig } from "./reminders";

export type PlanStatus = "planned" | "active" | "completed" | "paused";
export type StageStatus = "not-started" | "active" | "completed";
export type ResourceType = "link" | "file" | "image";

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelfLearningTask {
  id: string;
  title: string;
  dueDate?: string;
  time?: string;
  completed: boolean;
  createdAt: string;
}

export interface LearningStage {
  id: string;
  planId: string;
  title: string;
  description?: string;
  targetDuration?: string; // free-form, e.g. "2 weeks"
  status: StageStatus;
  goals?: string;
  order: number;
  resources?: LearningResource[];
  tasks?: SelfLearningTask[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningMilestone {
  id: string;
  planId: string;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  notes?: string;
  reminderConfig?: ReminderConfig;
  createdAt: string;
}

export interface LearningPlan {
  id: string;
  title: string;
  description?: string;
  goal: string;
  category?: string;
  targetSkill?: string;
  startDate: string;
  endDate?: string;
  status: PlanStatus;
  stages: LearningStage[];
  milestones: LearningMilestone[];
  resources: LearningResource[];
  createdAt: string;
  updatedAt: string;
}

export interface SelfLearningStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  planned: number;
  upcomingMilestones: number;
}

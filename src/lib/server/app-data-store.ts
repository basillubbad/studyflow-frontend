import "server-only";

import { Prisma } from "@prisma/client";
import { PlannerSemester } from "@/types/academic-planning";
import { Course, Resource } from "@/types/course";
import { ExamPreparationTopic } from "@/types/exam-mode";
import { Notification } from "@/types/notifications";
import { ReflectionEntry } from "@/types/reflections";
import {
  LearningMilestone,
  LearningPlan,
  LearningResource,
  LearningStage,
  SelfLearningTask,
} from "@/types/self-learning";
import { TaskItem } from "@/types/tasks";
import { prisma } from "@/lib/server/prisma";

type ResourceType = Resource;
type FocusMode = "pomodoro" | "stopwatch";

export type StoredFocusSession = {
  id: string;
  durationMinutes: number;
  startTime: string;
  endTime?: string | null;
  mode: FocusMode;
  completed: boolean;
  linkedTaskId?: string | null;
  linkedCourseId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ExamPrepItem = {
  topics: ExamPreparationTopic[];
  resources: ResourceType[];
};

type UserAppData = {
  semesters: PlannerSemester[];
  courses: Course[];
  tasks: TaskItem[];
  reflections: ReflectionEntry[];
  notifications: Notification[];
  focusSessions: StoredFocusSession[];
  selfLearningPlans: LearningPlan[];
  examPrepByItemId: Record<string, ExamPrepItem>;
  detachedResources: Record<string, ResourceType[]>;
};

type AppDataFile = {
  users: Record<string, UserAppData>;
};

const EMPTY_USER_DATA: UserAppData = {
  semesters: [],
  courses: [],
  tasks: [],
  reflections: [],
  notifications: [],
  focusSessions: [],
  selfLearningPlans: [],
  examPrepByItemId: {},
  detachedResources: {},
};

function normalizeLearningResource(
  input: Partial<LearningResource> | Partial<ResourceType>,
): LearningResource {
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    type:
      input.type === "file" || input.type === "image" || input.type === "link"
        ? input.type
        : "link",
    url: input.url || "",
    description: input.description,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function normalizeSelfLearningTask(input: Partial<SelfLearningTask>): SelfLearningTask {
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    dueDate: input.dueDate,
    time: input.time,
    completed: Boolean(input.completed),
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function normalizeLearningStage(input: Partial<LearningStage>): LearningStage {
  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    planId: input.planId || "",
    title: input.title || "",
    description: input.description,
    targetDuration: input.targetDuration,
    status:
      input.status === "active" ||
      input.status === "completed" ||
      input.status === "not-started"
        ? input.status
        : "not-started",
    goals: input.goals,
    order: typeof input.order === "number" ? input.order : 1,
    resources: Array.isArray(input.resources)
      ? input.resources.map(normalizeLearningResource)
      : [],
    tasks: Array.isArray(input.tasks)
      ? input.tasks.map(normalizeSelfLearningTask)
      : [],
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeLearningMilestone(
  input: Partial<LearningMilestone>,
): LearningMilestone {
  return {
    id: input.id || crypto.randomUUID(),
    planId: input.planId || "",
    title: input.title || "",
    description: input.description,
    targetDate: input.targetDate,
    completed: Boolean(input.completed),
    notes: input.notes,
    reminderConfig: input.reminderConfig,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function normalizeLearningPlan(input: Partial<LearningPlan>): LearningPlan {
  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    description: input.description,
    goal: input.goal || "",
    category: input.category,
    targetSkill: input.targetSkill,
    startDate: input.startDate || now.slice(0, 10),
    endDate: input.endDate,
    status:
      input.status === "active" ||
      input.status === "completed" ||
      input.status === "paused" ||
      input.status === "planned"
        ? input.status
        : "planned",
    stages: Array.isArray(input.stages)
      ? input.stages.map(normalizeLearningStage)
      : [],
    milestones: Array.isArray(input.milestones)
      ? input.milestones.map(normalizeLearningMilestone)
      : [],
    resources: Array.isArray(input.resources)
      ? input.resources.map(normalizeLearningResource)
      : [],
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeSemester(input: Partial<PlannerSemester>): PlannerSemester {
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name || "",
    status:
      input.status === "planned" ||
      input.status === "current" ||
      input.status === "completed"
        ? input.status
        : "planned",
    weeksCount: typeof input.weeksCount === "number" ? input.weeksCount : 16,
    academicYear: input.academicYear,
    startDate: input.startDate,
    endDate: input.endDate,
    notes: input.notes,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord<T>(value: unknown): Record<string, T> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, T>)
    : {};
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function readStore(): Promise<AppDataFile> {
  const rows = await prisma.userAppData.findMany();

  return {
    users: Object.fromEntries(
      rows.map((row) => [
        row.userId,
        {
          semesters: asArray<PlannerSemester>(row.semesters),
          courses: asArray<Course>(row.courses),
          tasks: asArray<TaskItem>(row.tasks),
          reflections: asArray<ReflectionEntry>(row.reflections),
          notifications: asArray<Notification>(row.notifications),
          focusSessions: asArray<StoredFocusSession>(row.focusSessions),
          selfLearningPlans: asArray<LearningPlan>(row.selfLearningPlans),
          examPrepByItemId: asRecord<ExamPrepItem>(row.examPrepByItemId),
          detachedResources: asRecord<ResourceType[]>(row.detachedResources),
        } satisfies UserAppData,
      ]),
    ),
  };
}

async function writeStore(data: AppDataFile) {
  for (const [userId, userData] of Object.entries(data.users)) {
    await prisma.userAppData.upsert({
      where: { userId },
      update: {
        semesters: toJson(userData.semesters),
        courses: toJson(userData.courses),
        tasks: toJson(userData.tasks),
        reflections: toJson(userData.reflections),
        notifications: toJson(userData.notifications),
        focusSessions: toJson(userData.focusSessions),
        selfLearningPlans: toJson(userData.selfLearningPlans),
        examPrepByItemId: toJson(userData.examPrepByItemId),
        detachedResources: toJson(userData.detachedResources),
      },
      create: {
        userId,
        semesters: toJson(userData.semesters),
        courses: toJson(userData.courses),
        tasks: toJson(userData.tasks),
        reflections: toJson(userData.reflections),
        notifications: toJson(userData.notifications),
        focusSessions: toJson(userData.focusSessions),
        selfLearningPlans: toJson(userData.selfLearningPlans),
        examPrepByItemId: toJson(userData.examPrepByItemId),
        detachedResources: toJson(userData.detachedResources),
      },
    });
  }
}

function getUserData(data: AppDataFile, userId: string) {
  const stored = data.users[userId];
  if (!stored) {
    return { ...EMPTY_USER_DATA };
  }

  return {
    semesters: Array.isArray(stored.semesters) ? stored.semesters : [],
    courses: Array.isArray(stored.courses) ? stored.courses : [],
    tasks: Array.isArray(stored.tasks) ? stored.tasks : [],
    reflections: Array.isArray(stored.reflections) ? stored.reflections : [],
    notifications: Array.isArray(stored.notifications) ? stored.notifications : [],
    focusSessions: Array.isArray(stored.focusSessions) ? stored.focusSessions : [],
    selfLearningPlans: Array.isArray(stored.selfLearningPlans)
      ? stored.selfLearningPlans
      : [],
    examPrepByItemId:
      stored.examPrepByItemId && typeof stored.examPrepByItemId === "object"
        ? stored.examPrepByItemId
        : {},
    detachedResources:
      stored.detachedResources && typeof stored.detachedResources === "object"
        ? stored.detachedResources
        : {},
  };
}

function normalizeCourse(input: Partial<Course>): Course {
  const now = new Date().toISOString();
  const raw = input as Partial<Course> & {
    semester_id?: string | null;
    image_url?: string;
    duration_weeks?: number;
    numeric_grade?: number;
    final_grade?: string;
    academic_period?: string;
    weekly_plans?: Course["weeklyPlan"];
    academic_events?: Course["academicEvents"];
    created_at?: string;
  };

  const inferredSemesterId =
    raw.semesterId !== undefined
      ? raw.semesterId
      : raw.semester_id === null && raw.academic_period
        ? "prior-completed"
        : raw.semester_id || undefined;

  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    instructor: input.instructor || "",
    credits: typeof input.credits === "number" ? input.credits : 0,
    semesterId: inferredSemesterId,
    status:
      input.status === "current" ||
      input.status === "completed" ||
      input.status === "planned"
        ? input.status
        : "planned",
    imageUrl: input.imageUrl || raw.image_url || "",
    durationWeeks:
      typeof input.durationWeeks === "number"
        ? input.durationWeeks
        : typeof raw.duration_weeks === "number"
          ? raw.duration_weeks
          : 16,
    currentWeek: input.currentWeek,
    code: input.code,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    progress: typeof input.progress === "number" ? input.progress : undefined,
    finalGrade: input.finalGrade || raw.final_grade,
    numericGrade:
      typeof input.numericGrade === "number"
        ? input.numericGrade
        : typeof raw.numeric_grade === "number"
          ? raw.numeric_grade
          : undefined,
    academicPeriod: input.academicPeriod || raw.academic_period,
    weeklyPlan: Array.isArray(input.weeklyPlan)
      ? input.weeklyPlan
      : Array.isArray(raw.weekly_plans)
        ? raw.weekly_plans
        : [],
    upcomingTasks: Array.isArray(input.upcomingTasks) ? input.upcomingTasks : [],
    assignments: Array.isArray(input.assignments) ? input.assignments : [],
    exams: Array.isArray(input.exams) ? input.exams : [],
    resources: Array.isArray(input.resources) ? input.resources : [],
    academicEvents: Array.isArray(input.academicEvents)
      ? input.academicEvents
      : Array.isArray(raw.academic_events)
        ? raw.academic_events
        : [],
    createdAt: input.createdAt || raw.created_at || now,
  };
}

function normalizeTask(input: Partial<TaskItem>): TaskItem {
  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    description: input.description,
    type:
      input.type === "general" ||
      input.type === "study-task" ||
      input.type === "assignment" ||
      input.type === "quiz" ||
      input.type === "exam" ||
      input.type === "self-learning-milestone"
        ? input.type
        : "general",
    sourceModule:
      input.sourceModule === "course" ||
      input.sourceModule === "self-learning" ||
      input.sourceModule === "general"
        ? input.sourceModule
        : "general",
    linkedCourseId: input.linkedCourseId,
    linkedCourseTitle: input.linkedCourseTitle,
    linkedWeekId: input.linkedWeekId,
    linkedWeekLabel: input.linkedWeekLabel,
    linkedLearningPlanId: input.linkedLearningPlanId,
    linkedLearningPlanTitle: input.linkedLearningPlanTitle,
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    priority:
      input.priority === "high" ||
      input.priority === "medium" ||
      input.priority === "low"
        ? input.priority
        : "medium",
    status:
      input.status === "todo" ||
      input.status === "in-progress" ||
      input.status === "done"
        ? input.status
        : "todo",
    previousStatus:
      input.previousStatus === "todo" ||
      input.previousStatus === "in-progress" ||
      input.previousStatus === "done"
        ? input.previousStatus
        : undefined,
    recurrence: input.recurrence,
    savedRecurrence: input.savedRecurrence,
    reminder: input.reminder,
    reminderConfig: input.reminderConfig,
    notes: input.notes,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeReflection(input: Partial<ReflectionEntry>): ReflectionEntry {
  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    date: input.date || now.slice(0, 10),
    mood:
      input.mood === "excellent" ||
      input.mood === "good" ||
      input.mood === "neutral" ||
      input.mood === "stressed" ||
      input.mood === "tired" ||
      input.mood === "sad"
        ? input.mood
        : "good",
    achieved: input.achieved || "",
    difficult: input.difficult || "",
    learned: input.learned || "",
    improveNext: input.improveNext || "",
    gratitude: input.gratitude,
    tags: Array.isArray(input.tags) ? input.tags : undefined,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function normalizeNotification(input: Partial<Notification>): Notification {
  return {
    id: input.id || crypto.randomUUID(),
    title: input.title || "",
    message: input.message || "",
    type:
      input.type === "task" ||
      input.type === "course" ||
      input.type === "exam" ||
      input.type === "assignment" ||
      input.type === "reflection" ||
      input.type === "system" ||
      input.type === "reminder"
        ? input.type
        : "system",
    severity:
      input.severity === "critical" ||
      input.severity === "warning" ||
      input.severity === "success" ||
      input.severity === "info"
        ? input.severity
        : "info",
    read: Boolean(input.read),
    dismissed: Boolean(input.dismissed),
    createdAt: input.createdAt || new Date().toISOString(),
    eventDate: input.eventDate,
    targetRoute: input.targetRoute || "/dashboard",
    targetId: input.targetId,
  };
}

function normalizeFocusSession(
  input: Partial<StoredFocusSession>,
): StoredFocusSession {
  const now = new Date().toISOString();
  return {
    id: input.id || crypto.randomUUID(),
    durationMinutes:
      typeof input.durationMinutes === "number" ? input.durationMinutes : 0,
    startTime: input.startTime || now,
    endTime: input.endTime ?? null,
    mode:
      input.mode === "pomodoro" || input.mode === "stopwatch"
        ? input.mode
        : "pomodoro",
    completed: Boolean(input.completed),
    linkedTaskId: input.linkedTaskId ?? null,
    linkedCourseId: input.linkedCourseId ?? null,
    notes: input.notes ?? null,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export async function listCourses(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).courses;
}

export async function listSemesters(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).semesters;
}

export async function saveSemester(userId: string, input: Partial<PlannerSemester>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeSemester(input);
  const index = userData.semesters.findIndex(
    (semester) => semester.id === normalized.id,
  );

  const nextSemesters =
    index === -1
      ? [...userData.semesters, normalized]
      : userData.semesters.map((semester, currentIndex) =>
          currentIndex === index ? { ...semester, ...normalized } : semester,
        );

  store.users[userId] = {
    ...userData,
    semesters: nextSemesters,
  };
  await writeStore(store);
  return normalized;
}

export async function getSemester(userId: string, semesterId: string) {
  const store = await readStore();
  return (
    getUserData(store, userId).semesters.find(
      (semester) => semester.id === semesterId,
    ) ?? null
  );
}

export async function deleteSemester(userId: string, semesterId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextSemesters = userData.semesters.filter(
    (semester) => semester.id !== semesterId,
  );
  const nextCourses = userData.courses.filter(
    (course) => course.semesterId !== semesterId,
  );
  const deleted = nextSemesters.length !== userData.semesters.length;

  store.users[userId] = {
    ...userData,
    semesters: nextSemesters,
    courses: nextCourses,
  };
  await writeStore(store);
  return deleted;
}

export async function saveCourse(userId: string, input: Partial<Course>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeCourse(input);
  const index = userData.courses.findIndex((course) => course.id === normalized.id);

  const nextCourses =
    index === -1
      ? [...userData.courses, normalized]
      : userData.courses.map((course, currentIndex) =>
          currentIndex === index
            ? {
                ...course,
                ...normalized,
                createdAt: course.createdAt || normalized.createdAt,
              }
            : course,
        );

  store.users[userId] = {
    ...userData,
    courses: nextCourses,
  };
  await writeStore(store);
  return normalized;
}

export async function getCourse(userId: string, courseId: string) {
  const store = await readStore();
  return getUserData(store, userId).courses.find((course) => course.id === courseId) ?? null;
}

export async function deleteCourse(userId: string, courseId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextCourses = userData.courses.filter((course) => course.id !== courseId);
  const deleted = nextCourses.length !== userData.courses.length;

  store.users[userId] = {
    ...userData,
    courses: nextCourses,
  };
  await writeStore(store);
  return deleted;
}

export async function listTasks(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).tasks;
}

export async function listReflections(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).reflections;
}

export async function listNotifications(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).notifications;
}

export async function listFocusSessions(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).focusSessions;
}

export async function listLearningPlans(userId: string) {
  const store = await readStore();
  return getUserData(store, userId).selfLearningPlans;
}

export async function saveLearningPlan(userId: string, input: Partial<LearningPlan>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeLearningPlan(input);
  const index = userData.selfLearningPlans.findIndex((plan) => plan.id === normalized.id);

  const nextPlans =
    index === -1
      ? [...userData.selfLearningPlans, normalized]
      : userData.selfLearningPlans.map((plan, currentIndex) =>
          currentIndex === index
            ? {
                ...plan,
                ...normalized,
                createdAt: plan.createdAt || normalized.createdAt,
              }
            : plan,
        );

  store.users[userId] = {
    ...userData,
    selfLearningPlans: nextPlans,
  };
  await writeStore(store);
  return normalized;
}

export async function getLearningPlan(userId: string, planId: string) {
  const store = await readStore();
  return (
    getUserData(store, userId).selfLearningPlans.find((plan) => plan.id === planId) ??
    null
  );
}

export async function deleteLearningPlan(userId: string, planId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextPlans = userData.selfLearningPlans.filter((plan) => plan.id !== planId);
  const deleted = nextPlans.length !== userData.selfLearningPlans.length;

  store.users[userId] = {
    ...userData,
    selfLearningPlans: nextPlans,
  };
  await writeStore(store);
  return deleted;
}

export async function createResource(
  userId: string,
  input: {
    resourceable_id?: string;
    resourceable_type?: "Course" | "LearningPlan" | "WeekItem";
    title?: string;
    type?: "link" | "file" | "image";
    url?: string;
    description?: string;
  },
) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const resource: ResourceType = {
    id: crypto.randomUUID(),
    title: input.title || "",
    type:
      input.type === "file" || input.type === "image" || input.type === "link"
        ? input.type
        : "link",
    url: input.url || "",
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (input.resourceable_type === "Course" && input.resourceable_id) {
    const updatedCourses = userData.courses.map((course) =>
      course.id === input.resourceable_id
        ? {
            ...course,
            resources: [...(course.resources || []), resource],
          }
        : course,
    );

    store.users[userId] = {
      ...userData,
      courses: updatedCourses,
    };
    await writeStore(store);
    return resource;
  }

  if (input.resourceable_type === "WeekItem" && input.resourceable_id) {
    const current = userData.examPrepByItemId[input.resourceable_id] || {
      topics: [],
      resources: [],
    };
    store.users[userId] = {
      ...userData,
      examPrepByItemId: {
        ...userData.examPrepByItemId,
        [input.resourceable_id]: {
          ...current,
          resources: [...current.resources, resource],
        },
      },
    };
    await writeStore(store);
    return resource;
  }

  if (input.resourceable_type === "LearningPlan" && input.resourceable_id) {
    const updatedPlans = userData.selfLearningPlans.map((plan) =>
      plan.id === input.resourceable_id
        ? {
            ...plan,
            resources: [...(plan.resources || []), normalizeLearningResource(resource)],
            updatedAt: new Date().toISOString(),
          }
        : plan,
    );
    const current = userData.detachedResources[input.resourceable_id] || [];
    store.users[userId] = {
      ...userData,
      selfLearningPlans: updatedPlans,
      detachedResources: {
        ...userData.detachedResources,
        [input.resourceable_id]: [...current, resource],
      },
    };
    await writeStore(store);
    return resource;
  }

  throw new Error("Unsupported resource target.");
}

export async function updateResource(
  userId: string,
  resourceId: string,
  updates: Partial<ResourceType>,
) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  let updatedResource: ResourceType | null = null;

  const updatedCourses = userData.courses.map((course) => {
    const resources = (course.resources || []).map((resource) => {
      if (resource.id !== resourceId) {
        return resource;
      }
      updatedResource = {
        ...resource,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedResource;
    });
    return { ...course, resources };
  });

  const updatedExamPrepByItemId = Object.fromEntries(
    Object.entries(userData.examPrepByItemId).map(([itemId, prep]) => [
      itemId,
      {
        ...prep,
        resources: prep.resources.map((resource) => {
          if (resource.id !== resourceId) {
            return resource;
          }
          updatedResource = {
            ...resource,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedResource;
        }),
      },
    ]),
  );

  const updatedDetachedResources = Object.fromEntries(
    Object.entries(userData.detachedResources).map(([targetId, resources]) => [
      targetId,
      resources.map((resource) => {
        if (resource.id !== resourceId) {
          return resource;
        }
        updatedResource = {
          ...resource,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedResource;
      }),
    ]),
  );

  if (!updatedResource) {
    return null;
  }

  const updatedPlans = userData.selfLearningPlans.map((plan) => ({
    ...plan,
    resources: (plan.resources || []).map((resource) => {
      if (resource.id !== resourceId) {
        return resource;
      }
      updatedResource = {
        ...resource,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedResource;
    }),
  }));

  store.users[userId] = {
    ...userData,
    courses: updatedCourses,
    selfLearningPlans: updatedPlans,
    examPrepByItemId: updatedExamPrepByItemId,
    detachedResources: updatedDetachedResources,
  };
  await writeStore(store);
  return updatedResource;
}

export async function deleteResource(userId: string, resourceId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  let deleted = false;

  const updatedCourses = userData.courses.map((course) => {
    const nextResources = (course.resources || []).filter((resource) => {
      if (resource.id === resourceId) {
        deleted = true;
        return false;
      }
      return true;
    });
    return { ...course, resources: nextResources };
  });

  const updatedExamPrepByItemId = Object.fromEntries(
    Object.entries(userData.examPrepByItemId).map(([itemId, prep]) => [
      itemId,
      {
        ...prep,
        resources: prep.resources.filter((resource) => {
          if (resource.id === resourceId) {
            deleted = true;
            return false;
          }
          return true;
        }),
      },
    ]),
  );

  const updatedDetachedResources = Object.fromEntries(
    Object.entries(userData.detachedResources).map(([targetId, resources]) => [
      targetId,
      resources.filter((resource) => {
        if (resource.id === resourceId) {
          deleted = true;
          return false;
        }
        return true;
      }),
    ]),
  );

  store.users[userId] = {
    ...userData,
    courses: updatedCourses,
    selfLearningPlans: userData.selfLearningPlans.map((plan) => ({
      ...plan,
      resources: (plan.resources || []).filter((resource) => {
        if (resource.id === resourceId) {
          deleted = true;
          return false;
        }
        return true;
      }),
    })),
    examPrepByItemId: updatedExamPrepByItemId,
    detachedResources: updatedDetachedResources,
  };
  await writeStore(store);
  return deleted;
}

export async function getExamPrep(userId: string, itemId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  return userData.examPrepByItemId[itemId] || { topics: [], resources: [] };
}

export async function addExamPrepTopic(
  userId: string,
  itemId: string,
  topic: Partial<ExamPreparationTopic>,
) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const current = userData.examPrepByItemId[itemId] || { topics: [], resources: [] };
  const nextTopic: ExamPreparationTopic = {
    id: topic.id || crypto.randomUUID(),
    title: topic.title || "",
    completed: Boolean(topic.completed),
    priority:
      topic.priority === "high" || topic.priority === "medium" || topic.priority === "low"
        ? topic.priority
        : undefined,
    notes: topic.notes,
  };

  store.users[userId] = {
    ...userData,
    examPrepByItemId: {
      ...userData.examPrepByItemId,
      [itemId]: {
        ...current,
        topics: [...current.topics, nextTopic],
      },
    },
  };
  await writeStore(store);
  return nextTopic;
}

export async function updateExamPrepTopic(
  userId: string,
  itemId: string,
  topicId: string,
  updates: Partial<ExamPreparationTopic>,
) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const current = userData.examPrepByItemId[itemId] || { topics: [], resources: [] };
  let found = false;

  const nextTopics = current.topics.map((topic) => {
    if (topic.id !== topicId) {
      return topic;
    }
    found = true;
    return { ...topic, ...updates };
  });

  if (!found) {
    return null;
  }

  store.users[userId] = {
    ...userData,
    examPrepByItemId: {
      ...userData.examPrepByItemId,
      [itemId]: {
        ...current,
        topics: nextTopics,
      },
    },
  };
  await writeStore(store);
  return nextTopics.find((topic) => topic.id === topicId) || null;
}

export async function deleteExamPrepTopic(userId: string, itemId: string, topicId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const current = userData.examPrepByItemId[itemId] || { topics: [], resources: [] };
  const nextTopics = current.topics.filter((topic) => topic.id !== topicId);
  const deleted = nextTopics.length !== current.topics.length;

  store.users[userId] = {
    ...userData,
    examPrepByItemId: {
      ...userData.examPrepByItemId,
      [itemId]: {
        ...current,
        topics: nextTopics,
      },
    },
  };
  await writeStore(store);
  return deleted;
}

export async function saveTask(userId: string, input: Partial<TaskItem>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeTask(input);
  const index = userData.tasks.findIndex((task) => task.id === normalized.id);

  const nextTasks =
    index === -1
      ? [...userData.tasks, normalized]
      : userData.tasks.map((task, currentIndex) =>
          currentIndex === index
            ? {
                ...task,
                ...normalized,
                createdAt: task.createdAt || normalized.createdAt,
                updatedAt: normalized.updatedAt || new Date().toISOString(),
              }
            : task,
        );

  store.users[userId] = {
    ...userData,
    tasks: nextTasks,
  };
  await writeStore(store);
  return normalized;
}

export async function saveReflection(userId: string, input: Partial<ReflectionEntry>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeReflection(input);
  const index = userData.reflections.findIndex(
    (reflection) => reflection.id === normalized.id,
  );

  const nextReflections =
    index === -1
      ? [...userData.reflections, normalized]
      : userData.reflections.map((reflection, currentIndex) =>
          currentIndex === index
            ? {
                ...reflection,
                ...normalized,
                createdAt: reflection.createdAt || normalized.createdAt,
                updatedAt: normalized.updatedAt || new Date().toISOString(),
              }
            : reflection,
        );

  store.users[userId] = {
    ...userData,
    reflections: nextReflections,
  };
  await writeStore(store);
  return normalized;
}

export async function saveNotification(userId: string, input: Partial<Notification>) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeNotification(input);
  const index = userData.notifications.findIndex(
    (notification) => notification.id === normalized.id,
  );

  const nextNotifications =
    index === -1
      ? [...userData.notifications, normalized]
      : userData.notifications.map((notification, currentIndex) =>
          currentIndex === index
            ? {
                ...notification,
                ...normalized,
              }
            : notification,
        );

  store.users[userId] = {
    ...userData,
    notifications: nextNotifications,
  };
  await writeStore(store);
  return normalized;
}

export async function saveFocusSession(
  userId: string,
  input: Partial<StoredFocusSession>,
) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const normalized = normalizeFocusSession(input);
  const index = userData.focusSessions.findIndex(
    (session) => session.id === normalized.id,
  );

  const nextFocusSessions =
    index === -1
      ? [...userData.focusSessions, normalized]
      : userData.focusSessions.map((session, currentIndex) =>
          currentIndex === index
            ? {
                ...session,
                ...normalized,
                createdAt: session.createdAt || normalized.createdAt,
                updatedAt: normalized.updatedAt || new Date().toISOString(),
              }
            : session,
        );

  store.users[userId] = {
    ...userData,
    focusSessions: nextFocusSessions,
  };
  await writeStore(store);
  return normalized;
}

export async function saveLearningStage(
  userId: string,
  planId: string,
  input: Partial<LearningStage>,
) {
  const plan = await getLearningPlan(userId, planId);
  if (!plan) {
    return null;
  }

  const stage = normalizeLearningStage({ ...input, planId });
  const existingIndex = plan.stages.findIndex((item) => item.id === stage.id);
  const nextStages =
    existingIndex === -1
      ? [...plan.stages, stage]
      : plan.stages.map((item, index) => (index === existingIndex ? { ...item, ...stage } : item));

  return saveLearningPlan(userId, {
    ...plan,
    stages: nextStages,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveLearningMilestone(
  userId: string,
  planId: string,
  input: Partial<LearningMilestone>,
) {
  const plan = await getLearningPlan(userId, planId);
  if (!plan) {
    return null;
  }

  const milestone = normalizeLearningMilestone({ ...input, planId });
  const existingIndex = plan.milestones.findIndex((item) => item.id === milestone.id);
  const nextMilestones =
    existingIndex === -1
      ? [...plan.milestones, milestone]
      : plan.milestones.map((item, index) =>
          index === existingIndex ? { ...item, ...milestone } : item,
        );

  return saveLearningPlan(userId, {
    ...plan,
    milestones: nextMilestones,
    updatedAt: new Date().toISOString(),
  });
}

export async function getTask(userId: string, taskId: string) {
  const store = await readStore();
  return getUserData(store, userId).tasks.find((task) => task.id === taskId) ?? null;
}

export async function getReflection(userId: string, reflectionId: string) {
  const store = await readStore();
  return (
    getUserData(store, userId).reflections.find(
      (reflection) => reflection.id === reflectionId,
    ) ?? null
  );
}

export async function getNotification(userId: string, notificationId: string) {
  const store = await readStore();
  return (
    getUserData(store, userId).notifications.find(
      (notification) => notification.id === notificationId,
    ) ?? null
  );
}

export async function getFocusSession(userId: string, sessionId: string) {
  const store = await readStore();
  return (
    getUserData(store, userId).focusSessions.find(
      (session) => session.id === sessionId,
    ) ?? null
  );
}

export async function deleteTask(userId: string, taskId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextTasks = userData.tasks.filter((task) => task.id !== taskId);
  const deleted = nextTasks.length !== userData.tasks.length;

  store.users[userId] = {
    ...userData,
    tasks: nextTasks,
  };
  await writeStore(store);
  return deleted;
}

export async function deleteReflection(userId: string, reflectionId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextReflections = userData.reflections.filter(
    (reflection) => reflection.id !== reflectionId,
  );
  const deleted = nextReflections.length !== userData.reflections.length;

  store.users[userId] = {
    ...userData,
    reflections: nextReflections,
  };
  await writeStore(store);
  return deleted;
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await getNotification(userId, notificationId);
  if (!notification) {
    return null;
  }

  return saveNotification(userId, { ...notification, read: true });
}

export async function markAllNotificationsAsRead(userId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextNotifications = userData.notifications.map((notification) => ({
    ...notification,
    read: true,
  }));

  store.users[userId] = {
    ...userData,
    notifications: nextNotifications,
  };
  await writeStore(store);
  return nextNotifications;
}

export async function deleteNotification(userId: string, notificationId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextNotifications = userData.notifications.filter(
    (notification) => notification.id !== notificationId,
  );
  const deleted = nextNotifications.length !== userData.notifications.length;

  store.users[userId] = {
    ...userData,
    notifications: nextNotifications,
  };
  await writeStore(store);
  return deleted;
}

export async function deleteFocusSession(userId: string, sessionId: string) {
  const store = await readStore();
  const userData = getUserData(store, userId);
  const nextFocusSessions = userData.focusSessions.filter(
    (session) => session.id !== sessionId,
  );
  const deleted = nextFocusSessions.length !== userData.focusSessions.length;

  store.users[userId] = {
    ...userData,
    focusSessions: nextFocusSessions,
  };
  await writeStore(store);
  return deleted;
}

import { apiClient } from "@/lib/api-client";
import { Course, WeeklyPlan } from "@/types/course";
import { TaskItem } from "@/types/tasks";
import { ReflectionEntry } from "@/types/reflections";
import { LearningPlan } from "@/types/self-learning";
import { PlannerSemester } from "@/types/academic-planning";
import { Notification } from "@/types/notifications";

type BackendRecord = Record<string, unknown>;
type BackendCourseResponse = BackendRecord & {
  course?: BackendRecord;
};

const asString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
};

const asOptionalString = (value: unknown): string | undefined => {
  const normalized = asString(value, "");
  return normalized || undefined;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  return asNumber(value);
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

function mapCourseFromBackend(course: BackendRecord): Course {
  const weeklyPlans = asArray<BackendRecord>(course.weekly_plans ?? course.weeklyPlan);

  return {
    id: asString(course.id),
    title: asString(course.title),
    instructor: asString(course.instructor),
    credits: asNumber(course.credits, 0),
    semesterId: asOptionalString(course.semester_id ?? course.semesterId),
    status: asString(course.status, "planned") as Course["status"],
    imageUrl: asString(course.image_url ?? course.imageUrl),
    durationWeeks: asNumber(course.duration_weeks ?? course.durationWeeks, 16),
    code: asString(course.code),
    description: asString(course.description),
    numericGrade: asOptionalNumber(course.numeric_grade ?? course.numericGrade),
    finalGrade: asOptionalString(course.final_grade ?? course.finalGrade),
    academicPeriod: asOptionalString(course.academic_period ?? course.academicPeriod),
    createdAt: asOptionalString(course.created_at ?? course.createdAt),
    weeklyPlan: weeklyPlans.map(mapWeeklyPlanFromBackend),
    assignments: asArray<NonNullable<Course["assignments"]>[number]>(course.assignments),
    exams: asArray<NonNullable<Course["exams"]>[number]>(course.exams),
    resources: asArray<NonNullable<Course["resources"]>[number]>(course.resources),
    academicEvents: asArray<NonNullable<Course["academicEvents"]>[number]>(course.academic_events ?? course.academicEvents),
  };
}

function mapWeeklyPlanFromBackend(week: BackendRecord): WeeklyPlan {
  return {
    weekNumber: asNumber(week.week_number ?? week.weekNumber, 1),
    title: asString(week.title),
    completed: Boolean(week.completed),
    studyTasks: asArray<WeeklyPlan["studyTasks"][number]>(week.study_tasks ?? week.studyTasks),
    assignments: asArray<WeeklyPlan["assignments"][number]>(week.assignments),
    exams: asArray<WeeklyPlan["exams"][number]>(week.exams),
    items: asArray<NonNullable<WeeklyPlan["items"]>[number]>(week.items),
  };
}

function mapCourseToBackend(course: Partial<Course>): Record<string, unknown> {
  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor,
    credits: course.credits,
    semester_id: course.semesterId === "prior-completed" ? null : (course.semesterId || null),
    status: course.status,
    image_url: course.imageUrl,
    duration_weeks: course.durationWeeks,
    code: course.code,
    description: course.description,
    numeric_grade: course.numericGrade,
    final_grade: course.finalGrade,
    academic_period: course.academicPeriod,
    weeklyPlan: course.weeklyPlan,
    assignments: course.assignments,
    exams: course.exams,
    resources: course.resources,
    academicEvents: course.academicEvents,
    progress: course.progress,
    currentWeek: course.currentWeek,
    startDate: course.startDate,
    endDate: course.endDate,
    createdAt: course.createdAt,
  };
}

function mapSemesterFromBackend(semester: BackendRecord): PlannerSemester {
  return {
    id: asString(semester.id),
    name: asString(semester.name),
    status: asString(semester.status, "planned") as PlannerSemester["status"],
    weeksCount: asNumber(semester.num_of_weeks ?? semester.weeksCount, 16),
    academicYear: asString(semester.academic_year ?? semester.academicYear),
    startDate: asOptionalString(semester.start_date ?? semester.startDate),
    endDate: asOptionalString(semester.end_date ?? semester.endDate),
    notes: asOptionalString(semester.notes),
  };
}

function mapSemesterToBackend(semester: Partial<PlannerSemester>): Record<string, unknown> {
  return {
    name: semester.name,
    academic_year: semester.academicYear,
    num_of_weeks: semester.weeksCount,
    status: semester.status,
    start_date: semester.startDate,
    end_date: semester.endDate,
    notes: semester.notes,
  };
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  startTime: string;
  endTime?: string | null;
  mode: "pomodoro" | "stopwatch";
  completed: boolean;
  linkedTaskId?: string | null;
  linkedCourseId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FocusAnalytics {
  totalSessions: number;
  totalMinutesAllTime: number;
  weekly: {
    totalSessions: number;
    totalMinutes: number;
    dailyBreakdown: { date: string; minutes: number }[];
  };
  monthly: {
    totalSessions: number;
    totalMinutes: number;
  };
  averageSessionMinutes: number;
}

/**
 * Data service â€” all API calls for app data
 */
export const DataService = {
  async getCourses(): Promise<Course[]> {
    const data = await apiClient.get<BackendRecord[]>("/courses");
    return Array.isArray(data) ? data.map(mapCourseFromBackend) : [];
  },

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    const payload = mapCourseToBackend(course);
    const response = await apiClient.post<BackendCourseResponse>("/courses", payload);
    return mapCourseFromBackend(response.course ?? response);
  },

  async updateCourse(course: Course): Promise<Course> {
    const payload = mapCourseToBackend(course);
    const response = await apiClient.put<BackendCourseResponse>(`/courses/${course.id}`, payload);
    return mapCourseFromBackend(response.course ?? response);
  },

  async deleteCourse(id: string): Promise<void> {
    return apiClient.delete(`/courses/${id}`);
  },

  async getTasks(): Promise<TaskItem[]> {
    return apiClient.get<TaskItem[]>("/tasks");
  },

  async createTask(task: Omit<TaskItem, "id">): Promise<TaskItem> {
    return apiClient.post<TaskItem>("/tasks", task);
  },

  async updateTask(task: TaskItem): Promise<TaskItem> {
    return apiClient.put<TaskItem>(`/tasks/${task.id}`, task);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`);
  },

  async getReflections(): Promise<ReflectionEntry[]> {
    return apiClient.get<ReflectionEntry[]>("/reflections");
  },

  async createReflection(reflection: Omit<ReflectionEntry, "id">): Promise<ReflectionEntry> {
    return apiClient.post<ReflectionEntry>("/reflections", reflection);
  },

  async updateReflection(reflection: ReflectionEntry): Promise<ReflectionEntry> {
    return apiClient.put<ReflectionEntry>(`/reflections/${reflection.id}`, reflection);
  },

  async deleteReflection(id: string): Promise<void> {
    return apiClient.delete(`/reflections/${id}`);
  },

  async getLearningPlans(): Promise<LearningPlan[]> {
    return apiClient.get<LearningPlan[]>("/self-learning");
  },

  async createLearningPlan(plan: Omit<LearningPlan, "id">): Promise<LearningPlan> {
    return apiClient.post<LearningPlan>("/self-learning", plan);
  },

  async updateLearningPlan(plan: LearningPlan): Promise<LearningPlan> {
    return apiClient.patch<LearningPlan>(`/self-learning/${plan.id}`, plan);
  },

  async deleteLearningPlan(id: string): Promise<void> {
    return apiClient.delete(`/self-learning/${id}`);
  },

  async getSemesters(): Promise<PlannerSemester[]> {
    const data = await apiClient.get<BackendRecord[]>("/semesters");
    return Array.isArray(data) ? data.map(mapSemesterFromBackend) : [];
  },

  async createSemester(semester: Omit<PlannerSemester, "id">): Promise<PlannerSemester> {
    const payload = mapSemesterToBackend(semester);
    const response = await apiClient.post<BackendRecord>("/semesters", payload);
    return mapSemesterFromBackend(response);
  },

  async updateSemester(semester: PlannerSemester): Promise<PlannerSemester> {
    const payload = mapSemesterToBackend(semester);
    const response = await apiClient.put<BackendRecord>(`/semesters/${semester.id}`, payload);
    return mapSemesterFromBackend(response);
  },

  async deleteSemester(id: string): Promise<void> {
    return apiClient.delete(`/semesters/${id}`);
  },

  async getFocusSessions(): Promise<FocusSession[]> {
    return apiClient.get<FocusSession[]>("/focus/sessions");
  },

  async createFocusSession(session: {
    durationMinutes: number;
    startTime: string;
    endTime?: string;
    mode: "pomodoro" | "stopwatch";
    completed?: boolean;
    linkedTaskId?: string;
    linkedCourseId?: string;
    notes?: string;
  }): Promise<FocusSession> {
    return apiClient.post<FocusSession>("/focus/sessions", session);
  },

  async deleteFocusSession(id: string): Promise<void> {
    return apiClient.delete(`/focus/sessions/${id}`);
  },

  async getFocusAnalytics(): Promise<FocusAnalytics> {
    return apiClient.get<FocusAnalytics>("/focus/analytics");
  },

  async createResource(
    resourceableId: string,
    resourceableType: "Course" | "LearningPlan" | "WeekItem",
    resource: Omit<import("@/types/course").Resource, "id" | "createdAt" | "updatedAt">
  ): Promise<import("@/types/course").Resource> {
    return apiClient.post<import("@/types/course").Resource>("/resources", {
      ...resource,
      resourceable_id: resourceableId,
      resourceable_type: resourceableType,
    });
  },

  async updateResource(
    id: string,
    resource: Partial<import("@/types/course").Resource>
  ): Promise<import("@/types/course").Resource> {
    return apiClient.put<import("@/types/course").Resource>(`/resources/${id}`, resource);
  },

  async deleteResource(id: string): Promise<void> {
    return apiClient.delete(`/resources/${id}`);
  },

  async getExamPrep(
    weekItemId: string
  ): Promise<{ topics: import("@/types/exam-mode").ExamPreparationTopic[]; resources: import("@/types/course").Resource[] }> {
    return apiClient.get<{ topics: import("@/types/exam-mode").ExamPreparationTopic[]; resources: import("@/types/course").Resource[] }>(
      `/exam-prep/${weekItemId}`
    );
  },

  async addExamPrepTopic(
    weekItemId: string,
    topic: Omit<import("@/types/exam-mode").ExamPreparationTopic, "id" | "completed">
  ): Promise<import("@/types/exam-mode").ExamPreparationTopic> {
    return apiClient.post<import("@/types/exam-mode").ExamPreparationTopic>(`/exam-prep/${weekItemId}/topics`, topic);
  },

  async updateExamPrepTopic(
    weekItemId: string,
    topicId: string,
    updates: Partial<import("@/types/exam-mode").ExamPreparationTopic>
  ): Promise<import("@/types/exam-mode").ExamPreparationTopic> {
    return apiClient.patch<import("@/types/exam-mode").ExamPreparationTopic>(`/exam-prep/${weekItemId}/topics/${topicId}`, updates);
  },

  async deleteExamPrepTopic(weekItemId: string, topicId: string): Promise<void> {
    return apiClient.delete(`/exam-prep/${weekItemId}/topics/${topicId}`);
  },

  async getNotifications(): Promise<Notification[]> {
    const data = await apiClient.get<BackendRecord[]>("/notifications");
    return data.map((notification) => ({
      id: asString(notification.id),
      title: asString(notification.title),
      message: asString(notification.message),
      type: asString(notification.type, "system") as Notification["type"],
      severity: asString(notification.severity, "info") as Notification["severity"],
      read: Boolean(notification.read_at),
      createdAt: asString(notification.created_at),
      eventDate: asOptionalString(notification.event_date),
      targetRoute: asString(notification.target_route, "/dashboard"),
      targetId: asOptionalString(notification.target_id),
    }));
  },

  async markNotificationAsRead(id: string): Promise<void> {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    return apiClient.post(`/notifications/mark-all-read`);
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`/notifications/${id}`);
  },

  async clearAllNotifications(): Promise<void> {
    return apiClient.post(`/notifications/clear-all`);
  },

  async loadAllData() {
    const [courses, tasks, reflections, learningPlans, semesters, notifications] = await Promise.all([
      DataService.getCourses().catch(() => []),
      DataService.getTasks().catch(() => []),
      DataService.getReflections().catch(() => []),
      DataService.getLearningPlans().catch(() => []),
      DataService.getSemesters().catch(() => []),
      DataService.getNotifications().catch(() => []),
    ]);

    return { courses, tasks, reflections, learningPlans, semesters, notifications };
  },
};

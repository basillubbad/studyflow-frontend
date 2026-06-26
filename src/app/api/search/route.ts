import { NextRequest, NextResponse } from "next/server";
import { SearchResultItem } from "@/types/search";
import { Course, Resource, WeeklyPlan } from "@/types/course";
import { LearningPlan, LearningResource } from "@/types/self-learning";
import { ReflectionEntry } from "@/types/reflections";
import { TaskItem } from "@/types/tasks";
import { Notification } from "@/types/notifications";
import { PlannerSemester } from "@/types/academic-planning";

type BackendRecord = Record<string, unknown>;

type FocusSessionSearchItem = {
  id: string;
  title: string;
  notes?: string;
  mode?: string;
  durationMinutes?: number;
  startTime?: string;
  linkedCourseId?: string | null;
  linkedTaskId?: string | null;
};

type ScoredSearchResult = SearchResultItem & {
  score: number;
};

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function normalizeText(value?: string) {
  return value?.toLowerCase().trim() || "";
}

function tokenize(query: string) {
  return normalizeText(query)
    .split(/\s+/)
    .filter(Boolean);
}

function buildHaystack(parts: Array<string | undefined>) {
  return normalizeText(parts.filter(Boolean).join(" "));
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value, "");
  return normalized || undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function extractToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

async function fetchBackendArray<T>(
  endpoint: string,
  token: string,
): Promise<T[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

function mapWeeklyPlanFromBackend(week: BackendRecord): WeeklyPlan {
  return {
    weekNumber: asNumber(week.week_number ?? week.weekNumber, 1),
    title: asString(week.title),
    completed: Boolean(week.completed),
    studyTasks: asArray<WeeklyPlan["studyTasks"][number]>(
      week.study_tasks ?? week.studyTasks,
    ),
    assignments: asArray<WeeklyPlan["assignments"][number]>(week.assignments),
    exams: asArray<WeeklyPlan["exams"][number]>(week.exams),
    items: asArray<NonNullable<WeeklyPlan["items"]>[number]>(week.items),
  };
}

function mapCourseFromBackend(course: BackendRecord): Course {
  const weeklyPlans = asArray<BackendRecord>(
    course.weekly_plans ?? course.weeklyPlan,
  );

  const isPriorCompleted = Boolean(
    course.is_prior_completed ??
      course.isPriorCompleted ??
      ((course.academic_period ?? course.academicPeriod) &&
        !asOptionalString(course.semester_id ?? course.semesterId)) ??
      (!asOptionalString(course.semester_id ?? course.semesterId) &&
        asString(course.status) === "completed"),
  );

  return {
    id: asString(course.id),
    title: asString(course.title),
    instructor: asString(course.instructor),
    credits: asNumber(course.credits, 0),
    semesterId: isPriorCompleted
      ? "prior-completed"
      : asOptionalString(course.semester_id ?? course.semesterId),
    status: asString(course.status, "planned") as Course["status"],
    imageUrl: asString(course.image_url ?? course.imageUrl),
    durationWeeks: asNumber(
      course.duration_weeks ?? course.durationWeeks,
      16,
    ),
    code: asString(course.code),
    description: asString(course.description),
    numericGrade:
      course.numeric_grade === null || course.numericGrade === null
        ? undefined
        : asNumber(course.numeric_grade ?? course.numericGrade),
    finalGrade: asOptionalString(course.final_grade ?? course.finalGrade),
    academicPeriod: asOptionalString(
      course.academic_period ?? course.academicPeriod,
    ),
    createdAt: asOptionalString(course.created_at ?? course.createdAt),
    weeklyPlan: weeklyPlans.map(mapWeeklyPlanFromBackend),
    assignments: asArray<NonNullable<Course["assignments"]>[number]>(
      course.assignments,
    ),
    exams: asArray<NonNullable<Course["exams"]>[number]>(course.exams),
    resources: asArray<NonNullable<Course["resources"]>[number]>(
      course.resources,
    ),
    academicEvents: asArray<NonNullable<Course["academicEvents"]>[number]>(
      course.academic_events ?? course.academicEvents,
    ),
  };
}

function mapTaskFromBackend(task: BackendRecord): TaskItem {
  const normalizedStatus = asString(task.status, "todo");

  return {
    id: asString(task.id),
    title: asString(task.title),
    description: asOptionalString(task.description),
    type: asString(task.type, "general") as TaskItem["type"],
    sourceModule: asString(
      task.sourceModule ?? task.source_module,
      "general",
    ) as TaskItem["sourceModule"],
    linkedCourseId: asOptionalString(
      task.linkedCourseId ?? task.linked_course_id ?? task.course_id,
    ),
    linkedCourseTitle: asOptionalString(
      task.linkedCourseTitle ?? task.linked_course_title,
    ),
    linkedWeekId: asOptionalString(task.linkedWeekId ?? task.linked_week_id),
    linkedWeekLabel: asOptionalString(
      task.linkedWeekLabel ?? task.linked_week_label,
    ),
    linkedLearningPlanId: asOptionalString(
      task.linkedLearningPlanId ?? task.linked_learning_plan_id,
    ),
    linkedLearningPlanTitle: asOptionalString(
      task.linkedLearningPlanTitle ?? task.linked_learning_plan_title,
    ),
    dueDate: asOptionalString(task.dueDate ?? task.due_date),
    dueTime: asOptionalString(task.dueTime ?? task.due_time),
    priority: asString(task.priority, "medium") as TaskItem["priority"],
    status:
      normalizedStatus === "completed" || normalizedStatus === "done"
        ? "done"
        : normalizedStatus === "in-progress" || normalizedStatus === "in_progress"
          ? "in-progress"
          : "todo",
    previousStatus: asOptionalString(
      task.previousStatus ?? task.previous_status,
    ) as TaskItem["previousStatus"],
    reminder: Boolean(task.reminder),
    reminderConfig:
      typeof (task.reminderConfig ?? task.reminder_config) === "object"
        ? ((task.reminderConfig ?? task.reminder_config) as TaskItem["reminderConfig"])
        : undefined,
    notes: asOptionalString(task.notes),
    createdAt: asString(task.createdAt ?? task.created_at, new Date().toISOString()),
    updatedAt: asString(task.updatedAt ?? task.updated_at, new Date().toISOString()),
  };
}

function mapLearningPlanFromBackend(plan: BackendRecord): LearningPlan {
  return {
    id: asString(plan.id),
    title: asString(plan.title),
    description: asString(plan.description),
    goal: asString(plan.goal),
    category: asString(plan.category),
    targetSkill: asString(plan.targetSkill ?? plan.target_skill),
    startDate: asString(plan.startDate ?? plan.start_date),
    endDate: asString(plan.endDate ?? plan.end_date),
    status: asString(plan.status, "planned") as LearningPlan["status"],
    stages: asArray<LearningPlan["stages"][number]>(plan.stages),
    milestones: asArray<LearningPlan["milestones"][number]>(plan.milestones),
    resources: asArray<LearningResource>(plan.resources),
    createdAt: asString(plan.createdAt ?? plan.created_at, new Date().toISOString()),
    updatedAt: asString(plan.updatedAt ?? plan.updated_at, new Date().toISOString()),
  };
}

function mapReflectionFromBackend(reflection: BackendRecord): ReflectionEntry {
  return {
    id: asString(reflection.id),
    title: asString(reflection.title),
    date: asString(reflection.date),
    mood: asString(reflection.mood, "neutral") as ReflectionEntry["mood"],
    achieved: asString(reflection.achieved),
    difficult: asString(reflection.difficult),
    learned: asString(reflection.learned),
    improveNext: asString(reflection.improveNext),
    gratitude: asString(reflection.gratitude),
    tags: asArray<string>(reflection.tags),
    createdAt: asString(
      reflection.createdAt ?? reflection.created_at,
      new Date().toISOString(),
    ),
    updatedAt: asString(
      reflection.updatedAt ?? reflection.updated_at,
      new Date().toISOString(),
    ),
  };
}

function mapNotificationFromBackend(notification: BackendRecord): Notification {
  return {
    id: asString(notification.id),
    title: asString(notification.title),
    message: asString(notification.message),
    type: asString(notification.type, "system") as Notification["type"],
    severity: asString(
      notification.severity,
      "info",
    ) as Notification["severity"],
    read: Boolean(notification.read_at ?? notification.readAt),
    createdAt: asString(notification.created_at ?? notification.createdAt),
    eventDate: asOptionalString(notification.event_date ?? notification.eventDate),
    targetRoute: asString(notification.target_route ?? notification.targetRoute, "/dashboard"),
    targetId: asOptionalString(notification.target_id ?? notification.targetId),
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

function mapFocusSessionFromBackend(session: BackendRecord): FocusSessionSearchItem {
  const duration = asNumber(
    session.durationMinutes ?? session.duration_minutes ?? session.minutes,
    0,
  );
  const mode = asString(session.mode ?? session.type, "pomodoro");

  return {
    id: asString(session.id),
    title: `${mode === "stopwatch" ? "Stopwatch" : "Pomodoro"} session ${duration > 0 ? `(${duration} min)` : ""}`.trim(),
    notes: asOptionalString(session.notes),
    mode,
    durationMinutes: duration,
    startTime: asOptionalString(session.startTime ?? session.start_time ?? session.created_at),
    linkedCourseId: asOptionalString(session.linkedCourseId ?? session.linked_course_id),
    linkedTaskId: asOptionalString(session.linkedTaskId ?? session.linked_task_id),
  };
}

function getMatchScore(
  query: string,
  title: string,
  extras: Array<string | undefined>,
) {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(title);
  const haystack = buildHaystack([title, ...extras]);
  const terms = tokenize(query);

  if (!normalizedQuery || !haystack) return 0;
  if (terms.some((term) => !haystack.includes(term))) return 0;

  let score = 0;

  if (normalizedTitle === normalizedQuery) score += 150;
  if (normalizedTitle.startsWith(normalizedQuery)) score += 90;
  if (normalizedTitle.includes(normalizedQuery)) score += 70;
  if (haystack.includes(normalizedQuery)) score += 40;

  score += terms.reduce((sum, term) => {
    if (normalizedTitle.startsWith(term)) return sum + 14;
    if (normalizedTitle.includes(term)) return sum + 10;
    if (haystack.includes(term)) return sum + 6;
    return sum;
  }, 0);

  return score;
}

function rankResults(results: ScoredSearchResult[], limit: number) {
  const unique = new Map<string, ScoredSearchResult>();

  results.forEach((result) => {
    const key = `${result.category}:${result.id}:${result.path}`;
    const existing = unique.get(key);
    if (!existing || existing.score < result.score) {
      unique.set(key, result);
    }
  });

  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((result) => {
      const { score, ...rest } = result;
      void score;
      return rest;
    });
}

function pushResult(
  results: ScoredSearchResult[],
  query: string,
  item: SearchResultItem,
  extras: Array<string | undefined>,
) {
  const score = getMatchScore(query, item.title, extras);
  if (score <= 0) return;
  results.push({ ...item, score });
}

function searchTasks(
  query: string,
  tasks: TaskItem[],
  results: ScoredSearchResult[],
) {
  tasks.forEach((task) => {
    pushResult(
      results,
      query,
      {
        id: task.id,
        title: task.title,
        category: "Task",
        path: "/tasks",
        description:
          task.description ||
          task.linkedCourseTitle ||
          task.linkedLearningPlanTitle,
      },
      [
        task.description,
        task.linkedCourseTitle,
        task.linkedLearningPlanTitle,
        task.linkedWeekLabel,
        task.notes,
        task.type,
        task.status,
      ],
    );
  });
}

function searchCourseResource(
  query: string,
  course: Course,
  resource: Resource,
  results: ScoredSearchResult[],
) {
  pushResult(
    results,
    query,
    {
      id: resource.id,
      title: resource.title,
      category: "Resource",
      path: `/courses/${course.id}`,
      description: `${course.title}${resource.description ? ` • ${resource.description}` : ""}`,
    },
    [course.title, course.code, resource.description, resource.type, resource.url],
  );
}

function searchCourseWeeklyPlan(
  query: string,
  course: Course,
  week: WeeklyPlan,
  results: ScoredSearchResult[],
) {
  (week.studyTasks || []).forEach((task) => {
    pushResult(
      results,
      query,
      {
        id: task.id,
        title: task.title,
        category: "Task",
        path: `/courses/${course.id}`,
        description: `${course.title} • Week ${week.weekNumber}`,
      },
      [course.title, course.code, week.title, `week ${week.weekNumber}`, task.dueDate],
    );
  });

  (week.assignments || []).forEach((assignment) => {
    pushResult(
      results,
      query,
      {
        id: assignment.id,
        title: assignment.title,
        category: "Task",
        path: `/courses/${course.id}`,
        description: `${course.title} • Week ${week.weekNumber} assignment`,
      },
      [
        course.title,
        course.code,
        week.title,
        `week ${week.weekNumber}`,
        assignment.description,
        assignment.dueDate,
      ],
    );
  });

  (week.exams || []).forEach((exam) => {
    pushResult(
      results,
      query,
      {
        id: exam.id,
        title: exam.title,
        category: "Exam",
        path: `/courses/${course.id}/${exam.id}`,
        description: `${course.title} • Week ${week.weekNumber} exam`,
      },
      [
        course.title,
        course.code,
        week.title,
        `week ${week.weekNumber}`,
        exam.type,
        exam.date,
        exam.location,
      ],
    );
  });

  week.items?.forEach((item) => {
    const category = item.type === "quiz" ? "Exam" : "Task";
    const path =
      item.type === "quiz" || item.type === "midterm" || item.type === "final"
        ? `/courses/${course.id}/${item.id}`
        : `/courses/${course.id}`;

    pushResult(
      results,
      query,
      {
        id: item.id,
        title: item.title,
        category,
        path,
        description: `${course.title} • Week ${week.weekNumber} ${item.type.replace("_", " ")}`,
      },
      [
        course.title,
        course.code,
        week.title,
        `week ${week.weekNumber}`,
        item.description,
        item.type,
        item.location,
        item.date,
      ],
    );
  });
}

function searchCourses(
  query: string,
  courses: Course[],
  results: ScoredSearchResult[],
) {
  courses.forEach((course) => {
    const isPriorCourse = course.semesterId === "prior-completed";
    pushResult(
      results,
      query,
      {
        id: course.id,
        title: course.title,
        category: isPriorCourse ? "Prior Course" : "Course",
        path: `/courses/${course.id}`,
        description: course.code || course.instructor || course.academicPeriod,
      },
      [
        course.code,
        course.instructor,
        course.description,
        course.academicPeriod,
        course.status,
        course.finalGrade,
      ],
    );

    course.assignments?.forEach((assignment) => {
      pushResult(
        results,
        query,
        {
          id: assignment.id,
          title: assignment.title,
          category: "Task",
          path: `/courses/${course.id}`,
          description: `Assignment in ${course.title}`,
        },
        [
          course.title,
          course.code,
          assignment.description,
          assignment.dueDate,
          assignment.status,
        ],
      );
    });

    course.exams?.forEach((exam) => {
      pushResult(
        results,
        query,
        {
          id: exam.id,
          title: exam.title,
          category: "Exam",
          path: `/courses/${course.id}/${exam.id}`,
          description: `Exam in ${course.title}`,
        },
        [course.title, course.code, exam.type, exam.date, exam.location],
      );
    });

    course.academicEvents?.forEach((event) => {
      pushResult(
        results,
        query,
        {
          id: event.id,
          title: event.title,
          category: event.type === "quiz" ? "Exam" : "Task",
          path: `/courses/${course.id}`,
          description: `${course.title} • ${event.type}`,
        },
        [
          course.title,
          course.code,
          event.description,
          event.type,
          event.date,
          event.location,
        ],
      );
    });

    course.resources?.forEach((resource) => {
      searchCourseResource(query, course, resource, results);
    });

    course.weeklyPlan?.forEach((week) => {
      searchCourseWeeklyPlan(query, course, week, results);
    });
  });
}

function searchPlanResource(
  query: string,
  plan: LearningPlan,
  resource: LearningResource,
  results: ScoredSearchResult[],
) {
  pushResult(
    results,
    query,
    {
      id: resource.id,
      title: resource.title,
      category: "Resource",
      path: `/self-learning/${plan.id}`,
      description: `${plan.title}${resource.description ? ` • ${resource.description}` : ""}`,
    },
    [plan.title, plan.goal, plan.category, resource.description, resource.type, resource.url],
  );
}

function searchLearningPlans(
  query: string,
  plans: LearningPlan[],
  results: ScoredSearchResult[],
) {
  plans.forEach((plan) => {
    pushResult(
      results,
      query,
      {
        id: plan.id,
        title: plan.title,
        category: "Self-Learning",
        path: `/self-learning/${plan.id}`,
        description: plan.description || plan.goal,
      },
      [plan.goal, plan.description, plan.category, plan.targetSkill, plan.status],
    );

    (plan.milestones || []).forEach((milestone) => {
      pushResult(
        results,
        query,
        {
          id: milestone.id,
          title: milestone.title,
          category: "Task",
          path: `/self-learning/${plan.id}`,
          description: `${plan.title} milestone`,
        },
        [plan.title, plan.goal, milestone.description, milestone.notes, milestone.targetDate],
      );
    });

    (plan.stages || []).forEach((stage) => {
      pushResult(
        results,
        query,
        {
          id: stage.id,
          title: stage.title,
          category: "Self-Learning",
          path: `/self-learning/${plan.id}`,
          description: `${plan.title} stage`,
        },
        [plan.title, plan.goal, stage.description, stage.goals, stage.targetDuration, stage.status],
      );

      stage.tasks?.forEach((task) => {
        pushResult(
          results,
          query,
          {
            id: task.id,
            title: task.title,
            category: "Task",
            path: `/self-learning/${plan.id}`,
            description: `${plan.title} • ${stage.title}`,
          },
          [plan.title, plan.goal, stage.title, task.dueDate, task.time],
        );
      });

      stage.resources?.forEach((resource) => {
        searchPlanResource(query, plan, resource, results);
      });
    });

    (plan.resources || []).forEach((resource) => {
      searchPlanResource(query, plan, resource, results);
    });
  });
}

function searchReflections(
  query: string,
  reflections: ReflectionEntry[],
  results: ScoredSearchResult[],
) {
  reflections.forEach((reflection) => {
    pushResult(
      results,
      query,
      {
        id: reflection.id,
        title: reflection.title,
        category: "Reflection",
        path: "/reflections",
        description:
          reflection.learned || reflection.achieved || reflection.difficult,
      },
      [
        reflection.achieved,
        reflection.difficult,
        reflection.learned,
        reflection.improveNext,
        reflection.gratitude,
        reflection.date,
        reflection.tags?.join(" "),
        reflection.mood,
      ],
    );
  });
}

function searchNotifications(
  query: string,
  notifications: Notification[],
  results: ScoredSearchResult[],
) {
  notifications.forEach((notification) => {
    pushResult(
      results,
      query,
      {
        id: notification.id,
        title: notification.title,
        category: "Notification",
        path: notification.targetRoute,
        description: notification.message,
      },
      [notification.message, notification.type, notification.severity, notification.eventDate],
    );
  });
}

function searchSemesters(
  query: string,
  semesters: PlannerSemester[],
  results: ScoredSearchResult[],
) {
  semesters.forEach((semester) => {
    pushResult(
      results,
      query,
      {
        id: semester.id,
        title: semester.name,
        category: "Semester",
        path: "/academic-planning",
        description: semester.academicYear || semester.notes,
      },
      [
        semester.academicYear,
        semester.status,
        semester.notes,
        semester.startDate,
        semester.endDate,
        String(semester.weeksCount),
      ],
    );
  });
}

function searchFocusSessions(
  query: string,
  sessions: FocusSessionSearchItem[],
  results: ScoredSearchResult[],
) {
  sessions.forEach((session) => {
    pushResult(
      results,
      query,
      {
        id: session.id,
        title: session.title,
        category: "Focus",
        path: "/focus",
        description: session.notes || session.mode,
      },
      [
        session.notes,
        session.mode,
        session.startTime,
        session.durationMinutes ? `${session.durationMinutes}` : undefined,
        session.linkedCourseId ?? undefined,
        session.linkedTaskId ?? undefined,
      ],
    );
  });
}

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "8");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 20)
    : 8;

  if (query.length < 2) {
    return NextResponse.json({ items: [] satisfies SearchResultItem[] });
  }

  const [
    rawCourses,
    rawTasks,
    rawLearningPlans,
    rawReflections,
    rawNotifications,
    rawSemesters,
    rawFocusSessions,
  ] = await Promise.all([
    fetchBackendArray<BackendRecord>("/courses", token),
    fetchBackendArray<BackendRecord>("/tasks", token),
    fetchBackendArray<BackendRecord>("/self-learning", token),
    fetchBackendArray<BackendRecord>("/reflections", token),
    fetchBackendArray<BackendRecord>("/notifications", token),
    fetchBackendArray<BackendRecord>("/semesters", token),
    fetchBackendArray<BackendRecord>("/focus/sessions", token),
  ]);

  const courses = rawCourses.map(mapCourseFromBackend);
  const tasks = rawTasks.map(mapTaskFromBackend);
  const learningPlans = rawLearningPlans.map(mapLearningPlanFromBackend);
  const reflections = rawReflections.map(mapReflectionFromBackend);
  const notifications = rawNotifications.map(mapNotificationFromBackend);
  const semesters = rawSemesters.map(mapSemesterFromBackend);
  const focusSessions = rawFocusSessions.map(mapFocusSessionFromBackend);

  const results: ScoredSearchResult[] = [];

  searchCourses(query, courses, results);
  searchTasks(query, tasks, results);
  searchLearningPlans(query, learningPlans, results);
  searchReflections(query, reflections, results);
  searchNotifications(query, notifications, results);
  searchSemesters(query, semesters, results);
  searchFocusSessions(query, focusSessions, results);

  return NextResponse.json({
    items: rankResults(results, limit),
  });
}

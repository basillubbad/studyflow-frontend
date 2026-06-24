import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth-request";
import {
  listCourses,
  listLearningPlans,
  listReflections,
  listTasks,
} from "@/lib/server/app-data-store";
import { buildNotificationFeed } from "@/lib/server/notification-feed";
import { SearchResultItem } from "@/types/search";
import { Course, Resource, WeeklyPlan } from "@/types/course";
import { LearningPlan, LearningResource } from "@/types/self-learning";
import { ReflectionEntry } from "@/types/reflections";
import { TaskItem } from "@/types/tasks";
import { Notification } from "@/types/notifications";

type ScoredSearchResult = SearchResultItem & {
  score: number;
};

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

function getMatchScore(query: string, title: string, extras: Array<string | undefined>) {
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
    .map(({ score, ...result }) => result);
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

function searchTasks(query: string, tasks: TaskItem[], results: ScoredSearchResult[]) {
  tasks.forEach((task) => {
    pushResult(
      results,
      query,
      {
        id: task.id,
        title: task.title,
        category: "Task",
        path: "/tasks",
        description: task.description || task.linkedCourseTitle || task.linkedLearningPlanTitle,
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

function searchCourses(query: string, courses: Course[], results: ScoredSearchResult[]) {
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
        [course.title, course.code, assignment.description, assignment.dueDate, assignment.status],
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
        [course.title, course.code, event.description, event.type, event.date, event.location],
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

function searchLearningPlans(query: string, plans: LearningPlan[], results: ScoredSearchResult[]) {
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

function searchReflections(query: string, reflections: ReflectionEntry[], results: ScoredSearchResult[]) {
  reflections.forEach((reflection) => {
    pushResult(
      results,
      query,
      {
        id: reflection.id,
        title: reflection.title,
        category: "Reflection",
        path: "/reflections",
        description: reflection.learned || reflection.achieved || reflection.difficult,
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

function searchNotifications(query: string, notifications: Notification[], results: ScoredSearchResult[]) {
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

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "8");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 8;

  if (query.length < 2) {
    return NextResponse.json({ items: [] satisfies SearchResultItem[] });
  }

  const [courses, tasks, learningPlans, reflections, notifications] = await Promise.all([
    listCourses(user.id),
    listTasks(user.id),
    listLearningPlans(user.id),
    listReflections(user.id),
    buildNotificationFeed(user.id),
  ]);

  const results: ScoredSearchResult[] = [];

  searchCourses(query, courses, results);
  searchTasks(query, tasks, results);
  searchLearningPlans(query, learningPlans, results);
  searchReflections(query, reflections, results);
  searchNotifications(query, notifications, results);

  return NextResponse.json({
    items: rankResults(results, limit),
  });
}

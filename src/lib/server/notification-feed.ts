import { Course } from "@/types/course";
import { Notification } from "@/types/notifications";
import { LearningPlan } from "@/types/self-learning";
import { TaskItem } from "@/types/tasks";
import {
  listCourses,
  listLearningPlans,
  listNotifications,
  listTasks,
} from "@/lib/server/app-data-store";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysUntil(dateString?: string) {
  if (!dateString) return null;
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(dateString));
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function pushTaskNotification(
  notifications: Notification[],
  seen: Set<string>,
  notification: Notification | null,
) {
  if (!notification || seen.has(notification.id)) return;
  seen.add(notification.id);
  notifications.push(notification);
}

function buildGeneralTaskNotification(task: TaskItem): Notification | null {
  if (!task.dueDate || task.status === "done") return null;
  const days = daysUntil(task.dueDate);
  if (days === null || days > 3) return null;

  const isOverdue = days < 0;
  const severity =
    isOverdue || days === 0 ? "critical" : days === 1 ? "warning" : "info";

  return {
    id: `task-deadline-${task.id}`,
    title: isOverdue ? "Overdue task" : "Task deadline",
    message: isOverdue
      ? `"${task.title}" was due ${dueLabel(days)}.`
      : `"${task.title}" is due ${dueLabel(days)}.`,
    type: "task",
    severity,
    read: false,
    createdAt: task.updatedAt || task.createdAt,
    eventDate: task.dueDate,
    targetRoute: "/tasks",
    targetId: task.id,
  };
}

function buildAssignmentNotification(
  course: Course,
  assignment: { id: string; title: string; dueDate: string; status?: string },
  scope: "course" | "weekly",
): Notification | null {
  if (!assignment.dueDate || assignment.status === "graded") return null;
  if (
    assignment.status === "submitted_early" ||
    assignment.status === "submitted_on_time" ||
    assignment.status === "submitted_late" ||
    assignment.status === "submitted"
  ) {
    return null;
  }

  const days = daysUntil(assignment.dueDate);
  if (days === null || days > 3) return null;

  const isOverdue = days < 0;
  const severity =
    isOverdue || days === 0 ? "critical" : days === 1 ? "warning" : "info";

  return {
    id: `${scope}-assignment-${assignment.id}`,
    title: isOverdue ? "Overdue assignment" : "Assignment deadline",
    message: isOverdue
      ? `${course.code || course.title}: "${assignment.title}" was due ${dueLabel(days)}.`
      : `${course.code || course.title}: "${assignment.title}" is due ${dueLabel(days)}.`,
    type: "assignment",
    severity,
    read: false,
    createdAt: course.createdAt || new Date().toISOString(),
    eventDate: assignment.dueDate,
    targetRoute: `/courses/${course.id}`,
    targetId: assignment.id,
  };
}

function buildExamNotification(
  course: Course,
  exam: { id: string; title: string; date: string; completed?: boolean },
  scope: "course" | "weekly",
): Notification | null {
  if (!exam.date || exam.completed) return null;
  const days = daysUntil(exam.date);
  if (days === null || days > 7) return null;

  const isOverdue = days < 0;
  const severity =
    isOverdue || days <= 1 ? "critical" : days <= 3 ? "warning" : "info";

  return {
    id: `${scope}-exam-${exam.id}`,
    title: isOverdue ? "Missed exam date" : "Upcoming exam",
    message: `${course.code || course.title}: "${exam.title}" is ${isOverdue ? `was ${dueLabel(days)}` : dueLabel(days)}.`,
    type: "exam",
    severity,
    read: false,
    createdAt: course.createdAt || new Date().toISOString(),
    eventDate: exam.date,
    targetRoute: `/courses/${course.id}`,
    targetId: exam.id,
  };
}

function buildAcademicEventNotification(
  course: Course,
  event: {
    id: string;
    title: string;
    type: string;
    date: string;
    status?: string;
    highlightLevel?: string;
  },
): Notification | null {
  if (!event.date || event.status === "completed") return null;
  const days = daysUntil(event.date);
  if (days === null || days > 7) return null;

  const severity =
    event.highlightLevel === "urgent" || days <= 1
      ? "critical"
      : event.highlightLevel === "important" || days <= 3
        ? "warning"
        : "info";

  return {
    id: `event-${event.id}`,
    title: `${event.type === "quiz" ? "Quiz" : "Academic event"} reminder`,
    message:
      days < 0
        ? `${course.code || course.title}: "${event.title}" was ${dueLabel(days)}.`
        : `${course.code || course.title}: "${event.title}" is ${dueLabel(days)}.`,
    type: event.type === "quiz" ? "exam" : "reminder",
    severity,
    read: false,
    createdAt: course.createdAt || new Date().toISOString(),
    eventDate: event.date,
    targetRoute: `/courses/${course.id}`,
    targetId: event.id,
  };
}

function buildMilestoneNotification(plan: LearningPlan, milestone: { id: string; title: string; targetDate?: string; completed?: boolean }): Notification | null {
  if (!milestone.targetDate || milestone.completed) return null;
  const days = daysUntil(milestone.targetDate);
  if (days === null || days > 7) return null;

  return {
    id: `milestone-${milestone.id}`,
    title: days <= 1 ? "Milestone deadline" : "Upcoming milestone",
    message:
      days < 0
        ? `${plan.title}: "${milestone.title}" was due ${dueLabel(days)}.`
        : `${plan.title}: "${milestone.title}" is due ${dueLabel(days)}.`,
    type: "reminder",
    severity: days <= 1 ? "critical" : days <= 3 ? "warning" : "info",
    read: false,
    createdAt: plan.updatedAt || plan.createdAt,
    eventDate: milestone.targetDate,
    targetRoute: `/self-learning/${plan.id}`,
    targetId: milestone.id,
  };
}

function buildSelfLearningTaskNotification(
  plan: LearningPlan,
  stageTitle: string,
  task: {
    id: string;
    title: string;
    dueDate?: string;
    completed?: boolean;
    createdAt?: string;
  },
): Notification | null {
  if (!task.dueDate || task.completed) return null;
  const days = daysUntil(task.dueDate);
  if (days === null || days > 3) return null;

  return {
    id: `self-task-${task.id}`,
    title: days <= 0 ? "Overdue learning task" : "Self-learning task",
    message:
      days < 0
        ? `${plan.title} / ${stageTitle}: "${task.title}" was due ${dueLabel(days)}.`
        : `${plan.title} / ${stageTitle}: "${task.title}" is due ${dueLabel(days)}.`,
    type: "task",
    severity: days <= 0 ? "critical" : days === 1 ? "warning" : "info",
    read: false,
    createdAt: task.createdAt || plan.updatedAt || plan.createdAt,
    eventDate: task.dueDate,
    targetRoute: `/self-learning/${plan.id}`,
    targetId: task.id,
  };
}

function mergeNotifications(
  generated: Notification[],
  stored: Notification[],
): Notification[] {
  const storedMap = new Map(stored.map((notification) => [notification.id, notification]));
  const generatedIds = new Set(generated.map((notification) => notification.id));

  const merged = generated
    .map((notification) => {
      const override = storedMap.get(notification.id);
      return override
        ? {
            ...notification,
            read: override.read,
            dismissed: override.dismissed,
          }
        : notification;
    })
    .filter((notification) => !notification.dismissed);

  const customStored = stored.filter(
    (notification) => !generatedIds.has(notification.id) && !notification.dismissed,
  );

  return [...merged, ...customStored];
}

export async function buildNotificationFeed(userId: string) {
  const [tasks, courses, learningPlans, storedNotifications] = await Promise.all([
    listTasks(userId),
    listCourses(userId),
    listLearningPlans(userId),
    listNotifications(userId),
  ]);

  const notifications: Notification[] = [];
  const seen = new Set<string>();

  tasks.forEach((task) => {
    pushTaskNotification(notifications, seen, buildGeneralTaskNotification(task));
  });

  courses.forEach((course) => {
    course.assignments?.forEach((assignment) => {
      pushTaskNotification(
        notifications,
        seen,
        buildAssignmentNotification(course, assignment, "course"),
      );
    });

    course.exams?.forEach((exam) => {
      pushTaskNotification(notifications, seen, buildExamNotification(course, exam, "course"));
    });

    course.academicEvents?.forEach((event) => {
      pushTaskNotification(
        notifications,
        seen,
        buildAcademicEventNotification(course, event),
      );
    });

    course.weeklyPlan?.forEach((week) => {
      week.assignments?.forEach((assignment) => {
        pushTaskNotification(
          notifications,
          seen,
          buildAssignmentNotification(course, assignment, "weekly"),
        );
      });

      week.exams?.forEach((exam) => {
        pushTaskNotification(
          notifications,
          seen,
          buildExamNotification(course, exam, "weekly"),
        );
      });

      week.studyTasks?.forEach((task) => {
        if (!task.dueDate || task.completed) return;
        const days = daysUntil(task.dueDate);
        if (days === null || days > 3) return;
        pushTaskNotification(notifications, seen, {
          id: `course-study-task-${task.id}`,
          title: days <= 0 ? "Overdue course task" : "Course task deadline",
          message:
            days < 0
              ? `${course.code || course.title}: "${task.title}" was due ${dueLabel(days)}.`
              : `${course.code || course.title}: "${task.title}" is due ${dueLabel(days)}.`,
          type: "task",
          severity: days <= 0 ? "critical" : days === 1 ? "warning" : "info",
          read: false,
          createdAt: course.createdAt || new Date().toISOString(),
          eventDate: task.dueDate,
          targetRoute: `/courses/${course.id}`,
          targetId: task.id,
        });
      });
    });
  });

  learningPlans.forEach((plan) => {
    plan.milestones?.forEach((milestone) => {
      pushTaskNotification(
        notifications,
        seen,
        buildMilestoneNotification(plan, milestone),
      );
    });

    plan.stages?.forEach((stage) => {
      stage.tasks?.forEach((task) => {
        pushTaskNotification(
          notifications,
          seen,
          buildSelfLearningTaskNotification(plan, stage.title, task),
        );
      });
    });
  });

  const merged = mergeNotifications(notifications, storedNotifications);

  return merged.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    const aDate = a.eventDate || a.createdAt;
    const bDate = b.eventDate || b.createdAt;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
}

export async function findNotificationInFeed(userId: string, id: string) {
  const notifications = await buildNotificationFeed(userId);
  return notifications.find((notification) => notification.id === id) || null;
}

import { Course } from "@/types/course";

export interface CalendarEvent {
  id: string;
  title: string;
  type: "task" | "assignment" | "quiz" | "exam" | "midterm" | "final";
  courseId: string;
  courseName: string;
  courseCode?: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  endTime?: string; // HH:MM format
  deadline?: string;
  status: "upcoming" | "completed" | "missed" | "overdue";
  description?: string;
  weekNumber?: number;
  location?: string;
  isAllDay?: boolean;
  completed?: boolean;
  path?: string;
}

export interface CalendarFilters {
  tasks: boolean;
  assignments: boolean;
  quizzes: boolean;
  exams: boolean;
  completed: boolean;
  courses: string[]; // course IDs
}

// Aggregate all events from courses into calendar events
export function aggregateCalendarEvents(courses: Course[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  courses.forEach((course) => {
    // Collect from weeklyPlan
    course.weeklyPlan?.forEach((week) => {
      // Tasks
      week.studyTasks.forEach((task) => {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          type: "task",
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          date: task.dueDate || new Date().toISOString().split("T")[0],
          status: task.completed ? "completed" : "upcoming",
          completed: task.completed,
          weekNumber: week.weekNumber,
          description: `Week ${week.weekNumber}`,
        });
      });

      // Assignments
      week.assignments.forEach((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const status =
          assignment.status !== "pending"
            ? "completed"
            : dueDate < now
              ? "overdue"
              : "upcoming";

        events.push({
          id: `assignment-${assignment.id}`,
          title: assignment.title,
          type: "assignment",
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          date: assignment.dueDate,
          status,
          description: assignment.description,
          weekNumber: week.weekNumber,
        });
      });

      // Exams
      week.exams.forEach((exam) => {
        const examDate = new Date(exam.date);
        const now = new Date();
        const status =
          examDate < now && examDate.toDateString() !== now.toDateString()
            ? "missed"
            : "upcoming";

        events.push({
          id: `exam-${exam.id}`,
          title: exam.title,
          type: exam.title.toLowerCase().includes("midterm")
            ? "midterm"
            : exam.title.toLowerCase().includes("final")
              ? "final"
              : "exam",
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          date: exam.date,
          time: exam.time,
          status,
          location: exam.location,
          weekNumber: week.weekNumber,
          isAllDay: false,
        });
      });
    });

    // Collect from top-level arrays if available
    course.assignments?.forEach((assignment) => {
      if (
        !course.weeklyPlan?.some((w) =>
          w.assignments.some((a) => a.id === assignment.id),
        )
      ) {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const status =
          assignment.status !== "pending"
            ? "completed"
            : dueDate < now
              ? "overdue"
              : "upcoming";

        events.push({
          id: `assignment-top-${assignment.id}`,
          title: assignment.title,
          type: "assignment",
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          date: assignment.dueDate,
          status,
          description: assignment.description,
        });
      }
    });

    course.exams?.forEach((exam) => {
      if (
        !course.weeklyPlan?.some((w) => w.exams.some((e) => e.id === exam.id))
      ) {
        const examDate = new Date(exam.date);
        const now = new Date();
        const status =
          examDate < now && examDate.toDateString() !== now.toDateString()
            ? "missed"
            : "upcoming";

        events.push({
          id: `exam-top-${exam.id}`,
          title: exam.title,
          type: exam.title.toLowerCase().includes("midterm")
            ? "midterm"
            : exam.title.toLowerCase().includes("final")
              ? "final"
              : "exam",
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          date: exam.date,
          time: exam.time,
          status,
          location: exam.location,
          isAllDay: false,
        });
      }
    });
  });

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function getEventColor(type: string, status: string): string {
  if (status === "completed") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
  }

  if (status === "overdue") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
  }

  switch (type) {
    case "task":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "assignment":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    case "quiz":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    case "exam":
    case "midterm":
    case "final":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800";
  }
}

export function getEventBgColor(type: string, status: string): string {
  if (status === "completed") {
    return "bg-green-50 dark:bg-green-950/20";
  }
  if (status === "overdue") {
    return "bg-red-50 dark:bg-red-950/20";
  }

  switch (type) {
    case "task":
      return "bg-blue-50 dark:bg-blue-950/20";
    case "assignment":
      return "bg-orange-50 dark:bg-orange-950/20";
    case "quiz":
      return "bg-yellow-50 dark:bg-yellow-950/20";
    case "exam":
    case "midterm":
    case "final":
      return "bg-red-50 dark:bg-red-950/20";
    default:
      return "bg-slate-50 dark:bg-slate-950/20";
  }
}

export function getEventDot(type: string, status: string): string {
  if (status === "completed") {
    return "bg-green-500";
  }
  if (status === "overdue") {
    return "bg-red-600";
  }

  switch (type) {
    case "task":
      return "bg-blue-500";
    case "assignment":
      return "bg-orange-500";
    case "quiz":
      return "bg-yellow-500";
    case "exam":
    case "midterm":
    case "final":
      return "bg-red-600";
    default:
      return "bg-slate-500";
  }
}

export function filterEvents(
  events: CalendarEvent[],
  filters: CalendarFilters,
): CalendarEvent[] {
  return events.filter((event) => {
    // Check type filters
    if (event.type === "task" && !filters.tasks) return false;
    if (event.type === "assignment" && !filters.assignments) return false;
    if (event.type === "quiz" && !filters.quizzes) return false;
    if (
      (event.type === "exam" ||
        event.type === "midterm" ||
        event.type === "final") &&
      !filters.exams
    )
      return false;

    // Check completed filter
    if (event.status === "completed" && !filters.completed) return false;

    // Check course filter
    if (filters.courses.length > 0 && !filters.courses.includes(event.courseId))
      return false;

    return true;
  });
}

export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    task: "Task",
    assignment: "Assignment",
    quiz: "Quiz",
    exam: "Exam",
    midterm: "Midterm",
    final: "Final",
  };
  return labels[type] || "Event";
}

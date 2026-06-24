import { AppState } from "@/types/app-state";
import { TaskItem } from "@/types/tasks";
import { CalendarEvent } from "@/lib/calendar-utils";

/**
 * Derives dashboard quick stats
 */
export function selectDashboardStats(state: AppState) {
  const courses = Array.isArray(state.courses) ? state.courses : [];
  const selfLearningPlans = Array.isArray(state.selfLearningPlans)
    ? state.selfLearningPlans
    : [];
  const allTasks = selectUnifiedTasks(state);
  const baselineCredits = parseInt(state.userProfile.completedCreditHours) || 0;

  const activeCourses = courses.filter((c) => c.status === "current").length;

  const pendingTasks = allTasks.filter((task) => task.status !== "done").length;

  const totalCredits = calculatePassedCompletedCredits(courses, baselineCredits);

  const completedMilestones = selfLearningPlans.reduce((sum, plan) => {
    const milestones = Array.isArray(plan.milestones) ? plan.milestones : [];
    return sum + milestones.filter((m) => m.completed).length;
  }, 0);

  return {
    activeCourses,
    pendingTasks,
    completedCredits: totalCredits,
    milestones: completedMilestones,
  };
}

/**
 * Selects high priority tasks for the dashboard
 */
export function selectHighPriorityTasks(state: AppState) {
  return selectUnifiedTasks(state)
    .filter((t) => t.priority === "high" && t.status !== "done")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
}

/**
 * Aggregates all dated items into CalendarEvents
 */
export function selectCalendarEvents(state: AppState): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // 1. Regular Tasks
  state.tasks.forEach((task) => {
    if (task.dueDate) {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        time: task.dueTime || "00:00",
        type: "task",
        description: `Priority: ${task.priority}`,
        status: task.status === "done" ? "completed" : "upcoming",
        completed: task.status === "done",
        courseId: "general",
        courseName: "General Tasks",
        path: "/tasks", // Or wherever tasks are managed
      });
    }
  });

  // 2. Course-specific items (Assignments, Exams, Quizzes)
  state.courses.forEach((course) => {
    // Top-level course lists
    course.assignments?.forEach((a) => {
      if (a.dueDate) {
        events.push({
          id: `assign-${a.id}`,
          title: a.title,
          date: a.dueDate,
          type: "assignment",
          courseId: course.id,
          courseCode: course.code,
          courseName: course.title,
          status:
            a.status !== "pending"
              ? "completed"
              : "upcoming",
          completed: a.status !== "pending",
          path: `/courses/${course.id}`,
        });
      }
    });

    course.exams?.forEach((e) => {
      if (e.date) {
        events.push({
          id: `exam-${e.id}`,
          title: e.title,
          date: e.date,
          time: e.time,
          type: "exam",
          status: "upcoming",
          courseId: course.id,
          courseCode: course.code,
          courseName: course.title,
          path: `/courses/${course.id}`,
        });
      }
    });

    // Nested weekly plan items
    course.weeklyPlan?.forEach((week) => {
      week.assignments?.forEach((a) => {
        if (a.dueDate) {
          events.push({
            id: `w-assign-${a.id}`,
            title: a.title,
            date: a.dueDate,
            type: "assignment",
            status:
              a.status !== "pending"
                ? "completed"
                : "upcoming",
            completed: a.status !== "pending",
            courseId: course.id,
            courseCode: course.code,
            courseName: course.title,
            weekNumber: week.weekNumber,
            path: `/courses/${course.id}`,
          });
        }
      });
      week.exams?.forEach((e) => {
        if (e.date) {
          events.push({
            id: `w-exam-${e.id}`,
            title: e.title,
            date: e.date,
            time: e.time,
            type: "exam",
            status: "upcoming",
            courseId: course.id,
            courseCode: course.code,
            courseName: course.title,
            weekNumber: week.weekNumber,
            path: `/courses/${course.id}`,
          });
        }
      });
      week.studyTasks?.forEach((t) => {
        if (t.dueDate) {
          events.push({
            id: `w-task-${t.id}`,
            title: t.title,
            date: t.dueDate,
            type: "task",
            status: t.completed ? "completed" : "upcoming",
            completed: t.completed,
            courseId: course.id,
            courseCode: course.code,
            courseName: course.title,
            weekNumber: week.weekNumber,
            path: `/courses/${course.id}`,
          });
        }
      });
    });
  });

  // 3. Self-learning Events (Milestones & Stage Tasks)
  state.selfLearningPlans.forEach((plan) => {
    // Milestones
    plan.milestones?.forEach((m) => {
      if (m.targetDate) {
        events.push({
          id: `milestone-${m.id}`,
          title: `${plan.title}: ${m.title}`,
          date: m.targetDate,
          type: "task",
          status: m.completed ? "completed" : "upcoming",
          completed: m.completed,
          courseId: "self-learning",
          courseName: "Self Learning",
          description: `Milestone for ${plan.title}`,
          path: `/self-learning/${plan.id}`,
        });
      }
    });

    // Stage Tasks
    plan.stages?.forEach((stage) => {
      stage.tasks?.forEach((task) => {
        if (task.dueDate) {
          events.push({
            id: `sl-task-${task.id}`,
            title: task.title,
            date: task.dueDate,
            time: task.time,
            type: "task",
            status: task.completed ? "completed" : "upcoming",
            completed: task.completed,
            courseId: "self-learning",
            courseName: plan.title, // Group correctly under the plan
            description: `Stage: ${stage.title}`,
            path: `/self-learning/${plan.id}`,
          });
        }
      });
    });
  });

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

/**
 * Gets upcoming deadlines for the dashboard/sidebar
 */
export function selectUpcomingDeadlines(state: AppState) {
  const allEvents = selectCalendarEvents(state);
  const now = new Date().getTime();

  return allEvents
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

import {
  calculateCumulativeAverage,
  calculatePassedCompletedCredits,
} from "@/lib/academic-planning/utils";

/**
 * Derives academic overview data, incorporating userProfile baseline
 */
export function selectAcademicSummary(state: AppState) {
  const { semesters, config } = state.academicPlanning;
  const { userProfile } = state;

  const courses = state.courses;

  // Parse baseline values
  const baselineAverage = parseFloat(userProfile.currentGPA) || 0;
  const baselineCredits = parseInt(userProfile.completedCreditHours) || 0;
  const requiredCredits =
    parseInt(userProfile.totalCreditHours) ||
    config.totalRequiredCredits ||
    144;

  // Use updated utilities with baseline
  const average = calculateCumulativeAverage(
    courses,
    baselineAverage,
    baselineCredits,
  );
  const passedCredits = calculatePassedCompletedCredits(
    courses,
    baselineCredits,
  );

  return {
    cumulativeAverage:
      average !== null ? average.toFixed(1) : baselineAverage.toFixed(1),
    passedCredits: passedCredits,
    requiredCredits: requiredCredits,
    completionPercentage:
      Math.round((passedCredits / requiredCredits) * 100) || 0,
  };
}
/**
 * Selects all tasks across the system (Regular, Course-based, Self-Learning)
 * and maps them into a unified TaskItem structure for the Tasks Dashboard.
 */
export function selectUnifiedTasks(state: AppState): TaskItem[] {
  const unifiedTasks: TaskItem[] = [];

  // 1. General Tasks
  state.tasks.forEach((task) => unifiedTasks.push(task));

  // 2. Course Tasks (Assignments & Exams)
  state.courses.forEach((course) => {
    // Nested weekly plan items
    course.weeklyPlan?.forEach((week) => {
      // Study Tasks
      week.studyTasks?.forEach((t) => {
        unifiedTasks.push({
          id: `w-task-${t.id}`,
          title: t.title,
          type: "study-task",
          sourceModule: "course",
          linkedCourseId: course.id,
          linkedCourseTitle: course.title,
          linkedWeekLabel: `Week ${week.weekNumber}`,
          dueDate: t.dueDate,
          priority: "medium",
          status: t.completed ? "done" : "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // Assignments
      week.assignments?.forEach((a) => {
        unifiedTasks.push({
          id: `w-assign-${a.id}`,
          title: a.title,
          description: a.description,
          type: "assignment",
          sourceModule: "course",
          linkedCourseId: course.id,
          linkedCourseTitle: course.title,
          linkedWeekLabel: `Week ${week.weekNumber}`,
          dueDate: a.dueDate,
          priority: "high",
          status: a.status !== "pending" ? "done" : "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // Exams
      week.exams?.forEach((e) => {
        unifiedTasks.push({
          id: `w-exam-${e.id}`,
          title: e.title,
          type: "exam",
          sourceModule: "course",
          linkedCourseId: course.id,
          linkedCourseTitle: course.title,
          linkedWeekLabel: `Week ${week.weekNumber}`,
          dueDate: e.date,
          dueTime: e.time,
          priority: "high",
          status: "todo", // Exams are usually just 'todo' until passed or missed
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      // Weekly Items (Quizzes, Projects, etc.)
      week.items?.forEach((item) => {
        if (item.type === "quiz" || item.type === "project" || item.type === "presentation") {
          unifiedTasks.push({
            id: `w-item-${item.id}`,
            title: item.title,
            type: item.type === "quiz" ? "quiz" : "study-task",
            sourceModule: "course",
            linkedCourseId: course.id,
            linkedCourseTitle: course.title,
            linkedWeekLabel: `Week ${week.weekNumber}`,
            dueDate: item.date,
            dueTime: item.time,
            priority: item.priority === "urgent" ? "high" : item.priority === "important" ? "medium" : "low",
            status: item.status === "completed" || item.status === "graded" ? "done" : "todo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    });

    // Top-level Academic Events
    course.academicEvents?.forEach((event) => {
      unifiedTasks.push({
        id: `event-${event.id}`,
        title: event.title,
        type: event.type === "quiz" ? "quiz" : "study-task",
        sourceModule: "course",
        linkedCourseId: course.id,
        linkedCourseTitle: course.title,
        dueDate: event.date,
        dueTime: event.time,
        priority: event.highlightLevel === "urgent" ? "high" : event.highlightLevel === "important" ? "medium" : "low",
        status: event.status === "completed" ? "done" : "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Top-level course assignments if they don't exist in weeklyPlan
    course.assignments?.forEach((a) => {
      const exists = course.weeklyPlan?.some(w => w.assignments.some(wa => wa.id === a.id));
      if (!exists) {
        unifiedTasks.push({
          id: `assign-${a.id}`,
          title: a.title,
          description: a.description,
          type: "assignment",
          sourceModule: "course",
          linkedCourseId: course.id,
          linkedCourseTitle: course.title,
          dueDate: a.dueDate,
          priority: "high",
          status: a.status !== "pending" ? "done" : "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  });

  // 3. Self-learning Tasks
  state.selfLearningPlans.forEach((plan) => {
    plan.stages?.forEach((stage) => {
      stage.tasks?.forEach((task) => {
        unifiedTasks.push({
          id: `sl-task-${task.id}`,
          title: task.title,
          type: "study-task",
          sourceModule: "self-learning",
          linkedLearningPlanId: plan.id,
          linkedLearningPlanTitle: plan.title,
          dueDate: task.dueDate,
          dueTime: task.time,
          priority: "medium",
          status: task.completed ? "done" : "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    });

    plan.milestones?.forEach((m) => {
       unifiedTasks.push({
          id: `milestone-${m.id}`,
          title: m.title,
          type: "self-learning-milestone",
          sourceModule: "self-learning",
          linkedLearningPlanId: plan.id,
          linkedLearningPlanTitle: plan.title,
          dueDate: m.targetDate,
          priority: "high",
          status: m.completed ? "done" : "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    });
  });

  return unifiedTasks;
}

export interface SearchItem {
  id: string;
  title: string;
  category: "Course" | "Task" | "Exam" | "Self-Learning";
  path: string;
  description?: string;
}

/**
 * Selects all searchable entities and flattens them for the global search.
 */
export function selectSearchItems(state: AppState): SearchItem[] {
  const items: SearchItem[] = [];

  // 1. Courses
  state.courses.forEach((course) => {
    if (course.semesterId === "prior-completed") return;

    items.push({
      id: course.id,
      title: course.title,
      category: "Course",
      path: `/courses/${course.id}`,
      description: course.code,
    });

    // Assignments within courses
    course.assignments?.forEach((a) => {
      items.push({
        id: a.id,
        title: a.title,
        category: "Task",
        path: `/courses/${course.id}`,
        description: `Assignment in ${course.title}`,
      });
    });

    // Exams within courses
    course.exams?.forEach((e) => {
      items.push({
        id: e.id,
        title: e.title,
        category: "Exam",
        path: `/courses/${course.id}`,
        description: `Exam in ${course.title}`,
      });
    });
  });

  // 2. Regular Tasks
  state.tasks.forEach((task) => {
    items.push({
      id: task.id,
      title: task.title,
      category: "Task",
      path: "/tasks",
      description: task.description,
    });
  });

  // 3. Self-learning Plans
  state.selfLearningPlans.forEach((plan) => {
    items.push({
      id: plan.id,
      title: plan.title,
      category: "Self-Learning",
      path: `/self-learning/${plan.id}`,
      description: plan.description,
    });
  });

  return items;
}


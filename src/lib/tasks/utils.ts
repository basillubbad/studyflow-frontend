import { TaskItem, TaskPriority, TaskStatus, TaskType, TaskStatsSummary } from "@/types/tasks";

/** Fallback ID generator */
export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/** Check if a task is overdue (ignoring done tasks) */
export function isTaskOverdue(task: TaskItem): boolean {
  if (task.status === "done") return false;
  if (!task.dueDate) return false;

  const now = new Date();
  
  // Create a date object comparing both date and time if available
  const deadline = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    deadline.setHours(hours, minutes, 0, 0);
  } else {
    // If no specific time given, assume it is due at the end of the specified day
    deadline.setHours(23, 59, 59, 999);
  }

  return deadline.getTime() < now.getTime();
}

/** Check if a task is due precisely today */
export function isTaskDueToday(task: TaskItem): boolean {
  if (!task.dueDate) return false;
  
  const today = new Date();
  const deadline = new Date(task.dueDate);
  
  return (
    deadline.getDate() === today.getDate() &&
    deadline.getMonth() === today.getMonth() &&
    deadline.getFullYear() === today.getFullYear()
  );
}

/** Compute overall top-level stats */
export function getTaskStats(tasks: TaskItem[]): TaskStatsSummary {
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
    highPriority: tasks.filter(t => t.priority === "high" && t.status !== "done").length,
    dueToday: tasks.filter(t => isTaskDueToday(t) && t.status !== "done").length
  };
}

/** Helper filter operations */
export function filterTasks(
  tasks: TaskItem[],
  statusFilter: TaskStatus | "overdue" | "all",
  priorityFilter: TaskPriority | "all",
  typeFilter: TaskType | "all"
): TaskItem[] {
  return tasks.filter(task => {
    // Status Logic
    let matchesStatus = true;
    if (statusFilter === "overdue") {
        matchesStatus = isTaskOverdue(task);
    } else if (statusFilter !== "all") {
        matchesStatus = task.status === statusFilter;
    }

    // Priority Logic
    let matchesPriority = true;
    if (priorityFilter !== "all") {
        matchesPriority = task.priority === priorityFilter;
    }

    // Type Logic
    let matchesType = true;
    if (typeFilter !== "all") {
        matchesType = task.type === typeFilter;
    }

    return matchesStatus && matchesPriority && matchesType;
  });
}

/** Default to nearest due date first, then high priority */
export function sortTasks(tasks: TaskItem[], sortBy: "nearest-date" | "priority" | "newest" | "oldest"): TaskItem[] {
  return [...tasks].sort((a, b) => {
    if (sortBy === "nearest-date") {
       // Push items with NO date to the bottom securely
       if (!a.dueDate && b.dueDate) return 1;
       if (a.dueDate && !b.dueDate) return -1;
       if (!a.dueDate && !b.dueDate) return 0;
       
       const dateA = new Date(`${a.dueDate}T${a.dueTime || "23:59:59"}`);
       const dateB = new Date(`${b.dueDate}T${b.dueTime || "23:59:59"}`);
       return dateA.getTime() - dateB.getTime();
    }
    
    if (sortBy === "priority") {
       const pMap = { "high": 3, "medium": 2, "low": 1 };
       return pMap[b.priority] - pMap[a.priority];
    }
    
    if (sortBy === "newest") {
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (sortBy === "oldest") {
       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return 0;
  });
}

/** Label mapping for types */
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  "general": "General",
  "study-task": "Study Task",
  "assignment": "Assignment",
  "quiz": "Quiz",
  "exam": "Exam",
  "self-learning-milestone": "Milestone"
};

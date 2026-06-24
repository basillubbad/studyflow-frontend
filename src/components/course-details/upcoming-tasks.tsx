"use client";

import { StudyTask, Assignment, Exam } from "@/types/course";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingTasksProps {
  tasks: StudyTask[];
  assignments: Assignment[];
  exams: Exam[];
  onTaskComplete?: (taskId: string, completed: boolean) => void;
}

export function UpcomingTasks({
  tasks,
  assignments,
  exams,
  onTaskComplete,
}: UpcomingTasksProps) {
  // Combine and sort all items by date
  const allItems = [
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      type: "task" as const,
      date: t.dueDate,
      completed: t.completed,
      priority: "normal" as const,
    })),
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: "assignment" as const,
      date: a.dueDate,
      completed: ["submitted_early", "submitted_on_time", "submitted_late", "graded"].includes(a.status),
      priority: "normal" as const,
    })),
    ...exams.map((e) => ({
      id: e.id,
      title: e.title,
      type: "exam" as const,
      date: e.date,
      completed: false,
      priority: "urgent" as const,
    })),
  ]
    .filter((item) => item.date && !item.completed) // Only uncompleted items with dates
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 5); // Show top 5 upcoming

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return (
      new Date(dateString) < new Date() &&
      new Date(dateString).toDateString() !== new Date().toDateString()
    );
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return "📝";
      case "exam":
        return "📊";
      case "task":
        return "✓";
      default:
        return "•";
    }
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Upcoming Items
        </h3>
      </div>

      {allItems.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          No upcoming items
        </p>
      ) : (
        <div className="space-y-3">
          {allItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isOverdue(item.date)
                  ? "border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10"
                  : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30",
              )}
            >
              <div className="flex items-start gap-2">
                {item.type === "task" ? (
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => {
                      onTaskComplete?.(item.id, checked === true);
                    }}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <span className="text-sm mt-0.5 shrink-0 w-5 flex items-center justify-center">
                    {getItemIcon(item.type)}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      item.completed
                        ? "line-through text-slate-500 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100",
                    )}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {formatDate(item.date)}
                    </span>
                    {isOverdue(item.date) && !item.completed && (
                      <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, Plus, ArrowRight, AlertCircle, Circle, Timer, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { TaskItem, TaskStatus } from "@/types/tasks";
import { isTaskOverdue, sortTasks } from "@/lib/tasks/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LS_KEY = "studyflow_tasks";

interface HighPriorityTasksProps {
  tasks: TaskItem[];
  onStatusChange?: (id: string, status: TaskStatus) => void;
}

export function HighPriorityTasks({ tasks, onStatusChange }: HighPriorityTasksProps) {
  const renderStatusIcon = (task: TaskItem) => {
    if (isTaskOverdue(task)) return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
    if (task.status === "in-progress") return <Timer className="w-4 h-4 text-blue-500 shrink-0" />;
    return <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />;
  };

  return (
    <Card className="flex flex-col border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <ListTodo className="h-5 w-5 text-orange-500" />
          High Priority Tasks
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex -mr-2 text-muted-foreground hover:text-primary transition-colors">
          <Link href="/tasks">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-2">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
            <p className="text-sm text-muted-foreground">No urgent tasks right now. Nice work!</p>
            <Button size="sm" variant="default" asChild className="rounded-full shadow-none">
              <Link href="/tasks"><Plus className="w-3.5 h-3.5" /> Add Task</Link>
            </Button>
          </div>
        ) : (
          <>
            {tasks.map(task => (
              <div key={task.id} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors group/item",
                isTaskOverdue(task)
                  ? "border-red-200/60 bg-red-50/40 dark:bg-red-900/10 dark:border-red-800/40"
                  : "border-border/50 bg-card hover:bg-muted/50"
              )}>
                {renderStatusIcon(task)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                  {task.dueDate && (
                    <p className={cn("text-xs mt-0.5", isTaskOverdue(task) ? "text-red-600" : "text-muted-foreground")}>
                      {isTaskOverdue(task) ? "⚠ Overdue · " : "Due "}
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
                {onStatusChange && (
                  <button
                    onClick={() => onStatusChange(task.id, "done")}
                    title="Mark as done"
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-600 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <Button variant="link" size="sm" asChild className="mt-1 ml-auto text-muted-foreground hover:text-primary self-end">
              <Link href="/tasks">View all tasks <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

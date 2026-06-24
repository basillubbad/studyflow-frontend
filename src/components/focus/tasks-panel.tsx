"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TasksPanelProps {
  className?: string;
}

export function TasksPanel({ className }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTask = () => {
    if (newTaskText.trim()) {
      setTasks([
        ...tasks,
        { id: crypto.randomUUID(), text: newTaskText.trim(), completed: false },
      ]);
      setNewTaskText("");
      setIsAdding(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className={cn("rounded-lg border bg-background p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Tasks <span className="text-secondary">{tasks.length}</span>
        </h3>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg border border-dashed p-3"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "size-5 rounded border-2 flex items-center justify-center transition-colors",
                task.completed
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-muted-foreground/30 hover:border-blue-500",
              )}
            >
              {task.completed && <Check className="size-3" />}
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                task.completed && "text-muted-foreground line-through",
              )}
            >
              {task.text}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeTask(task.id)}
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task..."
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
                if (e.key === "Escape") setIsAdding(false);
              }}
            />
            <Button size="sm" onClick={addTask}>
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
          >
            <Plus className="size-4" />
            Add here the task you will focus on
          </button>
        )}
      </div>
    </div>
  );
}

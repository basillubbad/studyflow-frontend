"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SelfLearningTask } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";
import { cn } from "@/lib/utils";

interface StageTasksListProps {
  tasks: SelfLearningTask[];
  onTasksChange: (tasks: SelfLearningTask[]) => void;
}

export function StageTasksList({ tasks, onTasksChange }: StageTasksListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleAddTask = () => {
    if (!newTitle.trim()) return;

    const newTask: SelfLearningTask = {
      id: generatePlanId(),
      title: newTitle.trim(),
      dueDate: newDate || undefined,
      time: newTime || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onTasksChange([...tasks, newTask]);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setShowAddForm(false);
  };

  const toggleTask = (taskId: string) => {
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Tasks & Assignments
          <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </span>
        </h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7 px-2 text-xs gap-1"
        >
          {showAddForm ? "Cancel" : <><Plus className="h-3 w-3" /> Add Task</>}
        </Button>
      </div>

      {showAddForm && (
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Task Title</Label>
            <Input 
              placeholder="What needs to be done?" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Date</Label>
              <Input 
                type="date" 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</Label>
              <Input 
                type="time" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleAddTask} disabled={!newTitle.trim()}>Save Task</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 && !showAddForm ? (
          <p className="text-xs text-center py-4 text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed">
            No tasks added to this stage yet.
          </p>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "group flex items-center justify-between p-2 rounded-lg border transition-all",
                task.completed 
                  ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30" 
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "shrink-0 transition-colors",
                    task.completed ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium truncate",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  {(task.dueDate || task.time) && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-2.5 w-2.5" />
                          {task.dueDate}
                        </span>
                      )}
                      {task.time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {task.time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteTask(task.id)}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

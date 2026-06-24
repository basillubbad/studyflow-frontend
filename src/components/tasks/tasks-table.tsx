"use client";

import { TaskItem, TaskStatus, TaskPriority } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  GraduationCap,
  RefreshCw,
  Calendar
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TasksTableProps {
  tasks: TaskItem[];
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TasksTable({ tasks, onEdit, onDelete, onStatusChange }: TasksTableProps) {
  
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Low</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "course":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "self-learning":
        return <GraduationCap className="h-3.5 w-3.5" />;
      default:
        return <Calendar className="h-3.5 w-3.5" />;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Done</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground border-slate-200 dark:border-slate-800">To Do</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white w-10"></th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white text-left">Task</th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Priority</th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Due Date</th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Source</th>
              <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                className={cn(
                  "hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group",
                  task.status === "done" && "opacity-60"
                )}
              >
                <td className="px-4 py-3">
                  <Checkbox 
                    checked={task.status === "done"}
                    onCheckedChange={(checked) => 
                      onStatusChange(task.id, checked ? "done" : (task.previousStatus || "todo"))
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[240px] md:max-w-[320px] lg:max-w-[420px]">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span 
                        className={cn(
                          "font-medium text-slate-900 dark:text-white transition-all line-clamp-2 break-all flex-1",
                          task.status === "done" && "line-through text-muted-foreground"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </span>
                      {task.recurrence && (
                        <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin-slow shrink-0 mt-0.5" />
                      )}
                    </div>
                    {task.linkedCourseTitle && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider truncate" title={task.linkedCourseTitle}>
                        {task.linkedCourseTitle}
                      </span>
                    )}
                    {task.linkedLearningPlanTitle && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider truncate" title={task.linkedLearningPlanTitle}>
                        {task.linkedLearningPlanTitle}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(task.status)}
                </td>
                <td className="px-4 py-3">
                  {getPriorityBadge(task.priority)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Soon"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                   <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                      {getSourceIcon(task.sourceModule)}
                    </div>
                    <span className="capitalize">{task.sourceModule.replace("-", " ")}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 cursor-pointer">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(task.id)} 
                        className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

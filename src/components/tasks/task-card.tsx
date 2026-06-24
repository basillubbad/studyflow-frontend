import { TaskItem, TaskStatus } from "@/types/tasks";
import { isTaskOverdue, TASK_TYPE_LABELS } from "@/lib/tasks/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ReminderBadge } from "@/components/shared/reminder-badge";
import {
  MoreVertical, Edit2, Trash2, CalendarDays, Clock,
  BookOpen, FileText, HelpCircle, GraduationCap, Zap,
  CheckCircle2, Circle, Timer, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

// Icon per task type
const TYPE_ICONS: Record<string, React.ReactNode> = {
  "general":                 <Circle className="w-3.5 h-3.5" />,
  "study-task":              <BookOpen className="w-3.5 h-3.5" />,
  "assignment":              <FileText className="w-3.5 h-3.5" />,
  "quiz":                    <HelpCircle className="w-3.5 h-3.5" />,
  "exam":                    <GraduationCap className="w-3.5 h-3.5" />,
  "self-learning-milestone": <Zap className="w-3.5 h-3.5" />,
};

// Color per task type badge
const TYPE_COLORS: Record<string, string> = {
  "general":                  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "study-task":               "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "assignment":               "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
  "quiz":                     "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  "exam":                     "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  "self-learning-milestone":  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  "high":   "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  "medium": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
  "low":    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const overdue = isTaskOverdue(task);
  const isDone = task.status === "done";

  const formattedDue = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // Quick status toggle cycle: todo -> in-progress -> done -> todo
  const cycleStatus = () => {
    const cycle: Record<TaskStatus, TaskStatus> = {
      "todo": "in-progress",
      "in-progress": "done",
      "done": "todo",
    };
    onStatusChange(task.id, cycle[task.status]);
  };

  const renderStatusIcon = () => {
    if (isDone) return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (task.status === "in-progress") return <Timer className="w-5 h-5 text-blue-500 shrink-0" />;
    if (overdue) return <Circle className="w-5 h-5 text-red-400 shrink-0" />;
    return <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary shrink-0 transition-colors" />;
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 group",
      isDone 
        ? "bg-muted/20 border-border/40 opacity-70" 
        : overdue 
          ? "bg-red-50/40 border-red-200/60 dark:bg-red-900/10 dark:border-red-800/40 hover:shadow-sm" 
          : "bg-card border-border/60 hover:shadow-sm hover:-translate-y-0.5"
    )}>
      
      {/* Quick Status Toggle */}
      <button onClick={cycleStatus} title="Toggle status" className="mt-0.5 shrink-0 focus:outline-none">
        {renderStatusIcon()}
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-start gap-2">
          <p className={cn(
            "font-semibold text-sm leading-snug",
            isDone ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {task.title}
          </p>
          {overdue && !isDone && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 shrink-0">
              Overdue
            </Badge>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type */}
          <Badge variant="outline" className={cn("text-xs gap-1 font-medium py-0", TYPE_COLORS[task.type])}>
            {TYPE_ICONS[task.type]}
            {TASK_TYPE_LABELS[task.type]}
          </Badge>

          {/* Priority */}
          <Badge variant="outline" className={cn("text-xs font-medium capitalize py-0", PRIORITY_COLORS[task.priority])}>
            {task.priority}
          </Badge>

          {/* Status */}
          <Badge variant="secondary" className={cn(
            "text-xs capitalize py-0 shadow-none",
            task.status === "done" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
            task.status === "in-progress" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
            task.status === "todo" && "bg-muted text-muted-foreground",
          )}>
            {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>

          {/* Linked Course / Plan */}
          {(task.linkedCourseTitle || task.linkedLearningPlanTitle) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{task.linkedCourseTitle || task.linkedLearningPlanTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right-Side Meta */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Due Date */}
        {formattedDue && (
          <div className={cn(
            "hidden sm:flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 border",
            overdue && !isDone
              ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              : "text-muted-foreground bg-muted/50 border-border/50"
          )}>
            <CalendarDays className="w-3 h-3" />
            {formattedDue}
            {task.dueTime && <><Clock className="w-3 h-3 ml-1" />{task.dueTime}</>}
          </div>
        )}

        {/* Reminder Badge */}
        <ReminderBadge config={task.reminderConfig} className="hidden sm:flex" variant="outline" />

        {/* Actions Dropdown */}
        <div onClick={stopPropagation}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground hover:bg-muted">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "todo")} disabled={task.status === "todo"}>Mark as To Do</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "in-progress")} disabled={task.status === "in-progress"}>Mark In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "done")} disabled={task.status === "done"}>Mark as Done</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2, BookOpen, CheckSquare, Sparkles, GraduationCap, FileText, Calendar, StickyNote,
} from "lucide-react";

export type DeleteItemType =
  | "course"
  | "task"
  | "self-learning"
  | "exam"
  | "assignment"
  | "reflection"
  | "event"
  | "semester"
  | "stage"
  | "milestone"
  | "resource"
  | "generic";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: DeleteItemType;
  itemTitle?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const CONFIG: Record<DeleteItemType, {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  description: (title?: string) => string;
}> = {
  course:        { label: "Course",          icon: <BookOpen className="w-6 h-6" />,       iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",     description: t => `Are you sure you want to delete the course "${t}"? All associated weeks, tasks, and exams will be lost.` },
  task:          { label: "Task",            icon: <CheckSquare className="w-6 h-6" />,     iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", description: t => `Are you sure you want to delete the task "${t}"? This cannot be undone.` },
  "self-learning":{ label: "Learning Plan", icon: <Sparkles className="w-6 h-6" />,        iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", description: t => `Are you sure you want to delete the learning plan "${t}"? All stages, milestones, and resources will be lost.` },
  exam:          { label: "Exam",            icon: <GraduationCap className="w-6 h-6" />,  iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",         description: t => `Are you sure you want to delete the exam "${t}"?` },
  assignment:    { label: "Assignment",      icon: <FileText className="w-6 h-6" />,        iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", description: t => `Are you sure you want to delete the assignment "${t}"?` },
  reflection:    { label: "Reflection",      icon: <StickyNote className="w-6 h-6" />,     iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",     description: t => `Are you sure you want to delete this reflection entry${t ? ` "${t}"` : ""}? This cannot be undone.` },
  event:         { label: "Event",           icon: <Calendar className="w-6 h-6" />,       iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",    description: t => `Are you sure you want to delete the event "${t}"?` },
  semester:      { label: "Semester",        icon: <BookOpen className="w-6 h-6" />,       iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400", description: t => `Are you sure you want to delete the semester "${t}"? All courses within it will also be removed.` },
  stage:         { label: "Stage",           icon: <CheckSquare className="w-6 h-6" />,    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",    description: t => `Are you sure you want to delete the stage "${t}"?` },
  milestone:     { label: "Milestone",       icon: <Sparkles className="w-6 h-6" />,       iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", description: t => `Are you sure you want to delete the milestone "${t}"?` },
  resource:      { label: "Resource",        icon: <FileText className="w-6 h-6" />,       iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400", description: t => `Are you sure you want to remove the resource "${t}"?` },
  generic:       { label: "Item",            icon: <Trash2 className="w-6 h-6" />,         iconBg: "bg-destructive/10 text-destructive dark:bg-destructive/20",             description: t => `Are you sure you want to delete${t ? ` "${t}"` : " this item"}? This action cannot be undone.` },
};

export function ConfirmDeleteDialog({
  open, onOpenChange, itemType, itemTitle, onConfirm, isLoading = false,
}: ConfirmDeleteDialogProps) {
  const cfg = CONFIG[itemType] ?? CONFIG.generic;

  return (
    <AlertDialog open={open} onOpenChange={open => !open && onOpenChange(false)}>
      <AlertDialogContent className="sm:max-w-[420px] rounded-2xl">
        <AlertDialogHeader className="items-center text-center gap-3">
          {/* Icon */}
          <div className={`p-3 rounded-2xl ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <AlertDialogTitle className="text-lg">
            Delete {cfg.label}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm leading-relaxed">
            {cfg.description(itemTitle)}
            <br />
            <span className="font-medium text-destructive">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2 mt-2">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl flex-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? "Deleting..." : `Delete ${cfg.label}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

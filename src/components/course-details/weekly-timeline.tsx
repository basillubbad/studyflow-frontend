"use client";

import { useState } from "react";
import { WeeklyPlan, StudyTask, Assignment, Exam } from "@/types/course";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ChevronDown, CheckCircle2, FileText, BookOpen, Clock, MapPin, Plus, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddWeekItemDialog } from "@/components/course-details/add-week-item-dialog";
import { useRouter } from "next/navigation";
import { ReminderBadge } from "@/components/shared/reminder-badge";

type ItemType = "study-task" | "assignment" | "quiz" | "exam";

interface WeeklyTimelineProps {
  weeks: WeeklyPlan[];
  courseId?: string;
  onTaskComplete?: (weekNumber: number, taskId: string, completed: boolean) => void;
  onAddItem?: (weekNumber: number, type: ItemType, item: StudyTask | Assignment | Exam) => void;
  onWeekComplete?: (weekNumber: number) => void;
  onAssignmentStatusChange?: (weekNumber: number, assignmentId: string, newStatus: Assignment["status"]) => void;
  onExamComplete?: (weekNumber: number, examId: string, completed: boolean) => void;
}

export function WeeklyTimeline({ 
  weeks, 
  courseId, 
  onTaskComplete, 
  onAddItem, 
  onWeekComplete, 
  onAssignmentStatusChange,
  onExamComplete
}: WeeklyTimelineProps) {
  // Determine the "current" week based on the first uncompleted week
  const currentWeek = weeks.find((w) => !w.completed)?.weekNumber || weeks.length;

  // Initialize expanded weeks to show current, previous 2, and next 1
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>(() => {
    return weeks
      .map(w => w.weekNumber)
      .filter(num => num >= currentWeek - 2 && num <= currentWeek + 1);
  });
  
  const [addDialogWeek, setAddDialogWeek] = useState<number | null>(null);
  const router = useRouter();

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekNumber)
        ? prev.filter((w) => w !== weekNumber)
        : [...prev, weekNumber],
    );
  };

  const isWeekExpanded = (weekNumber: number) => expandedWeeks.includes(weekNumber);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case "submitted_early": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "submitted_on_time": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "submitted_late": return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "graded":    return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      case "pending":   return "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800";
      default:          return "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800";
    }
  };

  const assignmentStatusOptions = [
    { value: "pending", label: "Not Submitted", colorClass: "text-slate-600 bg-slate-100" },
    { value: "submitted_early", label: "Submitted Early", colorClass: "text-blue-700 bg-blue-100" },
    { value: "submitted_on_time", label: "Submitted On Time", colorClass: "text-green-700 bg-green-100" },
    { value: "submitted_late", label: "Submitted Late", colorClass: "text-orange-700 bg-orange-100" },
    { value: "graded", label: "Graded", colorClass: "text-purple-700 bg-purple-100" },
  ];

  const handleAddItem = (type: ItemType, item: StudyTask | Assignment | Exam) => {
    if (addDialogWeek !== null) {
      onAddItem?.(addDialogWeek, type, item);
      setAddDialogWeek(null);
    }
  };

  const openExamMode = (examId: string) => {
    if (courseId) {
      router.push(`/courses/${courseId}/${examId}`);
    }
  };

  // Helper to check if a week is fully completed automatically
  const checkAutoCompleteness = (week: WeeklyPlan) => {
    const allTasksDone = week.studyTasks.every(t => t.completed);
    // You could expand this logic for assignments and exams if they have a completion status
    const hasItems = week.studyTasks.length > 0 || week.assignments.length > 0 || week.exams.length > 0;
    
    // Auto complete if it has items and all text items are done.
    if (hasItems && week.studyTasks.length > 0 && allTasksDone && !week.completed) {
      onWeekComplete?.(week.weekNumber);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Render visible weeks, sorted by uncompleted first, then completed */}
        {[...weeks].sort((a, b) => {
          if (a.completed === b.completed) return a.weekNumber - b.weekNumber;
          return a.completed ? 1 : -1;
        }).map((week) => {
          const isCurrent = week.weekNumber === currentWeek;
          const isCompleted = week.completed;

          return (
            <Card
              key={week.weekNumber}
              className={cn(
                "border-slate-200 dark:border-slate-800 transition-all overflow-hidden duration-300",
                isWeekExpanded(week.weekNumber)
                  ? isCurrent ? "bg-white dark:bg-slate-900 ring-2 ring-blue-500/20 dark:ring-blue-500/20" : "bg-white dark:bg-slate-900"
                  : isCompleted 
                    ? "bg-slate-50/30 dark:bg-slate-900/30 opacity-75 hover:opacity-100" 
                    : "bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/70",
                isCurrent && !isWeekExpanded(week.weekNumber) && "border-blue-200 dark:border-blue-800 shadow-sm"
              )}
            >
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className={cn(
                  "w-full px-6 py-4 flex items-center gap-4 transition-colors text-left",
                  isCompleted ? "hover:bg-slate-100/30 dark:hover:bg-slate-800/30" : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform shrink-0",
                    isWeekExpanded(week.weekNumber) ? "rotate-180 text-blue-500" : "text-slate-400",
                    isCompleted && !isWeekExpanded(week.weekNumber) && "opacity-50"
                  )}
                />
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-semibold",
                      isCurrent ? "text-blue-700 dark:text-blue-400" : 
                      isCompleted ? "text-slate-500 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-700" : "text-slate-900 dark:text-white"
                    )}>
                      Week {week.weekNumber}
                    </h3>
                    {isCurrent && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-[10px] px-1.5 py-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm hidden sm:block truncate",
                    isCompleted ? "text-slate-400 dark:text-slate-600" : "text-slate-600 dark:text-slate-400"
                  )}>
                    {week.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  {isCompleted && (
                    <Badge className="bg-green-100/80 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 text-xs hidden sm:flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Done
                    </Badge>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 sm:hidden" />
                  )}
                  
                  {!isCompleted && (
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md ring-1 ring-slate-200 dark:ring-slate-700">
                      {week.studyTasks.filter(t => !t.completed).length} tasks left
                    </span>
                  )}
                </div>
              </button>

              {/* Week Content */}
              {isWeekExpanded(week.weekNumber) && (
                <div className={cn(
                  "border-t px-6 py-5 space-y-6",
                  isCompleted ? "border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20"
                )}>
                  
                  {/* Progress bar for the week's tasks */}
                  {week.studyTasks.length > 0 && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted ? "bg-green-500" : "bg-blue-500"
                          )}
                          style={{ width: `${Math.round((week.studyTasks.filter(t => t.completed).length / Math.max(1, week.studyTasks.length)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {Math.round((week.studyTasks.filter(t => t.completed).length / Math.max(1, week.studyTasks.length)) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Study Tasks */}
                  {week.studyTasks.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Study Tasks
                      </h4>
                      <div className="space-y-2 ml-6">
                        {week.studyTasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                              task.completed 
                                ? "bg-slate-50/50 dark:bg-slate-800/10 border-slate-200/50 dark:border-slate-700/30" 
                                : "bg-blue-50/30 dark:bg-blue-900/5 border-blue-100/50 dark:border-blue-800/30 hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                            )}
                          >
                            <Checkbox
                              checked={task.completed ?? false}
                              onCheckedChange={(checked) => {
                                onTaskComplete?.(week.weekNumber, task.id, checked === true);
                                // The auto-complete logic is handled in the page.tsx where updateCourse actually happens,
                                // but we conceptually mentioned it above.
                              }}
                              className={cn("mt-0.5", task.completed && "data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400")}
                            />
                            <span className={cn(
                              "text-sm flex-1 transition-all",
                              task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100 font-medium",
                            )}>
                              {task.title}
                            </span>
                            <ReminderBadge config={task.reminderConfig} />
                            {task.completed && <CheckCircle2 className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignments */}
                  {week.assignments.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Assignments
                      </h4>
                      <div className="space-y-2 ml-6">
                        {week.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={cn("p-4 rounded-lg border transition-colors", 
                              isCompleted ? "opacity-75 bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800" : getAssignmentStatusColor(assignment.status)
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{assignment.title}</h5>
                                {assignment.description && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">{assignment.description}</p>
                                )}
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> Due: {formatDate(assignment.dueDate)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2.5 shrink-0">
                                <Select
                                  value={assignment.status}
                                  onValueChange={(val) => onAssignmentStatusChange?.(week.weekNumber, assignment.id, val as Assignment["status"])}
                                >
                                  <SelectTrigger className={cn(
                                    "h-7 text-xs border-0 font-medium px-2.5 rounded-full outline-none focus:ring-0",
                                    assignmentStatusOptions.find(o => o.value === assignment.status)?.colorClass || "bg-slate-100 text-slate-600"
                                  )}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assignmentStatusOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {assignment.reminderConfig && <ReminderBadge config={assignment.reminderConfig} />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exams & Quizzes */}
                  {week.exams.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                        Exams & Quizzes
                      </h4>
                      <div className="space-y-2 ml-6">
                        {week.exams.map((exam) => {
                          const isPast = new Date(exam.date).getTime() < new Date().setHours(0, 0, 0, 0);
                          // Default to isPast if 'completed' hasn't been set yet
                          const isCompleted = exam.completed !== undefined ? exam.completed : isPast;

                          return (
                            <div
                              key={exam.id}
                              className={cn(
                                "p-4 rounded-lg border",
                                isCompleted || isCompleted 
                                  ? "opacity-75 bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800" 
                                  : "border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10"
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={(checked) => {
                                      onExamComplete?.(week.weekNumber, exam.id, checked === true);
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className={cn(
                                      "font-semibold text-sm transition-all",
                                      isCompleted ? "text-slate-500 line-through" : "text-slate-900 dark:text-white"
                                    )}>
                                      {exam.title}
                                    </h5>
                                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-600 dark:text-slate-400">
                                      <span className="flex items-center gap-1.5 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />{exam.time}
                                      </span>
                                      <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-md font-medium text-slate-700 dark:text-slate-300">
                                        {exam.duration} min
                                      </span>
                                      {exam.location && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                          <MapPin className="h-3.5 w-3.5 text-slate-400" />{exam.location}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5">Date: {formatDate(exam.date)}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2.5 shrink-0">
                                  {courseId && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className={cn(
                                        "shrink-0 gap-1.5 text-xs",
                                        isCompleted ? "border-slate-200 dark:border-slate-700" : "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400"
                                      )}
                                      onClick={() => openExamMode(exam.id)}
                                    >
                                      <GraduationCap className="w-3.5 h-3.5" />
                                      Prepare
                                    </Button>
                                  )}
                                  <ReminderBadge config={exam.reminderConfig} variant="outline" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State for the week */}
                  {week.studyTasks.length === 0 && week.assignments.length === 0 && week.exams.length === 0 && (
                    <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No items planned for this week yet.</p>
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-2 text-blue-600 dark:text-blue-400 h-auto p-0"
                        onClick={() => setAddDialogWeek(week.weekNumber)}
                      >
                        Add your first item
                      </Button>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between pt-4 mt-2 gap-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setAddDialogWeek(week.weekNumber)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>

                    {onWeekComplete && (
                      <Button
                        size="sm"
                        variant={isCompleted ? "ghost" : "outline"}
                        className={cn(
                          "gap-2 text-xs transition-all",
                          isCompleted 
                            ? "text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                            : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-sm"
                        )}
                        onClick={() => onWeekComplete(week.weekNumber)}
                      >
                        {isCompleted ? (
                          <>Mark as Uncompleted</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" /> Mark Week Done</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Item Dialog */}
      <AddWeekItemDialog
        open={addDialogWeek !== null}
        onOpenChange={(open) => { if (!open) setAddDialogWeek(null); }}
        weekNumber={addDialogWeek ?? 1}
        onAdd={handleAddItem}
      />
    </>
  );
}

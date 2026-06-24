"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyTask, Assignment, Exam } from "@/types/course";
import { ReminderFields } from "@/components/shared/reminder-fields";
import { ReminderConfig } from "@/types/reminders";
import { getDefaultReminderConfig } from "@/lib/reminders/utils";

type ItemType = "study-task" | "assignment" | "quiz" | "exam";

interface AddWeekItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekNumber: number;
  onAdd: (type: ItemType, item: StudyTask | Assignment | Exam) => void;
}

const TYPE_LABELS: Record<ItemType, string> = {
  "study-task": "Study Task",
  "assignment": "Assignment",
  "quiz": "Quiz",
  "exam": "Exam",
};

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function AddWeekItemDialog({ open, onOpenChange, weekNumber, onAdd }: AddWeekItemDialogProps) {
  const [type, setType] = useState<ItemType>("study-task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("");
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(getDefaultReminderConfig());

  const resetForm = useCallback(() => {
    setType("study-task");
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setDuration("60");
    setLocation("");
    setReminderConfig(getDefaultReminderConfig());
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const id = genId();

    if (type === "study-task") {
      onAdd(type, { 
        id, 
        title: title.trim(), 
        completed: false, 
        dueDate: dueDate || undefined,
        reminderConfig: reminderConfig.enabled ? reminderConfig : undefined
      } as StudyTask);
    } else if (type === "assignment") {
      onAdd(type, {
        id, title: title.trim(), description: description.trim() || undefined,
        dueDate: dueDate || now, status: "pending",
        reminderConfig: reminderConfig.enabled ? reminderConfig : undefined
      } as Assignment);
    } else if (type === "exam" || type === "quiz") {
      onAdd(type, {
        id, type: type === "quiz" ? "quiz" : "final", title: title.trim(), date: dueDate || now,
        time: dueTime || "09:00", duration: parseInt(duration) || 60,
        location: location.trim() || undefined,
        reminderConfig: reminderConfig.enabled ? reminderConfig : undefined
      } as Exam);
    }
    onOpenChange(false);
  };

  const needsDueDate = type !== "study-task";
  const isExam = type === "exam" || type === "quiz";
  const canSave = !!title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl">Add Task to Week {weekNumber}</DialogTitle>
          <DialogDescription>
            Add a new study task, assignment, or exam to your weekly plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Task Type</Label>
            <Select value={type} onValueChange={(v: ItemType) => setType(v)}>
              <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as ItemType[]).map(t => (
                  <SelectItem key={t} value={t} className="cursor-pointer">{TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Title <span className="text-red-500">*</span></Label>
            <Input
              placeholder={`e.g. ${type === "exam" ? "Midterm Exam" : type === "assignment" ? "Problem Set 3" : "Read Chapter 5"}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {type === "assignment" && (
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea
                placeholder="Add some details about this task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="resize-none min-h-[80px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className={needsDueDate ? "" : "text-muted-foreground"}>
                {isExam ? "Exam Date" : "Due Date"}
              </Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">{isExam ? "Time" : "Due Time"}</Label>
              <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="h-10" disabled={!dueDate} />
            </div>
          </div>

          {isExam && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Duration (min)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="h-10" min={15} />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Location</Label>
                <Input placeholder="e.g. Room 201" value={location} onChange={e => setLocation(e.target.value)} className="h-10" />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label className="font-semibold">Reminder</Label>
            <ReminderFields 
              config={reminderConfig} 
              onChange={(updates) => setReminderConfig({ ...reminderConfig, ...updates })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-medium">Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave} className="rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50">Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

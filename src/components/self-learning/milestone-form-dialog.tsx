"use client";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LearningMilestone } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";
import { ReminderFields } from "@/components/shared/reminder-fields";
import { ReminderConfig } from "@/types/reminders";
import { getDefaultReminderConfig } from "@/lib/reminders/utils";

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (milestone: LearningMilestone) => void;
  initialData?: LearningMilestone | null;
  planId: string;
}

export function MilestoneFormDialog({ open, onOpenChange, onSave, initialData, planId }: MilestoneFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(getDefaultReminderConfig());

  const resetForm = useCallback(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setTargetDate(initialData.targetDate?.split("T")[0] ?? "");
      setNotes(initialData.notes ?? "");
      setReminderConfig(initialData.reminderConfig ?? getDefaultReminderConfig());
      return;
    }

    setTitle("");
    setDescription("");
    setTargetDate("");
    setNotes("");
    setReminderConfig(getDefaultReminderConfig());
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initialData?.id ?? generatePlanId(),
      planId, 
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      completed: initialData?.completed ?? false,
      notes: notes.trim() || undefined,
      reminderConfig: reminderConfig.enabled ? reminderConfig : undefined,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
          <DialogDescription>Set a meaningful checkpoint in your learning journey.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. Complete first mini-project" value={title} onChange={e => setTitle(e.target.value)} autoFocus className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea placeholder="What does reaching this milestone mean?" value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Target Date (optional)</Label>
              <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Notes</Label>
              <Input placeholder="Optional..." value={notes} onChange={e => setNotes(e.target.value)} className="h-10" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="font-semibold">Reminder</Label>
            <ReminderFields 
              config={reminderConfig} 
              onChange={(updates) => setReminderConfig({ ...reminderConfig, ...updates })}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="rounded-xl">{initialData ? "Save" : "Add Milestone"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

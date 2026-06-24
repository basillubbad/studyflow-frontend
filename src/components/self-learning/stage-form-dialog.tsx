"use client";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LearningStage, StageStatus } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";

interface StageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stage: LearningStage) => void;
  initialData?: LearningStage | null;
  planId: string;
  nextOrder: number;
}

export function StageFormDialog({ open, onOpenChange, onSave, initialData, planId, nextOrder }: StageFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDuration, setTargetDuration] = useState("");
  const [goals, setGoals] = useState("");
  const [status, setStatus] = useState<StageStatus>("not-started");

  const resetForm = useCallback(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setTargetDuration(initialData.targetDuration ?? "");
      setGoals(initialData.goals ?? "");
      setStatus(initialData.status);
      return;
    }

    setTitle("");
    setDescription("");
    setTargetDuration("");
    setGoals("");
    setStatus(nextOrder === 1 ? "active" : "not-started");
  }, [initialData, nextOrder]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: initialData?.id ?? generatePlanId(),
      planId, title: title.trim(),
      description: description.trim() || undefined,
      targetDuration: targetDuration.trim() || undefined,
      goals: goals.trim() || undefined,
      status, order: initialData?.order ?? nextOrder,
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Stage" : "Add Stage"}</DialogTitle>
          <DialogDescription>Break your learning plan into manageable stages.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Stage Title <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. Fundamentals" value={title} onChange={e => setTitle(e.target.value)} autoFocus className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea placeholder="What does this stage cover?" value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Target Duration</Label>
              <Input placeholder="e.g. 2 weeks" value={targetDuration} onChange={e => setTargetDuration(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value as StageStatus)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="not-started">Not Started</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Goals / What you&apos;ll learn</Label>
            <Textarea placeholder="List key things you want to learn in this stage..." value={goals} onChange={e => setGoals(e.target.value)} className="resize-none min-h-[60px]" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="rounded-xl">{initialData ? "Save Changes" : "Add Stage"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

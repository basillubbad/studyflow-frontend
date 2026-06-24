"use client";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningPlan, PlanStatus } from "@/types/self-learning";
import { generatePlanId } from "@/lib/self-learning/utils";

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: LearningPlan) => void;
  initialData?: LearningPlan | null;
}

const CATEGORIES = ["Programming", "Design", "Language", "Mathematics", "Science", "Business", "Arts", "Health", "Other"];

export function LearningPlanFormDialog({ open, onOpenChange, onSave, initialData }: PlanFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("");
  const [targetSkill, setTargetSkill] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PlanStatus>("planned");

  const resetForm = useCallback(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setGoal(initialData.goal);
      setCategory(initialData.category ?? "");
      setTargetSkill(initialData.targetSkill ?? "");
      setStartDate(initialData.startDate.split("T")[0]);
      setEndDate(initialData.endDate?.split("T")[0] ?? "");
      setStatus(initialData.status);
      return;
    }

    setTitle("");
    setDescription("");
    setGoal("");
    setCategory("");
    setTargetSkill("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setStatus("planned");
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!title.trim() || !goal.trim() || !startDate) return;
    const now = new Date().toISOString();
    onSave({
      id: initialData?.id ?? generatePlanId(),
      title: title.trim(),
      description: description.trim() || undefined,
      goal: goal.trim(),
      category: category || undefined,
      targetSkill: targetSkill.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      status,
      stages: initialData?.stages ?? [],
      milestones: initialData?.milestones ?? [],
      resources: initialData?.resources ?? [],
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    });
    onOpenChange(false);
  };

  const canSave = title.trim() && goal.trim() && startDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] h-[90vh] sm:h-auto flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/20 shrink-0">
          <DialogTitle className="text-xl">{initialData ? "Edit Learning Plan" : "New Learning Plan"}</DialogTitle>
          <DialogDescription>Define your personal learning goal and track your progress.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2">
            <Label>Plan Title <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. Learn React from scratch" value={title} onChange={e => setTitle(e.target.value)} className="h-11" autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Goal <span className="text-red-500">*</span></Label>
            <Textarea placeholder="What do you want to achieve? e.g. Build a full-stack web app" value={goal} onChange={e => setGoal(e.target.value)} className="resize-none min-h-[70px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea placeholder="Optional context about this plan..." value={description} onChange={e => setDescription(e.target.value)} className="resize-none min-h-[60px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Pick one..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Target Skill</Label>
              <Input placeholder="e.g. TypeScript" value={targetSkill} onChange={e => setTargetSkill(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Start Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">End Date (optional)</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10" min={startDate} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: PlanStatus) => setStatus(v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave} className="rounded-xl">{initialData ? "Save Changes" : "Create Plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlannerSemester, PlannerSemesterStatus } from "@/types/academic-planning";

interface AddSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (semester: PlannerSemester) => void;
  initialData?: PlannerSemester | null;
}

// Fallback ID generator when uuid isn't present
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function AddSemesterDialog({ open, onOpenChange, onSave, initialData }: AddSemesterDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<PlannerSemesterStatus>("planned");
  const [weeksCount, setWeeksCount] = useState<number>(16);
  const [academicYear, setAcademicYear] = useState("");

  const resetForm = useCallback(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setWeeksCount(initialData.weeksCount || 16);
      setAcademicYear(initialData.academicYear || "");
      return;
    }

    setName("");
    setStatus("planned");
    setWeeksCount(16);
    setAcademicYear("");
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(resetForm);
    return () => cancelAnimationFrame(frame);
  }, [open, resetForm]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      id: initialData ? initialData.id : generateId(),
      name,
      status,
      weeksCount,
      academicYear: academicYear || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{initialData ? "Edit Semester" : "Add Semester"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="semester-name" className="text-muted-foreground font-semibold">Semester Name <span className="text-red-500">*</span></Label>
            <Input
              id="semester-name"
              placeholder="e.g. Fall 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="academic-year" className="text-muted-foreground font-semibold">Academic Year</Label>
              <Input
                id="academic-year"
                placeholder="e.g. 2024/2025"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-11 placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weeks-count" className="text-muted-foreground font-semibold">Num. of Weeks <span className="text-red-500">*</span></Label>
              <Input
                id="weeks-count"
                type="number"
                min="1"
                max="52"
                value={weeksCount}
                onChange={(e) => setWeeksCount(parseInt(e.target.value) || 16)}
                className="h-11 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="semester-status" className="text-muted-foreground font-semibold">Timeline Status</Label>
            <Select value={status} onValueChange={(val: PlannerSemesterStatus) => setStatus(val)}>
              <SelectTrigger id="semester-status" className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned for Future</SelectItem>
                <SelectItem value="current">Currently In Progress</SelectItem>
                <SelectItem value="completed">Completed / Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl w-full sm:w-auto h-11">Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="rounded-xl w-full sm:w-auto h-11">Save Semester</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

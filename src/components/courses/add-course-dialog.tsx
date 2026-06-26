"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Calendar, AlertTriangle, Info, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseImageUploader } from "./course-image-uploader";
import { CourseStatusSelector } from "./course-status-selector";
import { useAppState } from "@/hooks/use-app-state";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Omit<Course, "id">) => void;
  initialData?: Course | null;
  isEditing?: boolean;
  semesterId?: string | null; // For adding from Academic Planning
}

const defaultFormData: Omit<Course, "id"> = {
  title: "",
  instructor: "",
  credits: 3,
  semesterId: "",
  status: "planned",
  imageUrl: "",
  durationWeeks: 16,
  code: "",
  description: "",
};

const normalizeNumerals = (str: string) => {
  const arabicDigits: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
  };
  return str.replace(/[٠-٩]/g, (d) => arabicDigits[d]);
};

export function AddCourseDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEditing = false,
  semesterId,
}: AddCourseDialogProps) {
  const { state } = useAppState();
  const semesters = state.academicPlanning.semesters;
  const selectableSemesters = useMemo(
    () => semesters.filter((s) => s.id !== "prior-completed"),
    [semesters],
  );
  const allStateCourses = state.courses;

  const [formData, setFormData] = useState<Omit<Course, "id">>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPriorMode = semesterId === "prior-completed" || formData.semesterId === "prior-completed";

  const buildInitialFormData = useCallback((): Omit<Course, "id"> => {
    if (isEditing && initialData) {
      return {
        title: initialData.title,
        instructor: initialData.instructor,
        credits: initialData.credits,
        semesterId: initialData.semesterId || "",
        status: initialData.status,
        imageUrl: initialData.imageUrl,
        durationWeeks: initialData.durationWeeks || 16,
        code: initialData.code || "",
        description: initialData.description || "",
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        progress: initialData.progress,
        finalGrade: initialData.finalGrade,
        numericGrade: initialData.numericGrade,
        academicPeriod: initialData.academicPeriod || "",
      };
    }

    const selectedSemester = selectableSemesters.find((s) => s.id === semesterId);
    return {
      ...defaultFormData,
      semesterId: semesterId || "",
      status: semesterId === "prior-completed" ? "completed" : defaultFormData.status,
      durationWeeks: selectedSemester ? selectedSemester.weeksCount : defaultFormData.durationWeeks,
    };
  }, [initialData, isEditing, semesterId, selectableSemesters]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setFormData(buildInitialFormData());
    });
    return () => cancelAnimationFrame(frame);
  }, [open, buildInitialFormData]);

  // Calculate current planned/completed credits logic with dual-bucket support
  const academicSummary = useMemo(() => {
    const baselineCompleted = parseInt(state.userProfile.completedCreditHours) || 0;
    const degreeTotal = parseInt(state.userProfile.totalCreditHours) || 144;
    
    // Bucket 1: Prior Completed Courses (Recording history)
    const existingPriorCredits = allStateCourses
      .filter(c => c.semesterId === "prior-completed" && c.id !== initialData?.id)
      .reduce((sum, c) => sum + (c.credits || 0), 0);
    
    // Bucket 2: Regular Semester Courses (Planning future)
    const existingRegularCredits = allStateCourses
      .filter(c => c.semesterId !== "prior-completed" && c.id !== initialData?.id)
      .reduce((sum, c) => sum + (c.credits || 0), 0);

    const remainingPrior = Math.max(0, baselineCompleted - existingPriorCredits);
    const remainingRegular = Math.max(0, (degreeTotal - baselineCompleted) - existingRegularCredits);

    return {
      baselineCompleted,
      degreeTotal,
      remainingPrior,
      remainingRegular,
    };
  }, [state.userProfile, allStateCourses, initialData?.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Course name is required";
    if (isNaN(formData.credits) || formData.credits < 1) newErrors.credits = "Credit hours are required";
    if (!formData.status) newErrors.status = "Status is required";

    // Require selecting a semester (per requested behavior)
    if (!formData.semesterId && semesterId !== "prior-completed") newErrors.semesterId = "Semester is required";
    
    if (
      isNaN(formData.durationWeeks) ||
      formData.durationWeeks < 1 ||
      formData.durationWeeks > 52
    ) {
      newErrors.durationWeeks = "Duration must be 1-52 weeks";
    }

    // --- Capacity Validation (Dual Bucket) ---
    if (isPriorMode && (formData.numericGrade === undefined || formData.numericGrade === null)) {
      newErrors.numericGrade = "Grade is required for historical records";
    }

    if (formData.status === "completed" && formData.numericGrade === undefined) {
      newErrors.numericGrade = "Grade is required for completed courses";
    }
    const capacity = isPriorMode ? academicSummary.remainingPrior : academicSummary.remainingRegular;
    
    // Perform numeric check on clean data
    const currentCredits = typeof formData.credits === 'string' 
        ? parseInt(normalizeNumerals(formData.credits)) || 0 
        : formData.credits;

    if (currentCredits > capacity) {
        newErrors.credits = isPriorMode 
          ? `Exceeds recorded baseline (${capacity} hrs left)`
          : `Exceeds planned degree total (${capacity} hrs left)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    
    // Auto-generate finalGrade string from numericGrade if missing
    const currentCredits = typeof formData.credits === 'string' 
        ? parseInt(normalizeNumerals(formData.credits)) || 0 
        : formData.credits;

    const finalData = { ...formData, credits: currentCredits };

    // Default progress for current courses if not provided
    if (finalData.status === "current" && finalData.progress === undefined) {
      finalData.progress = 0;
    }
    if (finalData.status === "completed" && finalData.numericGrade !== undefined && !finalData.finalGrade) {
        finalData.finalGrade = `${finalData.numericGrade}%`;
    }

    if (semesterId === "prior-completed") {
        finalData.status = "completed";
        finalData.semesterId = "prior-completed";
    }

    try {
      onSave({
        ...finalData,
        createdAt: new Date().toISOString(),
      });
      toast.success(isEditing ? "Course updated successfully" : "Course added successfully");
      handleClose(true);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to add course", err);
      }
      toast.error("Failed to add course. Please try again.");
    }
  };

  const handleClose = (resetForm = false) => {
    onOpenChange(false);
    setErrors({});
    if (resetForm) {
      setFormData({
        ...defaultFormData,
        semesterId: semesterId || "",
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? "Edit Course" : "Add Course"}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => handleClose()} className="h-8 w-8 rounded-full">
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-semibold">Course Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Software Architecture"
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code" className="font-semibold text-muted-foreground">Course Code (Optional)</Label>
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. CS402"
                            className="uppercase"
                        />
                    </div>

                    {semesterId === "prior-completed" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="academicPeriod" className="font-semibold text-blue-600">Year & Semester (Taken) *</Label>
                            <Input
                                id="academicPeriod"
                                value={formData.academicPeriod || ""}
                                onChange={(e) => setFormData({ ...formData, academicPeriod: e.target.value })}
                                placeholder="e.g. 2023 - Second Semester"
                                className="border-blue-200 focus-visible:ring-blue-200"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="instructor" className="font-semibold">Instructor</Label>
                        <Input
                            id="instructor"
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            placeholder="Dr. Alaa Eliwa"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="credits" className="font-semibold text-sm">Credits *</Label>
                                {(() => {
                                    const rem = isPriorMode ? academicSummary.remainingPrior : academicSummary.remainingRegular;
                                    if (rem < 10) return (
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                            rem <= 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                                        )}>
                                            {isPriorMode ? "History" : "Plan"}: {rem}
                                        </span>
                                    );
                                    return null;
                                })()}
                            </div>
                            <Input
                                id="credits"
                                type="text"
                                value={formData.credits}
                                onChange={(e) => {
                                    const val = normalizeNumerals(e.target.value);
                                    setFormData({ ...formData, credits: parseInt(val) || 0 });
                                }}
                                className={cn(
                                    errors.credits && "border-red-500",
                                    (() => {
                                        const rem = isPriorMode ? academicSummary.remainingPrior : academicSummary.remainingRegular;
                                        const currentVal = typeof formData.credits === 'string' ? parseInt(normalizeNumerals(formData.credits)) || 0 : formData.credits;
                                        return currentVal > rem;
                                    })() && "bg-red-50"
                                )}
                            />
                            {errors.credits ? (
                                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {errors.credits}
                                </p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                                    <Info className="h-3 w-3" />
                                    {(() => {
                                        const rem = isPriorMode ? academicSummary.remainingPrior : academicSummary.remainingRegular;
                                        return isPriorMode ? `Baseline limit: ${rem} hrs left` : `Degree limit: ${rem} hrs left`;
                                    })()}
                                </p>
                            )}
                        </div>
                        {semesterId !== "prior-completed" && (
                            <div className="space-y-2">
                                <Label htmlFor="durationWeeks" className="font-semibold">Duration (Weeks) *</Label>
                                <Input
                                    id="durationWeeks"
                                    type="number"
                                    readOnly={!!formData.semesterId && formData.semesterId !== "prior-completed"}
                                    value={formData.durationWeeks}
                                    onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 16 })}
                                    className={cn(!!formData.semesterId && formData.semesterId !== "prior-completed" && "bg-muted cursor-not-allowed")}
                                />
                                {!!formData.semesterId && formData.semesterId !== "prior-completed" && (
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Lock className="h-3 w-3" /> Fixed for this semester
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="semester" className="font-semibold">Semester *</Label>
                        {isEditing ? (
                            <div className="p-2 border rounded-xl bg-muted/30 text-muted-foreground text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {semesters.find(s => s.id === formData.semesterId)?.name || "Current Semester"}
                            </div>
                        ) : semesterId === "prior-completed" ? (
                            <div className="p-2 border rounded-xl bg-blue-50 text-blue-700 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Prior Completed Courses
                            </div>
                        ) : semesterId ? (
                             /* Locked Semester View when adding from Academic Planning */
                            <div className="p-3 border rounded-xl bg-muted/50 text-foreground text-sm font-semibold flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  {semesters.find(s => s.id === semesterId)?.name || "Selected Semester"}
                                </div>
                                <Lock className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                        ) : (
                            <Select 
                                value={formData.semesterId || undefined}
                                onValueChange={(val) => {
                                  const selectedSemester = selectableSemesters.find((s) => s.id === val);
                                  setFormData({
                                    ...formData,
                                    semesterId: val,
                                    durationWeeks: selectedSemester?.weeksCount ?? formData.durationWeeks,
                                  });
                                }}
                            >
                                <SelectTrigger id="semester" className="w-full" disabled={selectableSemesters.length === 0}>
                                    <SelectValue placeholder="Select a semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectableSemesters.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.semesterId && <p className="text-sm text-red-500">{errors.semesterId}</p>}
                        {!semesterId && selectableSemesters.length === 0 && (
                          <p className="text-xs text-amber-600">
                            No semesters available yet. Add a semester first from Academic Planning.
                          </p>
                        )}
                    </div>



                    {semesterId !== "prior-completed" && (
                        <div className="space-y-2">
                            <Label className="font-semibold">Course Status</Label>
                            <CourseStatusSelector
                                value={formData.status}
                                onChange={(status) => setFormData({ ...formData, status })}
                                error={errors.status}
                            />
                        </div>
                    )}

                    {formData.status === "current" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                            <Label htmlFor="progress" className="font-semibold text-sm">Progress (%)</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.progress ?? 0}
                                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                                className="rounded-xl h-10"
                            />
                        </div>
                    )}

                    {(formData.status === "completed" || isPriorMode) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2 text-emerald-600 dark:text-emerald-400">
                            <Label htmlFor="grade" className="font-semibold text-sm">Numeric Grade (0-100) *</Label>
                            <Input
                                id="grade"
                                type="text"
                                value={formData.numericGrade ?? ""}
                                onChange={(e) => {
                                    const val = normalizeNumerals(e.target.value);
                                    setFormData({ ...formData, numericGrade: parseInt(val) || 0 });
                                }}
                                placeholder="e.g. 95"
                                className={cn(
                                    "border-emerald-500/30 focus-visible:ring-emerald-500/30 rounded-xl h-10",
                                    errors.numericGrade && "border-red-500"
                                )}
                            />
                            {errors.numericGrade && (
                                <p className="text-[11px] text-red-500 font-medium">{errors.numericGrade}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {semesterId !== "prior-completed" && (
                <div className="border-t pt-4">
                <CourseImageUploader
                    onImageSelect={(img) => setFormData({ ...formData, imageUrl: img })}
                    currentImage={formData.imageUrl}
                />
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-muted-foreground">Description / Notes</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key goals, resources, or syllabus link..."
                className="w-full px-3 py-2 border border-input rounded-xl text-sm bg-background/50 focus:bg-background transition-colors min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => handleClose()} className="flex-1 rounded-xl h-11">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl h-11 bg-primary hover:bg-secondary">
                {isEditing ? "Save Changes" : "Create Course"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

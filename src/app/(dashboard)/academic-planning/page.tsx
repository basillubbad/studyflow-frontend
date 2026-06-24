"use client";

import { useState, useEffect } from "react";
import { PlannerSemester } from "@/types/academic-planning";
import { Course } from "@/types/course";
import { SemesterCard } from "@/components/academic-planning/semester-card";
import { AcademicPlannerStats } from "@/components/academic-planning/planner-stats";
import { EmptyState } from "@/components/academic-planning/empty-state";
import { AddSemesterDialog } from "@/components/academic-planning/add-semester-dialog";
import { AddCourseDialog } from "@/components/courses/add-course-dialog"; // Changed import path
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import {
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  RefreshCcw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  calculateCumulativeAverage,
  calculatePassedCompletedCredits,
  calculatePlannedCredits,
  calculateInProgressCredits,
  estimateRemainingSemesters,
} from "@/lib/academic-planning/utils";

export default function AcademicPlanningPage() {
  // Changed component name
  const {
    state,
    isLoaded,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    updateState,
    loadCourses,
    loadSemesters,
  } = useAppState();

  useEffect(() => { loadCourses(); loadSemesters(); }, [loadCourses, loadSemesters]);

  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false); // Changed state variable name
  const [editingSemester, setEditingSemester] =
    useState<PlannerSemester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);

  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false); // Changed state variable name
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null); // Changed state variable name
  const [editingCourse, setEditingCourse] = useState<Course | null>(null); // Changed type to Course
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const [isResetPlannerDialogOpen, setIsResetPlannerDialogOpen] =
    useState(false);

  const semesters = state.academicPlanning.semesters;
  const courses = state.courses; // Now using top-level state.courses

  // Baseline data from user profile
  const baselineAverage = parseFloat(state.userProfile.currentGPA) || 0;
  const baselineCredits = parseInt(state.userProfile.completedCreditHours) || 0;
  const totalRequiredCredits =
    parseInt(state.userProfile.totalCreditHours) ||
    state.academicPlanning.config.totalRequiredCredits ||
    144; // Corrected typo and used state.academicPlanning.config

  // Derived calculations with baseline
  const cumulativeAverage = calculateCumulativeAverage(
    courses,
    baselineAverage,
    baselineCredits,
  );
  const passedCredits = calculatePassedCompletedCredits(
    courses,
    baselineCredits,
  );
  const plannedCredits = calculatePlannedCredits(courses);
  const inProgressCredits = calculateInProgressCredits(courses);

  // Prior courses logic
  const priorCourses = courses.filter(
    (c) => c.semesterId === "prior-completed",
  );
  const totalPriorCredits = priorCourses.reduce((sum, c) => sum + c.credits, 0);
  const showPriorSection = baselineCredits > 0;

  // Group courses by semester for easier mapping and calculations
  // This part needs to be re-evaluated if courses are global.
  // For estimateRemainingSemesters, it expects courses grouped by semester.
  const coursesBySemesterId = semesters.map((s) => {
    return courses.filter((c) => c.semesterId === s.id);
  });

  const estimatedSemestersLeft = estimateRemainingSemesters(
    totalRequiredCredits - passedCredits,
    coursesBySemesterId,
    state.academicPlanning.config.defaultSemesterLoad, // Used state.academicPlanning.config
  );

  // --- Handlers ---
  const handleOpenAddSemester = () => {
    // Changed handler name
    setEditingSemester(null);
    setIsSemesterDialogOpen(true); // Changed state variable name
  };

  const handleOpenEditSemester = (semester: PlannerSemester) => {
    // Changed handler name
    setEditingSemester(semester);
    setIsSemesterDialogOpen(true); // Changed state variable name
  };

  const handleSaveSemester = (semester: PlannerSemester) => {
    if (editingSemester) {
      updateSemester(semester);
    } else {
      addSemester(semester);
    }
    setEditingSemester(null);
  };

  const handleDeleteSemester = (id: string) => {
    setSemesterToDelete(id);
  };

  const confirmDeleteSemester = () => {
    if (semesterToDelete) {
      deleteSemester(semesterToDelete);
      // Also delete linked courses
      courses
        .filter((c) => c.semesterId === semesterToDelete)
        .forEach((c) => deleteCourse(c.id));
      setSemesterToDelete(null);
    }
  };

  const handleOpenAddCourse = (semesterId: string) => {
    // Changed handler name
    setEditingCourse(null);
    setActiveSemesterId(semesterId); // Changed state variable name
    setIsCourseDialogOpen(true); // Changed state variable name
  };

  const handleOpenEditCourse = (course: Course) => {
    // Changed handler name, type to Course
    setEditingCourse(course);
    setActiveSemesterId(course.semesterId ?? null); // Changed state variable name
    setIsCourseDialogOpen(true); // Changed state variable name
  };

  const handleSaveCourse = (courseData: Omit<Course, "id">) => {
    // Changed parameter type
    // Validation for prior courses
    if (activeSemesterId === "prior-completed") {
      const currentCredits = priorCourses.reduce(
        (sum, c) => sum + c.credits,
        0,
      );
      const isUpdating = !!editingCourse;
      const creditDiff = isUpdating
        ? courseData.credits - (editingCourse?.credits || 0)
        : courseData.credits;

      if (currentCredits + creditDiff > baselineCredits) {
        toast.error(
          `Total prior credits cannot exceed your baseline of ${baselineCredits} hours.`,
        );
        return;
      }
    }

    if (editingCourse) {
      updateCourse({ ...courseData, id: editingCourse.id } as Course);
    } else {
      addCourse({
        ...courseData,
        id: crypto.randomUUID(),
        semesterId: activeSemesterId || "",
      } as Course);
    }
    setEditingCourse(null);
    setActiveSemesterId(null);
  };

  const handleDeleteCourse = (id: string) => {
    setCourseToDelete(id);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete);
      setCourseToDelete(null);
    }
  };

  const handleResetPlanner = () => {
    setIsResetPlannerDialogOpen(true);
  };

  const confirmResetPlanner = () => {
    updateState((prev) => ({
      ...prev,
      academicPlanning: {
        ...prev.academicPlanning,
        semesters: [],
      },
      courses: [], // Clear top-level courses
    }));
    setIsResetPlannerDialogOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Academic Progress
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your cumulative average, passing credit hours, and plan future
            semesters to stay on target for graduation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="mr-2 h-4 w-4" /> Required Hours:{" "}
            {totalRequiredCredits}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetPlanner}
            className="hidden sm:flex text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button
            onClick={handleOpenAddSemester}
            className="w-full sm:w-auto shadow-sm"
          >
            {" "}
            {/* Changed handler name */}
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <section>
        <AcademicPlannerStats // Changed component name
          cumulativeAverage={cumulativeAverage}
          passedCredits={passedCredits}
          totalRequiredCredits={totalRequiredCredits}
          inProgressCredits={inProgressCredits}
          plannedCredits={plannedCredits}
          estimatedSemestersLeft={estimatedSemestersLeft}
        />
      </section>

      {/* Main Content Grid */}
      <div
        className={cn(
          "grid grid-cols-1 gap-8 items-start",
          showPriorSection ? "xl:grid-cols-12" : "xl:grid-cols-1",
        )}
      >
        {/* Prior Completed Courses Section (Left Column on Desktop) */}
        {showPriorSection && (
          <section className="xl:col-span-4 space-y-4 xl:sticky xl:top-8 animate-in slide-in-from-left-4 duration-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Prior Courses
                </h2>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-100"
                >
                  History
                </Badge>
              </div>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {totalPriorCredits} / {baselineCredits} credits
              </span>
            </div>

            {totalPriorCredits > baselineCredits && (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-100 text-red-600 py-2"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Recorded credits exceed baseline ({baselineCredits}).
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-border/50 rounded-2xl p-4">
              <div className="flex flex-col gap-3">
                {priorCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card border rounded-xl p-4 flex items-center justify-between group hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="font-semibold text-sm truncate">
                        {course.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {course.credits} Cr
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {course.numericGrade}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleOpenEditCourse(course)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 hover:bg-white dark:hover:bg-slate-900 text-muted-foreground hover:text-primary transition-all rounded-xl py-6 flex items-center justify-center gap-2"
                  onClick={() => handleOpenAddCourse("prior-completed")}
                  disabled={totalPriorCredits >= baselineCredits}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    Add Prior Course
                  </span>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Semesters / Planner Grid (Right/Main Column) */}
        <section
          className={cn(
            "space-y-6 animate-in slide-in-from-right-4 duration-700",
            showPriorSection
              ? "xl:col-span-8"
              : "xl:col-span-12 lg:max-w-5xl lg:mx-auto w-full",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Semester Plan
            </h2>
          </div>

          {semesters.filter((s) => s.id !== "prior-completed").length === 0 ? (
            <EmptyState onAddSemester={handleOpenAddSemester} />
          ) : (
            <div
              className={cn(
                "grid gap-6",
                showPriorSection
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2",
              )}
            >
              {semesters
                .filter((s) => s.id !== "prior-completed")
                .map((semester) => (
                  <SemesterCard
                    key={semester.id}
                    semester={semester}
                    courses={courses.filter(
                      (c) => c.semesterId === semester.id,
                    )} // Filter courses by semesterId
                    onAddCourse={handleOpenAddCourse} // Changed handler name
                    onEditCourse={handleOpenEditCourse} // Changed handler name
                    onDeleteCourse={handleDeleteCourse}
                    onEditSemester={handleOpenEditSemester} // Changed handler name
                    onDeleteSemester={handleDeleteSemester}
                  />
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Dialogs */}
      <AddSemesterDialog
        open={isSemesterDialogOpen} // Changed state variable name
        onOpenChange={setIsSemesterDialogOpen} // Changed state variable name
        onSave={handleSaveSemester}
        initialData={editingSemester}
      />
      <AddCourseDialog
        open={isCourseDialogOpen}
        onOpenChange={setIsCourseDialogOpen}
        onSave={handleSaveCourse}
        semesterId={activeSemesterId}
        initialData={editingCourse}
        isEditing={!!editingCourse}
      />

      <ConfirmActionDialog
        isOpen={!!semesterToDelete}
        title="Delete Semester"
        description="Are you sure you want to delete this semester and all its courses? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteSemester}
        onCancel={() => setSemesterToDelete(null)}
      />

      <ConfirmActionDialog
        isOpen={!!courseToDelete}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteCourse}
        onCancel={() => setCourseToDelete(null)}
      />

      <ConfirmActionDialog
        isOpen={isResetPlannerDialogOpen}
        title="Reset Planner"
        description="Are you sure you want to reset your entire planner? This will remove all semesters and courses and cannot be undone."
        confirmText="Reset"
        onConfirm={confirmResetPlanner}
        onCancel={() => setIsResetPlannerDialogOpen(false)}
      />
    </div>
  );
}

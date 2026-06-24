"use client";

import { useState, useMemo, useEffect } from "react";
import { Course, CourseStatus } from "@/types/course";
import { CourseCard } from "@/components/courses/course-card";
import { CoursesTabs } from "@/components/courses/courses-tabs";
import { AddCourseDialog } from "@/components/courses/add-course-dialog";
import { DeleteCourseAlertDialog } from "@/components/courses/delete-course-alert-dialog";
import { HeaderSkeleton, CardGridSkeleton } from "@/components/shared/skeletons";
import { useAppState } from "@/hooks/use-app-state";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CoursesClient() {
  const { state, isLoaded, addCourse, updateCourse, deleteCourse, loadCourses, loadSemesters } = useAppState();

  useEffect(() => { loadCourses(); loadSemesters(); }, [loadCourses, loadSemesters]);
  const courses = state.courses;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CourseStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === "all" || course.status === (activeTab as CourseStatus);

      const isNotPrior = course.semesterId !== "prior-completed";
      return matchesSearch && matchesTab && isNotPrior;
    });
  }, [courses, searchQuery, activeTab]);

  const counts = useMemo(() => {
    const mainCourses = courses.filter(c => c.semesterId !== "prior-completed");
    return {
      all: mainCourses.length,
      current: mainCourses.filter((c) => c.status === "current").length,
      completed: mainCourses.filter((c) => c.status === "completed").length,
      planned: mainCourses.filter((c) => c.status === "planned").length,
    };
  }, [courses]);

  const handleAddCourse = () => {
    setSelectedCourse(undefined);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete.id);
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleSaveCourse = (courseData: Omit<Course, "id">) => {
    if (isEditing && selectedCourse) {
      updateCourse({ ...courseData, id: selectedCourse.id } as Course);
    } else {
      addCourse({ 
        ...courseData, 
        id: crypto.randomUUID(),
      } as Course);
    }

    setIsDialogOpen(false);
    setSelectedCourse(undefined);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all your academic courses.
          </p>
        </div>
        <div className="flex w-full md:w-auto shrink-0">
          <Button onClick={handleAddCourse} className="w-full sm:w-auto shadow-sm" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Course
          </Button>
        </div>
      </div>
      <div className="border-b">
        <CoursesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      </div>
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              semesterName={state.academicPlanning.semesters.find(s => s.id === course.semesterId)?.name}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No courses found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Add your first course to get started"}
          </p>

          {!searchQuery && (
            <Button
              onClick={handleAddCourse}
              className="mt-4 bg-primary hover:bg-secondary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          )}
        </div>
      )}
      <AddCourseDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedCourse(undefined);
            setIsEditing(false);
          }
        }}
        onSave={handleSaveCourse}
        initialData={selectedCourse}
        isEditing={isEditing}
      />
      <DeleteCourseAlertDialog
        isOpen={isDeleteDialogOpen}
        course={courseToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setCourseToDelete(null);
        }}
      />
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { CalendarFilters } from "@/lib/calendar-utils";

interface FiltersProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  courses: Array<{ id: string; title: string; code?: string }>;
}

export function CalendarFilters({
  filters,
  onFiltersChange,
  courses,
}: FiltersProps) {
  return (
    <Card className="p-4 border-slate-200 dark:border-slate-800">
      {/* Event Type Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Event Types
        </h3>
        <div className="space-y-2">
          {[
            { key: "tasks", label: "Tasks", color: "bg-blue-100" },
            {
              key: "assignments",
              label: "Assignments",
              color: "bg-orange-100",
            },
            { key: "quizzes", label: "Quizzes", color: "bg-yellow-100" },
            { key: "exams", label: "Exams & Finals", color: "bg-red-100" },
          ].map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters[key as keyof typeof filters] as boolean}
                onCheckedChange={(checked) => {
                  onFiltersChange({
                    ...filters,
                    [key]: checked,
                  });
                }}
              />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Completed Items Filter */}
      <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.completed}
            onCheckedChange={(checked) => {
              onFiltersChange({
                ...filters,
                completed: checked === true,
              });
            }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Show Completed
          </span>
        </label>
      </div>

      {/* Course Filters */}
      {courses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Courses
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {courses.map((course) => (
              <label
                key={course.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={
                    filters.courses.length === 0 ||
                    filters.courses.includes(course.id)
                  }
                  onCheckedChange={(checked) => {
                    if (filters.courses.length === 0) {
                      // First time filtering by course
                      if (checked) {
                        onFiltersChange({
                          ...filters,
                          courses: [course.id],
                        });
                      }
                    } else {
                      // Update course filter
                      let newCourses = [...filters.courses];
                      if (checked) {
                        if (!newCourses.includes(course.id)) {
                          newCourses.push(course.id);
                        }
                      } else {
                        newCourses = newCourses.filter((c) => c !== course.id);
                      }
                      onFiltersChange({
                        ...filters,
                        courses: newCourses,
                      });
                    }
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {course.title}
                  </span>
                  {course.code && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {course.code}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

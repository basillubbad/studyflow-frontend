"use client";

import { Course } from "@/types/course";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  semesterName?: string;
}

export function CourseCard({ course, onEdit, onDelete, semesterName }: CourseCardProps) {
  const statusColors = {
    current: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    planned:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  const statusLabel = {
    current: "CURRENT",
    completed: "COMPLETED",
    planned: "PLANNED",
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow flex flex-col group relative">
      <Link href={`/courses/${course.id}`} className="flex-1 flex flex-col cursor-pointer">
        {/* Course Image - Fixed 3:2 aspect ratio */}
        <div className="relative w-full aspect-3/2 bg-linear-to-br from-blue-400 to-purple-500 overflow-hidden">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[course.status]}>
              {statusLabel[course.status]}
            </Badge>
          </div>
        </div>

        {/* Course Info - Flex grow to push buttons down */}
        <div className="p-3 space-y-2 flex-1 flex flex-col">
          <div>
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {course.instructor}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            <span className="whitespace-nowrap">{course.credits} Cr</span>
            <span className="whitespace-nowrap">{semesterName || course.academicPeriod || "Semester"}</span>
            {course.durationWeeks && (
              <span className="whitespace-nowrap">{course.durationWeeks}w</span>
            )}
          </div>

          {/* Status-specific content */}
          {course.status === "current" && course.progress !== undefined && (
            <div className="space-y-2 mt-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          {course.status === "completed" && course.finalGrade && (
            <div className="bg-green-50 dark:bg-green-950 p-1.5 rounded-md text-sm mt-auto">
              <p className="text-muted-foreground text-xs">Final Grade</p>
              <p className="font-semibold text-green-700 dark:text-green-300">
                {course.finalGrade}
              </p>
            </div>
          )}

          {course.status === "planned" && (
            <div className="bg-muted p-1.5 rounded-md text-sm mt-auto">
              <p className="text-muted-foreground text-xs">
                Scheduled for next term
              </p>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons - Always at bottom */}
      <div className="flex items-center justify-between gap-1 px-3 py-2 border-t bg-card/50">
        <Link href={`/courses/${course.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full h-7 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(course)}
          className="flex-1 h-7 text-xs"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(course)}
          className="flex-1 h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}

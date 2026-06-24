"use client";

import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle 
} from "lucide-react";
import { getGradeStatus } from "@/lib/academic-planning/grading";
import { useRouter } from "next/navigation";

interface CourseRowProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export function CourseRow({ course, onEdit, onDelete }: CourseRowProps) {
  const router = useRouter();
  
  const renderStatusBadge = () => {
    switch (course.status) {
      case "planned":
        return (
          <Badge variant="outline" className="text-muted-foreground bg-muted/30 border-muted-foreground/20 font-normal">
            <Circle className="w-3 h-3 mr-1.5" /> Planned
          </Badge>
        );
      case "current":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20 font-medium">
            <Clock className="w-3 h-3 mr-1.5" /> In Progress
          </Badge>
        );
      case "completed":
        if (course.numericGrade !== undefined && course.numericGrade !== null) {
          const status = getGradeStatus(course.numericGrade);
          if (status === "passed") {
            return (
              <Badge variant="default" className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20 font-medium shadow-none">
                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Passed
              </Badge>
            );
          } else {
            return (
              <Badge variant="destructive" className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20 font-medium shadow-none">
                <XCircle className="w-3 h-3 mr-1.5" /> Failed
              </Badge>
            );
          }
        }
        return <Badge variant="outline" className="font-normal">Completed</Badge>;
      default:
        return null;
    }
  };

  const renderGradeInfo = () => {
    if (course.status !== "completed" || course.numericGrade === undefined || course.numericGrade === null) {
      return <span className="text-muted-foreground/50 text-sm font-medium">--</span>;
    }

    const isFailed = getGradeStatus(course.numericGrade) === "failed";

    return (
      <div className={`font-semibold text-base tabular-nums ${isFailed ? "text-red-600" : "text-foreground"}`}>
        {course.numericGrade}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 hover:shadow-sm transition-all duration-200 group gap-4 cursor-pointer"
      onClick={() => router.push(`/courses/${course.id}`)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-foreground truncate">{course.title}</span>
          {course.code && (
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground bg-muted/20 border-border/50">
              {course.code}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>{course.credits} credit hours</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
        <div className="flex items-center gap-6 flex-1 justify-end">
          <div className="w-28 flex justify-end">
            {renderStatusBadge()}
          </div>
          <div className="w-12 flex justify-end items-center">
            {renderGradeInfo()}
          </div>
        </div>
 
        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

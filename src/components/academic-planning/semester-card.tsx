import { PlannerSemester } from "@/types/academic-planning";
import { Course } from "@/types/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Plus, Edit2, Trash2, CalendarDays } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CourseRow } from "./course-row";
import { calculateCumulativeAverage } from "@/lib/academic-planning/utils";

interface SemesterCardProps {
  semester: PlannerSemester;
  courses: Course[];
  onAddCourse: (semesterId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onEditSemester: (semester: PlannerSemester) => void;
  onDeleteSemester: (semesterId: string) => void;
}

export function SemesterCard({ 
  semester, 
  courses, 
  onAddCourse, 
  onEditCourse, 
  onDeleteCourse, 
  onEditSemester, 
  onDeleteSemester 
}: SemesterCardProps) {
  
  const semesterAverage = calculateCumulativeAverage(courses);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  const renderStatus = () => {
    switch (semester.status) {
      case "planned": return <Badge variant="outline" className="bg-muted/50 text-muted-foreground font-normal border-border/50 shadow-none">Planned</Badge>;
      case "current": return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 font-medium shadow-none">In Progress</Badge>;
      case "completed": return <Badge variant="default" className="bg-emerald-500/10 text-emerald-700 border-none hover:bg-emerald-500/20 font-medium shadow-none">Completed</Badge>;
    }
  }

  return (
    <Card className="flex flex-col h-full border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-card">
      <CardHeader className="pb-4 border-b bg-muted/10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-1.5 bg-background border rounded-md shadow-sm shrink-0">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground break-all min-w-0">
                {semester.name}
              </CardTitle>
              {renderStatus()}
            </div>
            
            <div className="flex items-center gap-3 text-sm pt-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Credit Hours</span>
                <span className="font-medium text-foreground">{totalCredits}</span>
              </div>
              
              <div className="w-px h-8 bg-border"></div>
              
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Semester Avg</span>
                <span className="font-medium text-foreground">
                    {semesterAverage !== null ? semesterAverage.toFixed(1) : "--"}
                </span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEditSemester(semester)} className="cursor-pointer">
                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground" /> Edit Semester Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteSemester(semester.id)} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Semester
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-3 bg-card">
        {courses.length === 0 ? (
          <div className="text-center py-10 px-4 text-sm text-muted-foreground border border-dashed rounded-xl border-border/60 bg-muted/20">
            <p className="mb-2">No courses added to this semester yet.</p>
            <Button variant="link" onClick={() => onAddCourse(semester.id)} className="h-auto p-0">
               Add a course
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {courses.map(course => (
              <CourseRow 
                key={course.id} 
                course={course} 
                onEdit={onEditCourse} 
                onDelete={onDeleteCourse} 
              />
            ))}
          </div>
        )}
        
        <div className="pt-2 mt-auto">
            <Button 
            variant="outline" 
            className="w-full border-dashed border hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-none rounded-xl"
            onClick={() => onAddCourse(semester.id)}
            >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

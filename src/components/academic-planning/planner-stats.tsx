import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Percent, CheckCircle2 } from "lucide-react";

interface AcademicPlannerStatsProps {
  cumulativeAverage: number | null;
  passedCredits: number;
  totalRequiredCredits: number;
  inProgressCredits: number;
  plannedCredits: number;
  estimatedSemestersLeft: number;
}

export function AcademicPlannerStats({
  cumulativeAverage,
  passedCredits,
  totalRequiredCredits,
  inProgressCredits,
  plannedCredits,
  estimatedSemestersLeft
}: AcademicPlannerStatsProps) {
  
  const remainingCredits = Math.max(0, totalRequiredCredits - passedCredits);
  const progressPercentage = Math.min(100, Math.round((passedCredits / totalRequiredCredits) * 100));

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      
      {/* Average Card */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cumulative Average</CardTitle>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Percent className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {cumulativeAverage !== null ? cumulativeAverage.toFixed(1) : "--"}
            <span className="text-base font-normal text-muted-foreground ml-1">/ 100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {cumulativeAverage !== null ? "Based on weighted numeric grades" : "Complete courses to calculate average"}
          </p>
        </CardContent>
      </Card>

      {/* Degree Progress Card */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Passed Credit Hours</CardTitle>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-3 mt-1">
             <div className="text-3xl font-bold text-foreground">
                {passedCredits} 
             </div>
             <div className="text-sm font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                {progressPercentage}%
             </div>
          </div>
          <Progress value={progressPercentage} className="h-2.5 bg-muted"  />
          <p className="text-xs text-muted-foreground mt-3">
             {remainingCredits} hours remaining out of {totalRequiredCredits}
          </p>
        </CardContent>
      </Card>

      {/* Remaining Estimate Card & Credits Info */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Timeline</CardTitle>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="text-3xl font-bold text-foreground flex items-baseline gap-1">
              {estimatedSemestersLeft > 0 ? "~" + Math.ceil(estimatedSemestersLeft * 10) / 10 : "0"}
              <span className="text-sm font-medium text-muted-foreground">semesters left</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-border/50">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="text-xs text-muted-foreground font-medium">{inProgressCredits} hr in progress</div>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                <div className="text-xs text-muted-foreground font-medium">{plannedCredits} hr planned</div>
             </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

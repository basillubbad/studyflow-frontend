"use client";
import { LearningPlan } from "@/types/self-learning";
import { calcPlanProgress, getNextMilestone, getActiveStageTitle, formatDate } from "@/lib/self-learning/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ArrowRight, Calendar, Target, Zap, CheckCircle2, PauseCircle, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: LearningPlan;
  onEdit: (plan: LearningPlan) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<LearningPlan["status"], { label: string; className: string; icon: React.ReactNode }> = {
  active:    { label: "Active",     className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0",     icon: <Zap className="w-3 h-3" /> },
  planned:   { label: "Planned",    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0",    icon: <BookOpen className="w-3 h-3" /> },
  completed: { label: "Completed",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0", icon: <CheckCircle2 className="w-3 h-3" /> },
  paused:    { label: "Paused",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0", icon: <PauseCircle className="w-3 h-3" /> },
};

export function LearningPlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const router = useRouter();
  const progress = calcPlanProgress(plan);
  const nextMilestone = getNextMilestone(plan);
  const activeStage = getActiveStageTitle(plan);
  const badge = STATUS_BADGE[plan.status];

  return (
    <Card className="group hover:shadow-md transition-all border-border/60 overflow-hidden relative">
      <div className={cn(
        "absolute inset-y-0 left-0 w-1 rounded-l-lg transition-opacity",
        plan.status === "active" ? "bg-blue-500" :
        plan.status === "completed" ? "bg-emerald-500" :
        plan.status === "paused" ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
      )} />

      <CardContent className="pl-6 pr-4 py-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Top row */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base leading-tight truncate">{plan.title}</h3>
                {plan.goal && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{plan.goal}</p>}
              </div>
              <Badge className={cn("shrink-0 gap-1 text-xs", badge.className)}>
                {badge.icon}{badge.label}
              </Badge>
            </div>

            {/* Skill & Category */}
            <div className="flex flex-wrap gap-2">
              {plan.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium">
                  {plan.category}
                </span>
              )}
              {plan.targetSkill && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />{plan.targetSkill}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{plan.stages.length > 0 ? `${plan.stages.filter(s=>s.status==="completed").length}/${plan.stages.length} stages` : "No stages yet"}</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Started {formatDate(plan.startDate)}
              </span>
              {plan.endDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Ends {formatDate(plan.endDate)}
                </span>
              )}
              {activeStage && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Active: {activeStage}
                </span>
              )}
              {nextMilestone && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  🏁 Next: {nextMilestone.title}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm" variant="ghost"
              className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => router.push(`/self-learning/${plan.id}`)}
            >
              Open <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/self-learning/${plan.id}`)}>
                  <ArrowRight className="mr-2 h-4 w-4" /> Open Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(plan)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(plan.id)} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

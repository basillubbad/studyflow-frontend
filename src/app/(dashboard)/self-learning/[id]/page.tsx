"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LearningPlan,
  LearningStage,
  LearningMilestone,
  LearningResource,
  SelfLearningTask,
} from "@/types/self-learning";
import { StageTasksList } from "@/components/self-learning/stage-tasks";
import { calcPlanProgress, formatDate } from "@/lib/self-learning/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Target,
  Calendar,
  ChevronDown,
  Zap,
  BookOpen,
  Flag,
  PauseCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StageFormDialog } from "@/components/self-learning/stage-form-dialog";
import { MilestoneFormDialog } from "@/components/self-learning/milestone-form-dialog";
import { LearningPlanFormDialog } from "@/components/self-learning/learning-plan-form-dialog";
import { PlanResourcesPanel } from "@/components/self-learning/plan-resources-panel";
import { ReminderBadge } from "@/components/shared/reminder-badge";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useAppState } from "@/hooks/use-app-state";

const STATUS_BADGE: Record<
  LearningPlan["status"],
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0",
    icon: <Zap className="w-3 h-3" />,
  },
  planned: {
    label: "Planned",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0",
    icon: <BookOpen className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  paused: {
    label: "Paused",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0",
    icon: <PauseCircle className="w-3 h-3" />,
  },
};

const STAGE_STATUS: Record<
  LearningStage["status"],
  { label: string; color: string }
> = {
  "not-started": { label: "Not Started", color: "text-muted-foreground" },
  active: { label: "Active", color: "text-blue-600 dark:text-blue-400" },
  completed: {
    label: "Completed",
    color: "text-emerald-600 dark:text-emerald-400",
  },
};

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const { state, isLoaded, updateState, loadLearningPlans } = useAppState();

  useEffect(() => {
    loadLearningPlans();
  }, [loadLearningPlans]);

  const plan = useMemo(() => {
    return state.selfLearningPlans.find((p) => p.id === planId) || null;
  }, [state.selfLearningPlans, planId]);

  const [expandedStages, setExpandedStages] = useState<string[]>([]);

  // Dialog states
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<LearningStage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<LearningMilestone | null>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(
    null,
  );

  // Persist every plan change
 const persistPlan = async (updated: LearningPlan) => {
  updateState((prev) => {
    const idx = prev.selfLearningPlans.findIndex((p) => p.id === updated.id);
    if (idx === -1) return prev;
    const newPlans = [...prev.selfLearningPlans];
    newPlans[idx] = updated;
    return { ...prev, selfLearningPlans: newPlans };
  });

  try {
    const { apiClient } = await import("@/lib/api-client");
    const oldPlan = state.selfLearningPlans.find((p) => p.id === updated.id);

    // Sync stages
    for (const stage of updated.stages) {
      const exists = oldPlan?.stages.find((s) => s.id === stage.id);
      if (!exists) {
        await apiClient.post(`/self-learning/${updated.id}/stages`, stage);
      } else {
        await apiClient.put(`/self-learning/${updated.id}/stages/${stage.id}`, stage);
      }
    }

    // Sync milestones
    for (const milestone of updated.milestones) {
      const exists = oldPlan?.milestones.find((m) => m.id === milestone.id);
      if (!exists) {
        await apiClient.post(`/self-learning/${updated.id}/milestones`, milestone);
      } else {
        await apiClient.put(`/self-learning/${updated.id}/milestones/${milestone.id}`, milestone);
      }
    }

    await apiClient.put(`/self-learning/${updated.id}`, updated);
  } catch (err) {
    console.error("Failed to persist plan", err);
  }
};
  const progress = useMemo(() => (plan ? calcPlanProgress(plan) : 0), [plan]);

  const learningPlansLoaded = state.loadedModules.includes("learningPlans");

  if (!isLoaded || !learningPlansLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={5} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Plan not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This learning plan could not be loaded or may have been deleted.
        </p>
        <Button
          className="mt-4 gap-2 rounded-xl"
          variant="outline"
          onClick={() => router.push("/self-learning")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>
      </div>
    );
  }

  const badge = STATUS_BADGE[plan.status];
  const completedStages = plan.stages.filter(
    (s) => s.status === "completed",
  ).length;
  const completedMilestones = plan.milestones.filter((m) => m.completed).length;

  // Stage handlers
  const handleSaveStage = (stage: LearningStage) => {
    const updated = {
      ...plan,
      stages: plan.stages.some((s) => s.id === stage.id)
        ? plan.stages.map((s) => (s.id === stage.id ? stage : s))
        : [...plan.stages, stage].sort((a, b) => a.order - b.order),
      updatedAt: new Date().toISOString(),
    };
    persistPlan(updated);
  };

  const handleDeleteStage = (id: string) => {
    setStageToDelete(id);
  };

  const confirmDeleteStage = () => {
    if (!stageToDelete || !plan) return;
    persistPlan({
      ...plan,
      stages: plan.stages.filter((s) => s.id !== stageToDelete),
      updatedAt: new Date().toISOString(),
    });
    setStageToDelete(null);
  };

  const handleCompleteStage = (id: string) => {
    const stages = plan.stages.map((s) =>
      s.id === id
        ? {
            ...s,
            status: "completed" as const,
            updatedAt: new Date().toISOString(),
          }
        : s,
    );
    persistPlan({ ...plan, stages, updatedAt: new Date().toISOString() });
  };

  // Milestone handlers
  const handleSaveMilestone = (milestone: LearningMilestone) => {
    const updated = {
      ...plan,
      milestones: plan.milestones.some((m) => m.id === milestone.id)
        ? plan.milestones.map((m) => (m.id === milestone.id ? milestone : m))
        : [...plan.milestones, milestone],
      updatedAt: new Date().toISOString(),
    };
    persistPlan(updated);
  };

  const handleToggleMilestone = (id: string) => {
    const milestones = plan.milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m,
    );
    persistPlan({ ...plan, milestones, updatedAt: new Date().toISOString() });
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestoneToDelete(id);
  };

  const confirmDeleteMilestone = () => {
    if (!milestoneToDelete || !plan) return;
    persistPlan({
      ...plan,
      milestones: plan.milestones.filter((m) => m.id !== milestoneToDelete),
      updatedAt: new Date().toISOString(),
    });
    setMilestoneToDelete(null);
  };

  const handleAddResource = async (resource: Omit<LearningResource, "id" | "createdAt" | "updatedAt">) => {
    if (!plan) return;
    try {
      const { DataService } = await import("@/services/data.service");
      const newResource = await DataService.createResource(plan.id, "LearningPlan", resource);
      // DataService returns Resource type which is compatible with LearningResource
      persistPlan({ ...plan, resources: [...(plan.resources || []), newResource as LearningResource], updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Failed to add resource", error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!plan) return;
    try {
      const { DataService } = await import("@/services/data.service");
      await DataService.deleteResource(id);
      persistPlan({ ...plan, resources: (plan.resources || []).filter(r => r.id !== id), updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Failed to delete resource", error);
    }
  };

  const handleEditPlan = (updated: LearningPlan) => persistPlan(updated);

  const handleStageTasksChange = (
    stageId: string,
    tasks: SelfLearningTask[],
  ) => {
    if (!plan) return;

    // Check if all tasks are completed (if there are tasks)
    const hasTasks = tasks.length > 0;
    const allDone = hasTasks && tasks.every((t) => t.completed);

    const stages = plan.stages.map((s) => {
      if (s.id !== stageId) return s;

      let newStatus = s.status;
      if (allDone && s.status !== "completed") {
        newStatus = "completed";
      } else if (hasTasks && !allDone && s.status === "completed") {
        newStatus = "active"; // Revert to active if a task is unchecked
      }

      return {
        ...s,
        tasks,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    persistPlan({ ...plan, stages, updatedAt: new Date().toISOString() });
  };

  const toggleStage = (id: string) =>
    setExpandedStages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Back + Header */}
      <div className="space-y-4">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {plan.title}
                  </h1>
                  <Badge className={cn("gap-1 text-xs", badge.className)}>
                    {badge.icon}
                    {badge.label}
                  </Badge>
                </div>
                {plan.goal && (
                  <p className="text-muted-foreground text-sm">{plan.goal}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {plan.category && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium">
                      {plan.category}
                    </span>
                  )}
                  {plan.targetSkill && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {plan.targetSkill}
                    </span>
                  )}
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
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditPlanOpen(true)}
                className="gap-2 rounded-xl shrink-0"
              >
                <Pencil className="h-4 w-4" /> Edit Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Progress",
            value: `${progress}%`,
            sub: "stages completed",
          },
          {
            label: "Stages",
            value: `${completedStages}/${plan.stages.length}`,
            sub: "completed",
          },
          {
            label: "Milestones",
            value: `${completedMilestones}/${plan.milestones.length}`,
            sub: "achieved",
          },
          {
            label: "Resources",
            value: `${plan.resources.length}`,
            sub: "attached",
          },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar full */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              Learning Progress
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          {progress === 100 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All stages completed! Amazing
              work.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main content: Stages + side panel */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Stages (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Stages</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingStage(null);
                setStageDialogOpen(true);
              }}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Stage
            </Button>
          </div>

          {plan.stages.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground bg-muted/10">
              <p className="text-sm">
                No stages yet. Break your plan into learning stages.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStageDialogOpen(true)}
                className="mt-2 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Stage
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {plan.stages.map((stage) => {
                const isExpanded = expandedStages.includes(stage.id);
                const ss = STAGE_STATUS[stage.status];
                return (
                  <Card
                    key={stage.id}
                    className={cn(
                      "border-border/60 overflow-hidden",
                      stage.status === "completed" && "opacity-75",
                    )}
                  >
                    <div
                      className={cn(
                        "h-0.5",
                        stage.status === "completed"
                          ? "bg-emerald-500"
                          : stage.status === "active"
                            ? "bg-blue-500"
                            : "bg-muted",
                      )}
                    />
                    {/* Split layout: clickable toggle area on left, action buttons isolated on right — avoids button-in-button */}
                    <div className="px-5 py-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleStage(stage.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggleStage(stage.id)
                        }
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                            isExpanded && "rotate-180",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {stage.title}
                            </span>
                            <span
                              className={cn("text-xs font-medium", ss.color)}
                            >
                              {ss.label}
                            </span>
                          </div>
                          {stage.targetDuration && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Duration: {stage.targetDuration}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Action buttons sit outside the clickable toggle — no nesting issue */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {stage.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs gap-1 h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleCompleteStage(stage.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Done
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingStage(stage);
                            setStageDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteStage(stage.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border/50 px-5 py-4 space-y-4 bg-muted/20">
                        {/* Stage Tasks */}
                        <div className="pb-2">
                          <StageTasksList
                            tasks={stage.tasks || []}
                            onTasksChange={(newTasks) =>
                              handleStageTasksChange(stage.id, newTasks)
                            }
                          />
                        </div>

                        {stage.description && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground">
                              Overview
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {stage.description}
                            </p>
                          </div>
                        )}
                        {stage.goals && (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1">
                              Goals
                            </p>
                            <div className="text-sm text-muted-foreground whitespace-pre-line bg-background/50 p-3 rounded-lg border border-border/40 font-medium leading-relaxed">
                              {stage.goals}
                            </div>
                          </div>
                        )}
                        {!stage.description &&
                          !stage.goals &&
                          !stage.tasks?.length && (
                            <p className="text-sm text-muted-foreground italic">
                              No details or tasks added yet.
                            </p>
                          )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Milestones */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Milestones
            </h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingMilestone(null);
                setMilestoneDialogOpen(true);
              }}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Milestone
            </Button>
          </div>

          {plan.milestones.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground bg-muted/10">
              <p className="text-sm">
                No milestones yet. Add checkpoints to celebrate progress.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMilestoneDialogOpen(true)}
                className="mt-2 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {plan.milestones.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all group",
                    m.completed
                      ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30 opacity-75"
                      : "bg-card border-border/60 hover:border-primary/20",
                  )}
                >
                  <button
                    onClick={() => handleToggleMilestone(m.id)}
                    className="shrink-0"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-amber-500 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        m.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {m.description}
                      </p>
                    )}
                    {m.targetDate && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(m.targetDate)}
                      </p>
                    )}
                    <ReminderBadge config={m.reminderConfig} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingMilestone(m);
                        setMilestoneDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMilestone(m.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel (1/3) */}
        <div className="space-y-4">
          <PlanResourcesPanel
            resources={plan.resources || []}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
          />

          {/* Insights card (Journey Formatted) */}
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-violet-700 dark:text-violet-400">
                Journey Summary
              </CardTitle>
              <Target className="w-4 h-4 text-violet-500" />
            </CardHeader>
            <CardContent className="space-y-4 text-sm mt-1">
              {/* Visual Timeline/Status */}
              <div className="relative pl-4 border-l-2 border-violet-200 dark:border-violet-800 space-y-5">
                {/* Start Point */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-semibold text-foreground">
                    Started On
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(plan.startDate)}
                  </p>
                </div>

                {/* Current State */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <p className="text-xs font-semibold text-foreground">
                    Currently At
                  </p>
                  {plan.stages.find((s) => s.status === "active") ? (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {plan.stages.find((s) => s.status === "active")!.title}
                    </p>
                  ) : progress === 100 && plan.stages.length > 0 ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Completed All Stages!
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Planning / Idle
                    </p>
                  )}
                </div>

                {/* Remaining / Goal */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-violet-400 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-semibold text-foreground">
                    Looking Ahead
                  </p>
                  {plan.stages.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {
                        plan.stages.filter((s) => s.status !== "completed")
                          .length
                      }{" "}
                      stage(s) remaining
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Add stages to map out your journey.
                    </p>
                  )}
                  {plan.milestones
                    .filter((m) => !m.completed && m.targetDate)
                    .sort(
                      (a, b) =>
                        new Date(a.targetDate!).getTime() -
                        new Date(b.targetDate!).getTime(),
                    )[0] && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1 flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Next:{" "}
                      {
                        plan.milestones.filter(
                          (m) => !m.completed && m.targetDate,
                        )[0].title
                      }
                    </p>
                  )}
                </div>
              </div>

              {plan.description && (
                <div className="pt-3 flex flex-col gap-2 border-t border-violet-100 dark:border-violet-800/50">
                  <p className="text-xs text-muted-foreground font-semibold">
                    Goal:
                  </p>
                  <p className="text-xs italic text-muted-foreground leading-relaxed">
                    &quot;{plan.description}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <LearningPlanFormDialog
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        onSave={handleEditPlan}
        initialData={plan}
      />
      <StageFormDialog
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        onSave={handleSaveStage}
        initialData={editingStage}
        planId={planId}
        nextOrder={plan.stages.length + 1}
      />
      <MilestoneFormDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        onSave={handleSaveMilestone}
        initialData={editingMilestone}
        planId={planId}
      />

      <ConfirmActionDialog
        isOpen={!!stageToDelete}
        title="Delete Stage"
        description="Are you sure you want to delete this stage? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteStage}
        onCancel={() => setStageToDelete(null)}
      />

      <ConfirmActionDialog
        isOpen={!!milestoneToDelete}
        title="Delete Milestone"
        description="Are you sure you want to delete this milestone? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteMilestone}
        onCancel={() => setMilestoneToDelete(null)}
      />
    </div>
  );
}

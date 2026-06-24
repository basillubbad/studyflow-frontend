import { LearningPlan, LearningMilestone, PlanStatus, SelfLearningStats } from "@/types/self-learning";

export const LS_KEY = "studyflow_self_learning";

export function generatePlanId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `sl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function loadPlans(): LearningPlan[] {
  return [];
}

export function savePlans(plans: LearningPlan[]): void {
  // Data should be handled by backend
}

/** Progress based on completed stages / total stages */
export function calcPlanProgress(plan: LearningPlan): number {
  const stages = plan.stages ?? [];
  if (stages.length === 0) return 0;
  const done = stages.filter(s => s.status === "completed").length;
  return Math.round((done / stages.length) * 100);
}

export function getStats(plans: LearningPlan[]): SelfLearningStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMilestones = plans.flatMap(p => p.milestones ?? []).filter(m => {
    if (m.completed) return false;
    if (!m.targetDate) return false;
    const d = new Date(m.targetDate);
    return d >= today;
  }).length;

  return {
    total: plans.length,
    active: plans.filter(p => p.status === "active").length,
    completed: plans.filter(p => p.status === "completed").length,
    paused: plans.filter(p => p.status === "paused").length,
    planned: plans.filter(p => p.status === "planned").length,
    upcomingMilestones,
  };
}

export function filterPlans(
  plans: LearningPlan[],
  status: PlanStatus | "all",
  category: string,
  search: string
): LearningPlan[] {
  return plans.filter(p => {
    if (status !== "all" && p.status !== status) return false;
    if (category && category !== "all" && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

export function sortPlans(
  plans: LearningPlan[],
  sortBy: "newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end"
): LearningPlan[] {
  return [...plans].sort((a, b) => {
    switch (sortBy) {
      case "newest":        return b.createdAt.localeCompare(a.createdAt);
      case "oldest":        return a.createdAt.localeCompare(b.createdAt);
      case "most-progress": return calcPlanProgress(b) - calcPlanProgress(a);
      case "least-progress":return calcPlanProgress(a) - calcPlanProgress(b);
      case "nearest-end": {
        const da = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const db = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return da - db;
      }
      default: return 0;
    }
  });
}

export function getNextMilestone(plan: LearningPlan): LearningMilestone | null {
  const upcoming = (plan.milestones ?? [])
    .filter(m => !m.completed)
    .sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  return upcoming[0] ?? null;
}

export function getActiveStageTitle(plan: LearningPlan): string | null {
  const active = (plan.stages ?? []).find(s => s.status === "active");
  return active?.title ?? null;
}

export function getUniqueCategories(plans: LearningPlan[]): string[] {
  const cats = plans.map(p => p.category).filter(Boolean) as string[];
  return [...new Set(cats)];
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

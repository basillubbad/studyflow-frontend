"use client";

import { useState, useMemo, useEffect } from "react";
import { LearningPlan, PlanStatus } from "@/types/self-learning";
import { getStats, filterPlans, sortPlans, getUniqueCategories } from "@/lib/self-learning/utils";
import { useAppState } from "@/hooks/use-app-state";
import { SelfLearningHeader } from "@/components/self-learning/self-learning-header";
import { SelfLearningStats } from "@/components/self-learning/self-learning-stats";
import { SelfLearningFilters } from "@/components/self-learning/self-learning-filters";
import { LearningPlanCard } from "@/components/self-learning/learning-plan-card";
import { LearningPlanFormDialog } from "@/components/self-learning/learning-plan-form-dialog";
import { SelfLearningEmptyState } from "@/components/self-learning/self-learning-empty-state";
import { HeaderSkeleton, CardGridSkeleton } from "@/components/shared/skeletons";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";

export default function SelfLearningPage() {
  const { state, isLoaded, addLearningPlan, updateLearningPlan, deleteLearningPlan, loadLearningPlans } = useAppState();

  useEffect(() => { loadLearningPlans(); }, [loadLearningPlans]);
  const plans = state.selfLearningPlans;

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LearningPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // Filter/sort state
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end">("newest");

  const stats = useMemo(() => getStats(plans), [plans]);
  const categories = useMemo(() => getUniqueCategories(plans), [plans]);

  const displayedPlans = useMemo(() => {
    const filtered = filterPlans(plans, statusFilter, categoryFilter, search);
    return sortPlans(filtered, sortBy);
  }, [plans, statusFilter, categoryFilter, search, sortBy]);

  const handleNewPlan = () => { setEditingPlan(null); setFormOpen(true); };
  const handleEdit = (plan: LearningPlan) => { setEditingPlan(plan); setFormOpen(true); };
  const handleDelete = (id: string) => { setPlanToDelete(id); };

  const confirmDeletePlan = async () => {
    if (planToDelete) {
      await deleteLearningPlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  const handleSave = async (plan: LearningPlan) => {
    const exists = state.selfLearningPlans.find(p => p.id === plan.id);
    if (exists) {
      await updateLearningPlan(plan);
    } else {
      await addLearningPlan(plan);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">
      <SelfLearningHeader onNewPlan={handleNewPlan} />

      {plans.length > 0 && <SelfLearningStats stats={stats} />}

      <section className="space-y-4">
        {plans.length > 0 && (
          <SelfLearningFilters
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            search={search} setSearch={setSearch}
            sortBy={sortBy} setSortBy={setSortBy}
            categories={categories}
          />
        )}

        {plans.length === 0 ? (
          <SelfLearningEmptyState onNewPlan={handleNewPlan} />
        ) : displayedPlans.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl border-border/50 text-muted-foreground bg-muted/10">
            <p>No plans match your current filters.</p>
            <button onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}
              className="mt-2 text-primary text-sm font-medium hover:underline">Clear Filters</button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPlans.map(plan => (
              <LearningPlanCard key={plan.id} plan={plan} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <LearningPlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        initialData={editingPlan}
      />

      <ConfirmActionDialog
        isOpen={!!planToDelete}
        title="Delete Learning Plan"
        description="Are you sure you want to delete this learning plan? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeletePlan}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
}
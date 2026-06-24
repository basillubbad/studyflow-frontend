"use client";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SelfLearningEmptyStateProps {
  onNewPlan: () => void;
}

export function SelfLearningEmptyState({ onNewPlan }: SelfLearningEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5 border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
      <div className="p-4 rounded-2xl bg-violet-100 dark:bg-violet-900/20">
        <Sparkles className="w-10 h-10 text-violet-500" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-bold text-foreground">No learning plans yet</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Start your first personal learning journey. Define your goal, break it into stages, and track your progress.
        </p>
      </div>
      <Button onClick={onNewPlan} className="gap-2 rounded-xl mt-1">
        <Sparkles className="w-4 h-4" /> Create Your First Plan
      </Button>
    </div>
  );
}

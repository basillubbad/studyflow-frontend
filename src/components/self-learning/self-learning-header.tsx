"use client";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface SelfLearningHeaderProps {
  onNewPlan: () => void;
}

export function SelfLearningHeader({ onNewPlan }: SelfLearningHeaderProps) {
  return (

     <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full">
            <div className="space-y-1 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Self-Learning</h1>
              <p className="mt-1 text-muted-foreground">
               Track your personal learning journey, build skills, and grow step by step.
              </p>
            </div>
            <div className="flex w-full md:w-auto shrink-0">
              <Button onClick={onNewPlan} className="w-full sm:w-auto shadow-sm" size="lg">
                <Plus className="mr-2 h-5 w-5" />
 New Learning Plan              </Button>
            </div>
          </div>

  );
}

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Route, PlaySquare, ArrowRight } from "lucide-react";
import Link from "next/link";

import { LearningPlan } from "@/types/self-learning";
import { calcPlanProgress } from "@/lib/self-learning/utils";

interface SelfLearningProgressProps {
  plans: LearningPlan[];
}

export function SelfLearningProgress({ plans }: SelfLearningProgressProps) {
  const activePlans = plans.filter(p => p.status === "active");
  const currentPlan = activePlans.sort((a, b) => calcPlanProgress(b) - calcPlanProgress(a))[0];

  return (
    <Card className="flex flex-col h-full border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Self Learning
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4">
        {currentPlan ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">Current Plan</p>
                  <h3 className="text-base font-semibold leading-tight">{currentPlan.title}</h3>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <PlaySquare className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Course Progress</span>
                  <span className="text-primary">{calcPlanProgress(currentPlan)}%</span>
                </div>
                <Progress value={calcPlanProgress(currentPlan)} className="h-2 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-2 border-dashed border-2 rounded-xl border-border/40">
            <PlaySquare className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Start a self-learning plan to track your progress.</p>
          </div>
        )}
        
        <div className="mt-6">
          <Button variant="default" className="w-full gap-2 group" asChild>
            <Link href="/self-learning">
              {currentPlan ? "Continue Learning" : "Explore Plans"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

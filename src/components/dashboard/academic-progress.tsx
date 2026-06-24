"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ArrowRight, Percent } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AcademicPlannerConfig } from "@/types/academic-planning";
import { calculateCumulativeAverage, calculatePassedCompletedCredits } from "@/lib/academic-planning/utils";

interface AcademicProgressProps {
  completionPercentage: number;
  passedCredits: number;
  requiredCredits: number;
}

export function AcademicProgress({ 
  completionPercentage, 
  passedCredits, 
  requiredCredits 
}: AcademicProgressProps) {
  const remainingCredits = Math.max(0, requiredCredits - passedCredits);

  return (
    <Card className="flex flex-col h-full border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <GraduationCap className="h-5 w-5 text-primary" />
          Academic Progress
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex -mr-2 text-muted-foreground hover:text-primary transition-colors">
            <Link href="/academic-planning">
              Open Planner <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center gap-6 pt-4">
        <Link href="/academic-planning" className="absolute inset-0 z-0 sm:hidden" aria-label="Open Academic Planner"></Link>

        <div className="flex justify-between items-end border-b border-border/60 pb-5 relative z-10 pointer-events-none sm:pointer-events-auto">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Progress
            </p>
            <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
              {completionPercentage}<span className="text-sm text-foreground/50 ml-1 font-normal">%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground mb-1">Passed Hours</p>
            <p className="text-xl font-semibold">
              <span className="text-foreground">{passedCredits}</span>
              <span className="text-muted-foreground text-sm"> / {requiredCredits}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2.5 relative z-10 pointer-events-none sm:pointer-events-auto">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-500/10">Keep it up!</span>
            <span className="text-muted-foreground">{remainingCredits} hours left</span>
          </div>
          <Progress value={completionPercentage} className="h-2.5 bg-muted"  />
        </div>
      </CardContent>
    </Card>
  );
}

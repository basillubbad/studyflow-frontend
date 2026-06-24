"use client";

import { useEffect } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { 
  selectDashboardStats, 
  selectHighPriorityTasks, 
  selectAcademicSummary 
} from "@/lib/store/app-selectors";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { FocusModeCard } from "@/components/dashboard/focus-mode-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SelfLearningProgress } from "@/components/dashboard/self-learning-progress";
import { HighPriorityTasks } from "@/components/dashboard/high-priority-tasks";
import { AcademicProgress } from "@/components/dashboard/academic-progress";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardClient() {
  const {
    state,
    isLoaded,
    updateStreak,
    loadCourses,
    loadTasks,
    loadLearningPlans,
    loadSemesters,
  } = useAppState();

  useEffect(() => {
    loadTasks();
    loadCourses();
    loadLearningPlans();
    loadSemesters();
  }, [loadTasks, loadCourses, loadLearningPlans, loadSemesters]);

  useEffect(() => {
    if (isLoaded) {
      updateStreak();
    }
  }, [isLoaded, updateStreak]);

  const dashboardModulesLoaded =
    state.loadedModules.includes("tasks") &&
    state.loadedModules.includes("courses") &&
    state.loadedModules.includes("learningPlans") &&
    state.loadedModules.includes("semesters");

  if (!isLoaded || !dashboardModulesLoaded) {
    return <DashboardSkeleton />;
  }

  const stats = selectDashboardStats(state);
  const highPriorityTasks = selectHighPriorityTasks(state);
  const academicSummary = selectAcademicSummary(state);

  return (
    <div className="space-y-6 pb-8 pt-4 md:pt-6 animate-in fade-in zoom-in-95 duration-500">
      <WelcomeSection userName={state.userProfile.name} />
      
      {/* Top Row: Quick Stats */}
      <QuickStats 
        activeCourses={stats.activeCourses}
        pendingTasks={stats.pendingTasks}
        completedCredits={stats.completedCredits}
        milestones={stats.milestones}
        streakCount={state.streak?.currentCount || 0}
        longestStreak={state.streak?.longestCount || 0}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <HighPriorityTasks tasks={highPriorityTasks} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AcademicProgress 
              completionPercentage={academicSummary.completionPercentage}
              passedCredits={academicSummary.passedCredits}
              requiredCredits={academicSummary.requiredCredits}
            />
            <SelfLearningProgress plans={state.selfLearningPlans} />
          </div>
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          <FocusModeCard />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

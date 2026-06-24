"use client";

import { CourseStatus } from "@/types/course";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoursesTabsProps {
  activeTab: CourseStatus | "all";
  onTabChange: (tab: CourseStatus | "all") => void;
  counts: {
    all: number;
    current: number;
    completed: number;
    planned: number;
  };
}

export function CoursesTabs({
  activeTab,
  onTabChange,
  counts,
}: CoursesTabsProps) {
  const tabs: { id: CourseStatus | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "current", label: "Current", count: counts.current },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "planned", label: "Planned", count: counts.planned },
  ];

  return (
    <div className="flex items-center gap-2 border-b">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative rounded-none border-b-2 border-transparent transition-colors",
            activeTab === tab.id && "border-b-primary text-popover-foreground",
          )}
        >
          {tab.label}
          {tab.count > 0 && (
            <span className="ml-2 text-xs font-medium text-muted-foreground">
              ({tab.count})
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

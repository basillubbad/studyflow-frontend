"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: "month" | "week" | "day" | "agenda";
  onViewChange: (view: "month" | "week" | "day" | "agenda") => void;
  onAddEvent?: () => void;
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  viewMode,
  onViewChange,
  onAddEvent,
}: CalendarHeaderProps) {
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const viewOptions = [
    { id: "month", label: "Month" },
    { id: "week", label: "Week" },
    { id: "day", label: "Day" },
    { id: "agenda", label: "Agenda" },
  ] as const;

  return (
    <div className="border-b border-border bg-background sticky top-15 z-20">
         <div className="flex  flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full mb-5">
            <div className="space-y-1 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Academic Calendar</h1>
              <p className="mt-1 text-muted-foreground">
                Manage and track all your academic courses.
              </p>
            </div>
          </div>
        {/* Bottom Row: Navigation and View Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          {/* Left: Navigation */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onPreviousMonth}
              className="p-2 h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToday}
              className="min-w-fit"
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onNextMonth}
              className="p-2 h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Current Date Range */}
            <div className="ml-4 text-sm font-semibold text-muted-foreground">
              {monthYear}
            </div>
          </div>

          {/* Right: View Options */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {viewOptions.map((option) => (
              <Button
                key={option.id}
                size="sm"
                variant={viewMode === option.id ? "default" : "ghost"}
                onClick={() => onViewChange(option.id)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
    </div>
  );
}

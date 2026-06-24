"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/utils";

interface ChallengeBarProps {
  totalMinutes: number;
  completedMinutes: number;
  currentSessionElapsedSeconds?: number;
  isTimerRunning?: boolean;
  activeSession?: string;
  className?: string;
}

export function ChallengeBar({
  totalMinutes,
  completedMinutes,
  currentSessionElapsedSeconds = 0,
  isTimerRunning = false,
  activeSession = "pomodoro",
  className,
}: ChallengeBarProps) {
  // Calculate live focus minutes including current session elapsed time
  // Only count elapsed time if timer is running and in a pomodoro session
  const currentSessionElapsedMinutes =
    isTimerRunning && activeSession === "pomodoro"
      ? currentSessionElapsedSeconds / 60
      : 0;

  const liveFocusMinutes = completedMinutes + currentSessionElapsedMinutes;

  const remainingMinutes = Math.max(totalMinutes - liveFocusMinutes, 0);
  // Floor the remaining minutes for clean display without decimals
  const displayedRemainingMinutes = Math.floor(remainingMinutes);
  const progress = Math.min((liveFocusMinutes / totalMinutes) * 100, 100);

  return (
    <div className={cn("text-center space-y-2", className)}>
      <p className="text-sm">
        <span className="text-primary font-medium">
          {formatMinutes(displayedRemainingMinutes)}
        </span>
        <span className="text-muted-foreground"> remaining / challenge </span>
        <span className="font-medium">{formatMinutes(totalMinutes)}</span>
      </p>
      <div className="relative mx-auto max-w-md">
        <Progress value={progress} className="h-3" />
        {/* Progress indicator marks */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-2 rounded-sm",
                (i / 10) * 100 < progress
                  ? "bg-primary"
                  : "bg-muted-foreground/20",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

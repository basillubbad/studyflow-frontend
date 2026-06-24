"use client"

import { cn } from "@/lib/utils"

export type SessionType = "pomodoro" | "rest" | "longRest"

interface SessionTabsProps {
  activeSession: SessionType
  onSessionChange: (session: SessionType) => void
  sessionCounts: {
    pomodoro: number
    rest: number
    longRest: number
  }
  className?: string
}

export function SessionTabs({
  activeSession,
  onSessionChange,
  sessionCounts,
  className,
}: SessionTabsProps) {
  const tabs: { id: SessionType; label: string; count: number }[] = [
    { id: "pomodoro", label: "Pomodoro", count: sessionCounts.pomodoro },
    { id: "rest", label: "Rest", count: sessionCounts.rest },
    { id: "longRest", label: "Long Rest", count: sessionCounts.longRest },
  ]

  return (
    <div className={cn("flex items-center justify-center gap-8", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSessionChange(tab.id)}
          className={cn(
            "flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors",
            activeSession === tab.id
              ? "border-primary/50 text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{tab.label}</span>
          <span
            className={cn(
              "text-xs",
              activeSession === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

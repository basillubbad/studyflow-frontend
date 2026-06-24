"use client"

import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  time: number // in seconds
  level: string
  progress: number // 0-100
  className?: string
}

export function TimerDisplay({ time, level, progress, className }: TimerDisplayProps) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  // Calculate the circumference and offset for the progress ring
  const radius = 140
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Background circle */}
      <svg className="size-80 -rotate-90 transform" viewBox="0 0 320 320">
        {/* Track circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-linear"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
        {/* Indicator dot */}
        <circle
          cx="160"
          cy={160 - radius}
          r="4"
          fill="currentColor"
          className="text-primary"
          style={{
            transform: `rotate(${(progress / 100) * 360}deg)`,
            transformOrigin: "160px 160px",
          }}
        />
      </svg>

      {/* Timer content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-7xl font-light tracking-tight text-muted-foreground">
          {formattedTime}
        </span>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Level</p>
          <p className="font-medium text-muted-foreground">{level}</p>
        </div>
      </div>
    </div>
  )
}

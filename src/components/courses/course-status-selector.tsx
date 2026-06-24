"use client";

import { CourseStatus } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CourseStatusSelectorProps {
  value: CourseStatus;
  onChange: (status: CourseStatus) => void;
  error?: string;
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "completed", label: "Completed" },
  { value: "planned", label: "Planned" },
];

export function CourseStatusSelector({
  value,
  onChange,
  error,
}: CourseStatusSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Status *</Label>
      <div className="flex gap-2 w-full">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            variant={value === option.value ? "default" : "outline"}
            className={cn(
              "flex-1 transition-all",
              value === option.value
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:border-primary/50",
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

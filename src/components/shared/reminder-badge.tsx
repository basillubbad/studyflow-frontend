import React from "react";
import { ReminderConfig } from "@/types/reminders";
import { formatReminderLabel } from "@/lib/reminders/utils";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ReminderBadgeProps {
  config?: ReminderConfig;
  showLabel?: boolean;
  className?: string;
  variant?: "outline" | "secondary" | "default";
}

export function ReminderBadge({ config, showLabel = true, className, variant = "secondary" }: ReminderBadgeProps) {
  if (!config || !config.enabled) return null;

  return (
    <Badge 
      variant={variant} 
      className={cn("flex items-center gap-1.5 px-2 py-0.5 font-normal", className)}
    >
      <Bell className="h-3 w-3" />
      {showLabel && <span className="text-[10px]">{formatReminderLabel(config)}</span>}
    </Badge>
  );
}

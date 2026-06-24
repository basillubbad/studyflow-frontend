"use client";

import { Notification } from "@/types/notifications";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BookOpen, 
  CalendarClock,
  CheckCircle2, 
  Clock, 
  Info,
  TriangleAlert,
  LucideIcon 
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date-utils";

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: string) => void;
}

const typeIcons: Record<string, LucideIcon> = {
  task: CheckCircle2,
  course: BookOpen,
  exam: Clock,
  assignment: BookOpen,
  reflection: Info,
  system: Info,
  reminder: Bell,
};

const severityColors: Record<string, string> = {
  critical: "text-red-600 bg-red-50 dark:bg-red-500/10",
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
  info: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
};

const severityBadgeStyles: Record<string, string> = {
  critical:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-500/10 dark:text-red-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-500/10 dark:text-amber-300",
  info:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-500/10 dark:text-blue-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const severityLabels: Record<string, string> = {
  critical: "Critical",
  warning: "Soon",
  info: "Update",
  success: "Done",
};

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon =
    notification.severity === "critical"
      ? TriangleAlert
      : typeIcons[notification.type] || Info;
  const colorClass =
    severityColors[notification.severity] || "text-slate-500 bg-slate-50";

  return (
    <div 
      onClick={() => onClick(notification.id)}
      className={cn(
        "group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        !notification.read
          ? "border-primary/15 bg-gradient-to-r from-primary/6 via-background to-background shadow-sm"
          : "border-border/60 bg-card hover:bg-muted/30",
        notification.severity === "critical" &&
          "border-red-200/70 bg-gradient-to-r from-red-50/80 via-background to-background dark:border-red-900/50 dark:from-red-950/20",
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-black/5",
            colorClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "truncate text-sm font-semibold leading-none",
                    !notification.read ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {notification.title}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide",
                    severityBadgeStyles[notification.severity],
                  )}
                >
                  {severityLabels[notification.severity]}
                </Badge>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {notification.message}
              </p>
            </div>

            <span className="whitespace-nowrap pt-0.5 text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          {notification.eventDate && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              <span
                className={cn(
                  notification.severity === "critical"
                    ? "text-red-600 dark:text-red-300"
                    : notification.severity === "warning"
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-muted-foreground",
                )}
              >
                Due{" "}
                {new Date(notification.eventDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {!notification.read && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
        </div>
      )}
      {notification.severity === "critical" && (
        <div className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full bg-red-500/90" />
      )}
    </div>
  );
}

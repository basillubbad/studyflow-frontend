"use client";

import { Card } from "@/components/ui/card";
import { CalendarEvent, getEventDot } from "@/lib/calendar-utils";
import { Clock, AlertCircle } from "lucide-react";

interface UpcomingDeadlinesProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function UpcomingDeadlines({
  events,
  onEventClick,
}: UpcomingDeadlinesProps) {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate > now && eventDate < next7Days && event.status !== "completed"
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < now;
  };

  const isDueToday = (dateString: string) => {
    const date = new Date(dateString);
    return date.toDateString() === now.toDateString();
  };

  const isDueSoon = (dateString: string) => {
    const date = new Date(dateString);
    const daysUntil = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntil <= 2 && daysUntil >= 0;
  };

  return (
    <Card className="p-4 border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Upcoming (7 days)
      </h3>

      {upcomingEvents.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
          No upcoming events
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {upcomingEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getEventDot(event.type, event.status)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-white group-hover:underline line-clamp-2">
                    {event.title}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {formatDate(event.date)}
                    </span>
                    {isDueToday(event.date) && (
                      <Clock className="h-3 w-3 text-orange-500" />
                    )}
                    {isDueSoon(event.date) && !isDueToday(event.date) && (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

"use client";

import {
  CalendarEvent,
  getEventColor,
  getEventTypeLabel,
  getEventDot,
} from "@/lib/calendar-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export function AgendaView({
  events,
  currentDate,
  onEventClick,
}: AgendaViewProps) {
  const now = new Date();
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= currentDate && eventDate <= next30Days;
    })
    .sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      if (!a.time && b.time) return -1;
      if (a.time && !b.time) return 1;
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
    return daysUntil <= 3 && daysUntil >= 0;
  };

  // Group events by date
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  upcomingEvents.forEach((event) => {
    const date = event.date.split("T")[0];
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {Object.entries(groupedEvents).length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No upcoming events in the next 30 days
          </p>
        </Card>
      ) : (
        Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey}>
            {/* Date header */}
            <div className="mb-3 sticky top-0 bg-white dark:bg-slate-950 z-10 flex items-center gap-3 px-2 py-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white min-w-fit">
                {formatFullDate(dateKey)}
              </div>
              {isDueToday(dateKey) && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs">
                  Today
                </Badge>
              )}
              {isDueSoon(dateKey) && !isDueToday(dateKey) && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0 text-xs">
                  Soon
                </Badge>
              )}
            </div>

            {/* Day's events */}
            <div className="space-y-2 ml-0">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-colors hover:shadow-md text-left",
                    getEventColor(event.type, event.status),
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Dot */}
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                        getEventDot(event.type, event.status),
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold truncate">
                          {event.title}
                        </h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1 mt-2">
                        <div className="text-slate-600 dark:text-slate-400">
                          {event.courseName}
                          {event.courseCode && ` (${event.courseCode})`}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                              {event.endTime && ` - ${event.endTime}`}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          {isOverdue(event.date) &&
                            event.status !== "completed" && (
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Overdue
                              </span>
                            )}
                        </div>

                        {event.description && (
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

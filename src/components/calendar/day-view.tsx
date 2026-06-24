"use client";

import {
  CalendarEvent,
  getEventColor,
  getEventTypeLabel,
} from "@/lib/calendar-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export function DayView({ events, currentDate, onEventClick }: DayViewProps) {
  const dateString = currentDate.toISOString().split("T")[0];
  const dayEvents = events
    .filter((e) => e.date.split("T")[0] === dateString)
    .sort((a, b) => {
      if (!a.time) return -1; // All-day events first
      if (!b.time) return 1;
      return a.time.localeCompare(b.time);
    });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const allDayEvents = dayEvents.filter((e) => !e.time);
  const timedEvents = dayEvents.filter((e) => e.time);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Day Header */}
      <Card className="p-6 mb-6 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatDate(currentDate)}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
        </p>
      </Card>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            All Day
          </h3>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={`w-full p-4 rounded-lg border transition-colors hover:shadow-md ${getEventColor(
                  event.type,
                  event.status,
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-xs mt-1">{event.courseName}</p>
                    {event.description && (
                      <p className="text-xs mt-2 opacity-75">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timed events */}
      {timedEvents.length > 0 ? (
        <div className="space-y-4">
          {timedEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`w-full p-4 rounded-lg border transition-colors hover:shadow-md ${getEventColor(
                event.type,
                event.status,
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">{event.title}</h4>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
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
                  </div>

                  <p className="text-xs mt-2">{event.courseName}</p>
                  {event.description && (
                    <p className="text-xs mt-2 opacity-75">
                      {event.description}
                    </p>
                  )}
                </div>

                <Badge variant="outline" className="shrink-0">
                  {getEventTypeLabel(event.type)}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      ) : allDayEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No events scheduled for this day
          </p>
        </Card>
      ) : null}
    </div>
  );
}

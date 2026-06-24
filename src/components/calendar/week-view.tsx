"use client";

import { CalendarEvent, getEventColor } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export function WeekView({ events, currentDate, onEventClick }: WeekViewProps) {
  // Get the start of the week (Saturday)
  const startOfWeek = new Date(currentDate);
  const daysToSubtract = (currentDate.getDay() + 1) % 7;
  startOfWeek.setDate(currentDate.getDate() - daysToSubtract);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndTime = (date: Date, hour: number) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter((e) => {
      if (e.date.split("T")[0] !== dateString) return false;
      if (!e.time) return hour === 0; // All-day events at top
      const eventHour = parseInt(e.time.split(":")[0]);
      return eventHour === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-8 sticky  z-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="col-span-1 px-2 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
          Time
        </div>
        {weekDays.map((date, index) => (
          <div
            key={index}
            className={cn(
              "col-span-1 px-2 py-3 text-center border-l border-slate-200 dark:border-slate-800",
              isToday(date) && "bg-blue-50 dark:bg-blue-900/20",
            )}
          >
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}
            </div>
            <div
              className={cn(
                "text-sm font-bold",
                isToday(date)
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-900 dark:text-white",
              )}
            >
              {date.getDate()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {formatDate(date)}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 min-h-16"
          >
            {/* Time label */}
            <div className="col-span-1 px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 border-r border-slate-200 dark:border-slate-800">
              {hour.toString().padStart(2, "0")}:00
            </div>

            {/* Time slots */}
            {weekDays.map((date, dayIndex) => {
              const dayEvents = getEventsForDateAndTime(date, hour);

              return (
                <div
                  key={dayIndex}
                  className="col-span-1 px-2 py-2 border-l border-slate-200 dark:border-slate-800 relative"
                >
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs font-medium truncate border transition-colors hover:opacity-80 mb-1",
                        getEventColor(event.type, event.status),
                      )}
                      title={event.title}
                    >
                      <div className="font-semibold truncate">
                        {event.title}
                      </div>
                      {event.time && (
                        <div className="text-xs opacity-75">{event.time}</div>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

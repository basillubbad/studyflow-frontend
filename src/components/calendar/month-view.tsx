"use client";

import { CalendarEvent, getEventColor } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  activeDays?: string[];
}

export function MonthView({
  events,
  currentDate,
  onEventClick,
  onDateClick,
  activeDays = [],
}: MonthViewProps) {
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const prevLastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0,
  ).getDate();
  const firstDayOfWeek = (firstDay.getDay() + 1) % 7;

  const days = [];

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevLastDay - i,
      isCurrentMonth: false,
      dateObj: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        prevLastDay - i,
      ),
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      dateObj: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      dateObj: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        i,
      ),
    });
  }

  const getEventsForDate = (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter((e) => e.date.split("T")[0] === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.dateObj);

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(day.dateObj)}
              className={cn(
                "min-h-32 p-2 border-r border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                !day.isCurrentMonth && "bg-slate-50/50 dark:bg-slate-900/30",
                isToday(day.dateObj) && "bg-blue-50 dark:bg-blue-900/20",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={cn(
                    "text-xs font-semibold",
                    day.isCurrentMonth
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-600",
                    isToday(day.dateObj) &&
                      "inline-block w-5 h-5 text-center flex items-center justify-center rounded-full bg-blue-600 text-white",
                  )}
                >
                  {day.date}
                </div>
                {activeDays.includes(`${day.dateObj.getFullYear()}-${String(day.dateObj.getMonth() + 1).padStart(2, '0')}-${String(day.dateObj.getDate()).padStart(2, '0')}`) && (
                  <span className="text-xs">🔥</span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={cn(
                      "w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate border transition-colors hover:opacity-80",
                      getEventColor(event.type, event.status),
                    )}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

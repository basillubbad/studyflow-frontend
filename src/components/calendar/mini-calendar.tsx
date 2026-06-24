"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  activeDays?: string[];
}

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  activeDays = [],
}: MiniCalendarProps) {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 1) % 7;
  };

  const prevMonth = () => {
    setMiniCalendarMonth(
      new Date(
        miniCalendarMonth.getFullYear(),
        miniCalendarMonth.getMonth() - 1,
      ),
    );
  };

  const nextMonth = () => {
    setMiniCalendarMonth(
      new Date(
        miniCalendarMonth.getFullYear(),
        miniCalendarMonth.getMonth() + 1,
      ),
    );
  };

  const daysInMonth = getDaysInMonth(miniCalendarMonth);
  const firstDay = getFirstDayOfMonth(miniCalendarMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = miniCalendarMonth.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      miniCalendarMonth.getMonth() === today.getMonth() &&
      miniCalendarMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      miniCalendarMonth.getMonth() === selectedDate.getMonth() &&
      miniCalendarMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isActiveDay = (day: number) => {
    const dateStr = `${miniCalendarMonth.getFullYear()}-${String(miniCalendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeDays.includes(dateStr);
  };

  return (
    <Card className="p-4 border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {monthName}
        </h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={prevMonth}
            className="p-1 h-6 w-6"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={nextMonth}
            className="p-1 h-6 w-6"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"].map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => {
              if (day) {
                onDateSelect(
                  new Date(
                    miniCalendarMonth.getFullYear(),
                    miniCalendarMonth.getMonth(),
                    day,
                  ),
                );
              }
            }}
            className={`h-7 text-xs font-medium rounded transition-colors relative flex items-center justify-center ${
              day === null
                ? "text-transparent"
                : isSelected(day)
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : isToday(day)
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {day}
            {day && isActiveDay(day) && (
              <span className="absolute -top-1 -right-1 text-[8px]">🔥</span>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

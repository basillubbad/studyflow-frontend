"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  filterEvents,
  CalendarEvent,
  CalendarFilters,
} from "@/lib/calendar-utils";
import { useAppState } from "@/hooks/use-app-state";
import { selectCalendarEvents } from "@/lib/store/app-selectors";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { CalendarFilters as FilterComponent } from "@/components/calendar/calendar-filters";
import { UpcomingDeadlines } from "@/components/calendar/upcoming-deadlines";
import { ColorLegend } from "@/components/calendar/color-legend";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { AgendaView } from "@/components/calendar/agenda-view";
import { EventDetailsModal } from "@/components/calendar/event-details-modal";
import { CalendarSkeleton } from "@/components/shared/skeletons";

export default function CalendarPage() {
  const router = useRouter();
  const { state, isLoaded, loadCourses, loadTasks, loadLearningPlans } =
    useAppState();

  const courses = state.courses;
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">(
    "month",
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showEventDetails, setShowEventDetails] = useState(false);

  const [filters, setFilters] = useState<CalendarFilters>({
    tasks: true,
    assignments: true,
    quizzes: true,
    exams: true,
    completed: true,
    courses: [],
  });

  // Get all events using selector
  const allEvents = useMemo(() => selectCalendarEvents(state), [state]);
  const filteredEvents = useMemo(
    () => filterEvents(allEvents, filters),
    [allEvents, filters],
  );

  useEffect(() => {
    loadTasks();
    loadCourses();
    loadLearningPlans();
  }, [loadTasks, loadCourses, loadLearningPlans]);

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEventDetailsClose = () => {
    setShowEventDetails(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleOpenCourse = (courseId: string) => {
    handleEventDetailsClose();
    router.push(`/courses/${courseId}`);
  };

  if (!isLoaded) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">       {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] lg:sticky lg:top-20">
          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            activeDays={state.streak?.activeDays || []}
          />

          <FilterComponent
            filters={filters}
            onFiltersChange={setFilters}
            courses={courses.map((c) => ({
              id: c.id,
              title: c.title,
              code: c.code,
            }))}
          />

          <UpcomingDeadlines
            events={filteredEvents}
            onEventClick={handleEventClick}
          />

          <ColorLegend />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {viewMode === "month" && (
            <MonthView
              events={filteredEvents}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onDateClick={setSelectedDate}
              activeDays={state.streak?.activeDays || []}
            />
          )}

          {viewMode === "week" && (
            <WeekView
              events={filteredEvents}
              currentDate={selectedDate}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === "day" && (
            <DayView
              events={filteredEvents}
              currentDate={selectedDate}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === "agenda" && (
            <AgendaView
              events={filteredEvents}
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={handleEventDetailsClose}
        onOpenCourse={handleOpenCourse}
      />
    </div>
  );
}

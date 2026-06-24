"use client";

import { CalendarEvent, getEventTypeLabel } from "@/lib/calendar-utils";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  BookOpen,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCourse?: (courseId: string) => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onOpenCourse,
}: EventDetailsModalProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "upcoming":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-slate-950 rounded-lg shadow-2xl max-w-md w-full max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-800">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors z-10"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start gap-2 mb-3">
                <Badge className="text-xs shrink-0">
                  {getEventTypeLabel(event.type)}
                </Badge>
                <Badge
                  className={`text-xs shrink-0 gap-1 ${getStatusColor(event.status)}`}
                >
                  {getStatusIcon(event.status)}
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {event.title}
              </h2>
            </div>

            {/* Course Info */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Course
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {event.courseName}
                  </p>
                  {event.courseCode && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {event.courseCode}
                    </p>
                  )}
                </div>
                {(onOpenCourse || event.path) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (event.path) {
                        window.location.href = event.path;
                      } else if (onOpenCourse) {
                        onOpenCourse(event.courseId);
                      }
                    }}
                    className="gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    Open
                  </Button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.time && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {event.time}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Week Number */}
              {event.weekNumber && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Week
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Week {event.weekNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">
                  Details
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-2">
              {(onOpenCourse || event.path) && (
                <Button
                  onClick={() => {
                    if (event.path) {
                      window.location.href = event.path;
                    } else if (onOpenCourse) {
                      onOpenCourse(event.courseId);
                    }
                  }}
                  className="flex-1 gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  View Item
                </Button>
              )}
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

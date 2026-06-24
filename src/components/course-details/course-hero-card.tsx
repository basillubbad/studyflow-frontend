"use client";

import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseHeroCardProps {
  course: Course;
}

export function CourseHeroCard({ course }: CourseHeroCardProps) {
  const router = useRouter();

  // Calculate progress percentage
  const progressPercent = course.progress ?? 0;
  const currentWeek = course.currentWeek ?? 1;
  const remainingWeeks = Math.max(0, course.durationWeeks - currentWeek);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "planned":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  // Calculate circumference for progress circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Left: Course Image */}
          <div className="shrink-0 md:w-48 md:h-48">
            {course.imageUrl ? (
              <div
                className="w-full md:w-48 h-48 rounded-xl bg-cover bg-center shadow-lg border border-slate-200 dark:border-slate-700"
                style={{
                  backgroundImage: `url(${course.imageUrl})`,
                }}
              />
            ) : (
              <div className="w-full md:w-48 h-48 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/50" />
              </div>
            )}
          </div>

          {/* Center: Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4">
              {/* Title and Instructor */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-slate-600 dark:text-slate-400">
                  <span>{course.instructor}</span>
                  {course.code && <span>•</span>}
                  {course.code && (
                    <span className="font-mono text-sm">{course.code}</span>
                  )}
                  <span>•</span>
                  <span>{course.credits} Credits</span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                {/* Circular Progress */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="text-blue-600 dark:text-blue-400 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Text */}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    You&apos;re making progress!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {currentWeek} of {course.durationWeeks} weeks complete.{" "}
                    {remainingWeeks > 0 ? (
                      <>
                        {remainingWeeks} week{remainingWeeks !== 1 ? "s" : ""}{" "}
                        remaining. Keep pushing to complete your final exams.
                      </>
                    ) : (
                      "You've completed all weeks! Time to prepare for finals."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status Badges */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start gap-3 md:self-start">
            <Badge
              className={`${getStatusColor(course.status)} border-0 font-bold text-xs uppercase tracking-wide`}
            >
              {course.status}
            </Badge>
            <Badge
              variant="outline"
              className="font-semibold text-xs uppercase tracking-wide"
            >
              {course.durationWeeks} Weeks
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

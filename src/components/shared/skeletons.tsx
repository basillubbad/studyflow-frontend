import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A skeleton for page headers (Title + Subtitle)
 */
export function HeaderSkeleton() {
  return (
    <div className="space-y-2 mb-8">
      <Skeleton className="h-9 w-64 md:w-80" />
      <Skeleton className="h-5 w-48 md:w-60" />
    </div>
  );
}

/**
 * A skeleton for list items (Tasks, Reflections, etc.)
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-xl">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * A skeleton for grid cards (Courses, Plans)
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border rounded-2xl p-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A specialized skeleton for the Focus/Pomodoro page
 */
export function FocusSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="flex justify-center">
              <Skeleton className="h-64 w-64 rounded-full" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-14 w-64 rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
             <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A skeleton for the Calendar view
 */
export function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

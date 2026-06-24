import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 pt-4 md:pt-6 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Quick Stats Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl w-full" />
            <Skeleton className="h-48 rounded-xl w-full" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl w-full" />
          <Skeleton className="h-64 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

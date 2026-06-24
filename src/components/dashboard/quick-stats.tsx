import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, BookOpen, CheckCircle2 } from "lucide-react";
import { StreakCard } from "./streak-card";

interface QuickStatsProps {
  activeCourses: number;
  pendingTasks: number;
  completedCredits: number;
  milestones: number;
  streakCount: number;
  longestStreak?: number;
}

export function QuickStats({ 
  activeCourses, 
  pendingTasks, 
  completedCredits, 
  milestones,
  streakCount,
  longestStreak
}: QuickStatsProps) {
  const stats = [
    {
      title: "Active Tasks",
      subtitle: "Pending to do",
      value: pendingTasks,
      icon: ListTodo,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Current Courses",
      subtitle: "Enrolled this term",
      value: activeCourses,
      icon: BookOpen,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
    },
    {
      title: "Completed Credits",
      subtitle: "Academic progress",
      value: completedCredits,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },

  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="sm:col-span-2 lg:col-span-1">
        <StreakCard count={streakCount} longestCount={longestStreak} />
      </div>
      
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="border shadow-sm bg-card hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
             <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

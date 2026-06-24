import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatsSummary } from "@/types/tasks";
import { Layers, CheckCircle2, AlertCircle, AlertTriangle, CalendarCheck2 } from "lucide-react";

interface TasksStatsProps {
  stats: TaskStatsSummary;
}

export function TasksStats({ stats }: TasksStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tasks */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All recorded tasks</p>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {stats.completed}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Tasks fully done</p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold tracking-tight ${stats.overdue > 0 ? 'text-red-600' : 'text-foreground'}`}>
            {stats.overdue}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="flex justify-between items-end">
          <div>
             <div className={`text-3xl font-bold tracking-tight ${stats.highPriority > 0 ? 'text-orange-600' : 'text-foreground'}`}>
               {stats.highPriority}
             </div>
             <p className="text-xs text-muted-foreground mt-1">Important tasks</p>
          </div>
          
          {stats.dueToday > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-100 mb-1">
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  {stats.dueToday} due today
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

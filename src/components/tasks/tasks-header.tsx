import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
}

export function TasksHeader({ onAddTask }: TasksHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full">
      <div className="space-y-1 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="mt-1 text-muted-foreground">
          Manage absolutely everything you need to do across courses, deadlines, and personal study plans.
        </p>
      </div>
      <div className="flex w-full md:w-auto shrink-0">
        <Button onClick={onAddTask} className="w-full sm:w-auto shadow-sm" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </div>
    </div>
  );
}

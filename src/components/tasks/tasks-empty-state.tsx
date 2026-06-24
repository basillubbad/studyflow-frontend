import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TasksEmptyStateProps {
  onAddTask: () => void;
}

export function TasksEmptyState({ onAddTask }: TasksEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-2xl border-border/80 bg-card/30 hover:bg-card/60 transition-colors shadow-sm w-full mx-auto max-w-3xl">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary shadow-inner">
        <ListTodo className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">You&apos;re All Caught Up</h3>
      <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
        There are no tasks pending. Use this central hub to gather your course assignments, upcoming exams, and personal study goals all in one place.
      </p>
      <Button onClick={onAddTask} size="lg" className="gap-2 shadow-sm rounded-full px-8">
        <Plus className="h-5 w-5" />
        Add Your First Task
      </Button>
    </div>
  );
}

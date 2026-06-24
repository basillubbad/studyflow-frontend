import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReflectionsHeaderProps {
  onAddReflection: () => void;
}

export function ReflectionsHeader({ onAddReflection }: ReflectionsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-2xl border shadow-sm w-full">
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reflections</h1>
        <p className="text-muted-foreground text-lg">
          Take a moment to record your achievements, track your mood, and reflect on what you can improve.
        </p>
      </div>
      <div className="flex w-full md:w-auto shrink-0">
        <Button onClick={onAddReflection} className="w-full sm:w-auto shadow-sm" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Reflection
        </Button>
      </div>
    </div>
  );
}

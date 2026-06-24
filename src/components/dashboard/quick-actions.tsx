import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, ListTodo, Route, PenLine } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    name: "Add Task",
    icon: ListTodo,
    href: "/tasks",
    color: "bg-blue-500/10 text-blue-500",
    hoverBg: "hover:bg-blue-500/20",
  },
  {
    name: "Add Course",
    icon: BookOpen,
    href: "/courses",
    color: "bg-purple-500/10 text-purple-500",
    hoverBg: "hover:bg-purple-500/20",
  },
  {
    name: "Learning Plan",
    icon: Route,
    href: "/self-learning",
    color: "bg-emerald-500/10 text-emerald-500",
    hoverBg: "hover:bg-emerald-500/20",
  },
  {
    name: "Write Reflection",
    icon: PenLine,
    href: "/reflections",
    color: "bg-orange-500/10 text-orange-500",
    hoverBg: "hover:bg-orange-500/20",
  },
];

export function QuickActions() {
  return (
    <Card className="flex flex-col  border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 grid grid-cols-2 gap-4 pt-4">
        {actions.map((action) => (
          <Link key={action.name} href={action.href} className="outline-none">
            <div
              className={`flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 transition-colors h-full ${action.hoverBg}`}
            >
              <div className={`p-3 rounded-full mb-3 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-center">
                {action.name}
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

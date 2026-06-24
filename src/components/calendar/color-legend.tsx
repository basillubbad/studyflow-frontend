"use client";

import { Card } from "@/components/ui/card";

export function ColorLegend() {
  const legend = [
    { type: "Task", color: "bg-blue-500", description: "Study tasks" },
    { type: "Assignment", color: "bg-orange-500", description: "Assignments" },
    { type: "Quiz", color: "bg-yellow-500", description: "Quizzes" },
    {
      type: "Exam/Final",
      color: "bg-red-600",
      description: "Important exams",
    },
    {
      type: "Completed",
      color: "bg-green-500",
      description: "Completed items",
    },
    { type: "Overdue", color: "bg-red-700", description: "Overdue items" },
  ];

  return (
    <Card className="p-4 border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Legend
      </h3>
      <div className="space-y-2">
        {legend.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {item.type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

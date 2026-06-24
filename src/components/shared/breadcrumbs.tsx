"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/hooks/use-app-state";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { isLoaded, courses, selfLearningPlans } = useAppState();
  
  if (pathname === "/" || pathname === "/dashboard") return null;
  if (!isLoaded) return <div className="h-5 mb-4" />; // Placeholder while loading

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathSegments.map((segment, index) => {
        // Skip "dashboard" since we show the home icon
        if (segment === "dashboard") return null;

        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        const parentSegment = index > 0 ? pathSegments[index - 1] : null;
        
        // Default formatting: Capitalize and remove dashes
        let label = segment
          .replace(/-/g, " ")
          .replace(/^\w/, (c) => c.toUpperCase());

        // Resolve dynamic titles for IDs
        const parentAsCourse = courses.find(c => c.id === parentSegment);
        
        if (parentSegment === "courses") {
          const course = courses.find(c => c.id === segment);
          if (course) label = course.title;
        } else if (parentAsCourse) {
          // If the parent is a course ID, this segment might be an exam ID
          const ex = parentAsCourse.exams?.find(e => e.id === segment);
          if (ex) {
            label = ex.title;
          } else {
            // Check weekly plan
            for (const w of parentAsCourse.weeklyPlan ?? []) {
              const exW = w.exams.find(e => e.id === segment);
              if (exW) { label = exW.title; break; }
            }
          }
        } else if (parentSegment === "self-learning") {
          const plan = selfLearningPlans.find(p => p.id === segment);
          if (plan) label = plan.title;
        }

        return (
          <div key={href} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <Link
              href={href}
              className={cn(
                "hover:text-primary transition-colors truncate max-w-[200px]",
                isLast && "font-semibold text-foreground pointer-events-none"
              )}
            >
              {label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

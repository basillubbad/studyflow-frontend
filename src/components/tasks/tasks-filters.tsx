import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowDownUp } from "lucide-react";
import { TaskStatus, TaskPriority, TaskType } from "@/types/tasks";
import { TASK_TYPE_LABELS } from "@/lib/tasks/utils";

interface TasksFiltersProps {
  statusFilter: TaskStatus | "overdue" | "all";
  setStatusFilter: (val: TaskStatus | "overdue" | "all") => void;
  priorityFilter: TaskPriority | "all";
  setPriorityFilter: (val: TaskPriority | "all") => void;
  typeFilter: TaskType | "all";
  setTypeFilter: (val: TaskType | "all") => void;
  sortBy: "nearest-date" | "priority" | "newest" | "oldest";
  setSortBy: (val: "nearest-date" | "priority" | "newest" | "oldest") => void;
  availableTypes?: TaskType[];
}

type StatusFilter = TaskStatus | "overdue" | "all";
type PriorityFilter = TaskPriority | "all";
type TypeFilter = TaskType | "all";
type SortByOption = "nearest-date" | "priority" | "newest" | "oldest";

export function TasksFilters({
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  typeFilter, setTypeFilter,
  sortBy, setSortBy,
  availableTypes = ["general", "study-task", "assignment", "quiz", "exam", "self-learning-milestone"] // Default to all if none passed
}: TasksFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
       <div className="flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground w-full xl:w-auto shrink-0">
          <Filter className="w-4 h-4" />
          <span>Filters & Sort</span>
       </div>
       
       <div className="flex flex-wrap items-center gap-3 w-full xl:justify-end">
          {/* Status */}
          <Select value={statusFilter} onValueChange={(val: StatusFilter) => setStatusFilter(val)}>
            <SelectTrigger className="w-[120px] md:w-[130px] bg-card h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select value={priorityFilter} onValueChange={(val: PriorityFilter) => setPriorityFilter(val)}>
            <SelectTrigger className="w-[120px] md:w-[130px] bg-card h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Type */}
          <Select value={typeFilter} onValueChange={(val: TypeFilter) => setTypeFilter(val)}>
            <SelectTrigger className="w-[150px] md:w-[170px] bg-card h-9">
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {availableTypes.map((t) => (
                  <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Divider */}
          <div className="w-px h-6 bg-border mx-1 hidden md:block"></div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(val: SortByOption) => setSortBy(val)}>
            <SelectTrigger className="w-[150px] md:w-[160px] bg-card h-9 border-primary/20 hover:border-primary/40 focus:ring-primary/20">
              <div className="flex items-center gap-2">
                 <ArrowDownUp className="w-3.5 h-3.5 text-primary" />
                 <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest-date">Nearest Deadline</SelectItem>
              <SelectItem value="priority">Highest Priority</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

       </div>
    </div>
  );
}

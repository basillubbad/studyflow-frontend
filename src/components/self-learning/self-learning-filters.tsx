"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PlanStatus } from "@/types/self-learning";

interface FiltersProps {
  statusFilter: PlanStatus | "all";
  setStatusFilter: (v: PlanStatus | "all") => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  sortBy: "newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end";
  setSortBy: (v: "newest" | "oldest" | "most-progress" | "least-progress" | "nearest-end") => void;
  categories: string[];
}

export function SelfLearningFilters({
  statusFilter, setStatusFilter, categoryFilter, setCategoryFilter,
  search, setSearch, sortBy, setSortBy, categories
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 h-10 rounded-xl"
          placeholder="Search plans..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={(v: PlanStatus | "all") => setStatusFilter(v)}>
        <SelectTrigger className="h-10 w-[140px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 w-[150px] rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
        <SelectTrigger className="h-10 w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="most-progress">Most Progress</SelectItem>
          <SelectItem value="least-progress">Least Progress</SelectItem>
          <SelectItem value="nearest-end">Nearest End Date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

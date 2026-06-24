"use client";

import { useState, useMemo, useEffect } from "react";
import { TaskItem, TaskStatus, TaskPriority, TaskType } from "@/types/tasks";
import { filterTasks, sortTasks, getTaskStats } from "@/lib/tasks/utils";
import { useAppState } from "@/hooks/use-app-state";
import { selectUnifiedTasks } from "@/lib/store/app-selectors";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TasksStats } from "@/components/tasks/tasks-stats";
import { TasksFilters } from "@/components/tasks/tasks-filters";
import { TasksTable } from "@/components/tasks/tasks-table";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TasksEmptyState } from "@/components/tasks/tasks-empty-state";
import { HeaderSkeleton, ListSkeleton } from "@/components/shared/skeletons";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";

export default function TasksClient() {
  const { state, isLoaded, saveUnifiedTask, deleteUnifiedTask, loadTasks, loadCourses, loadLearningPlans } = useAppState();

  useEffect(() => { loadTasks(); loadCourses(); loadLearningPlans(); }, [loadTasks, loadCourses, loadLearningPlans]);
  const tasks = useMemo(() => selectUnifiedTasks(state), [state]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<
    TaskStatus | "overdue" | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [sortBy, setSortBy] = useState<
    "nearest-date" | "priority" | "newest" | "oldest"
  >("nearest-date");

  // Derived data
  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const displayedTasks = useMemo(() => {
    const filtered = filterTasks(
      tasks,
      statusFilter,
      priorityFilter,
      typeFilter,
    );
    return sortTasks(filtered, sortBy);
  }, [tasks, statusFilter, priorityFilter, typeFilter, sortBy]);

  // Handlers
  const handleAddClick = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEditClick = (task: TaskItem) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = (task: TaskItem) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteUnifiedTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      // When marking as done, save the current status to restore later
      if (newStatus === "done" && task.status !== "done") {
        updatedTask.previousStatus = task.status;
      } else {
        // Clear previousStatus when moving away from done or changing status normally
        updatedTask.previousStatus = undefined;
      }

      saveUnifiedTask(updatedTask);
    }
  };

  const handleSaveTask = (task: TaskItem) => {
    saveUnifiedTask(task);
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <ListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">
      <TasksHeader onAddTask={handleAddClick} />

      {tasks.length > 0 && <TasksStats stats={stats} />}

      <section className="space-y-5">
        {tasks.length > 0 && (
          <TasksFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}

        {tasks.length === 0 ? (
          <TasksEmptyState onAddTask={handleAddClick} />
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl border-border/60 text-muted-foreground bg-muted/20">
            <p>No tasks match your current filters.</p>
            <button
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setTypeFilter("all");
              }}
              className="mt-2 text-primary font-medium hover:underline text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <TasksTable
            tasks={displayedTasks}
            onEdit={handleEditClick}
            onDelete={(id) => {
              const task = tasks.find((t) => t.id === id);
              if (task) handleDelete(task);
            }}
            onStatusChange={handleStatusChange}
          />
        )}
      </section>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveTask}
        initialData={editingTask}
      />

      <ConfirmActionDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}

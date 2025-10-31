import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import type { DailyTask } from "@/types";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  GripVertical,
  Pencil,
  Trash,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, Project, TaskStatus } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cn, getPriorityColor } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  dailyTasks?: DailyTask[];
  onAddTask: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: Id<"tasks">) => void;
  onUpdateTaskStatus: (taskId: Id<"tasks">, status: TaskStatus) => void;
  onScheduleTask: (task: Task) => void;
  onViewChange?: (view: string) => void;
  isLoading?: boolean;
}

interface TaskCardProps {
  task: Task;
  project?: Project;
  isScheduled?: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
  onUpdateStatus: (newStatus: TaskStatus) => void;
  isDragging?: boolean;
}

function TaskCard({
  task,
  project,
  isScheduled = false,
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onUpdateStatus,
  isDragging = false,
}: TaskCardProps) {
  const [updatingElement, setUpdatingElement] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const handleStatusUpdate = async (
    newStatus: TaskStatus,
    element: "prev" | "next" | "toggle",
  ) => {
    setUpdatingElement(element);
    try {
      await onUpdateStatus(newStatus);
    } finally {
      setTimeout(() => setUpdatingElement(null), 300);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate if task is overdue based on default thresholds
  const DEFAULT_THRESHOLDS = { high: 1, medium: 3, low: 7 };
  const threshold = DEFAULT_THRESHOLDS[task.priority];
  const now = Date.now();
  const daysOpen = (now - task._creationTime) / (1000 * 60 * 60 * 24);
  const isOverdue = task.status !== "done" && daysOpen > threshold;
  const isAtRisk =
    task.status !== "done" && daysOpen > threshold * 0.8 && !isOverdue;

  const getNextStatus = (
    currentStatus: Task["status"],
  ): Task["status"] | null => {
    switch (currentStatus) {
      case "todo":
        return "in-progress";
      case "in-progress":
        return "review";
      case "review":
        return "done";
      case "done":
        return null;
      default:
        return null;
    }
  };

  const getPrevStatus = (
    currentStatus: Task["status"],
  ): Task["status"] | null => {
    switch (currentStatus) {
      case "todo":
        return null;
      case "in-progress":
        return "todo";
      case "review":
        return "in-progress";
      case "done":
        return "review";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-gradient-to-br from-primary/10 to-primary/5 border rounded-lg py-4 px-1 transition-all duration-200",
        "hover:shadow-md hover:shadow-primary/5",
        (isDragging || isSortableDragging) && "opacity-50",
        !isDragging && "animate-in fade-in-0 slide-in-from-bottom-2",
        isOverdue &&
          "border-destructive/70 border-2 bg-gradient-to-br from-destructive/15 to-destructive/5",
        isAtRisk &&
          !isOverdue &&
          "border-warning/70 bg-gradient-to-br from-warning/10 to-warning/5",
        !isOverdue && !isAtRisk && "border-border/50 hover:border-primary/50",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          disabled={updatingElement !== null}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => {
            const newStatus = task.status === "done" ? "todo" : "done";
            handleStatusUpdate(newStatus, "toggle");
          }}
          className="mt-1 transition-transform hover:scale-110 shrink-0"
          disabled={updatingElement !== null}
        >
          {updatingElement === "toggle" ? (
            <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-medium text-sm mb-2 leading-snug cursor-pointer hover:text-primary transition-colors",
              task.status === "done" && "line-through text-muted-foreground",
            )}
            onClick={onView}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {project && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border/30">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-xs font-medium">{project.name}</span>
              </div>
            )}
            <Badge
              variant="outline"
              className={cn(
                "text-xs capitalize font-medium",
                getPriorityColor(task.priority),
              )}
            >
              {task.priority}
            </Badge>
            {task.type && task.type !== "general" && (
              <Badge
                variant="secondary"
                className="text-xs capitalize font-medium"
              >
                {task.type}
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="text-xs font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue {Math.floor(daysOpen)}d
              </Badge>
            )}
            {isAtRisk && !isOverdue && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-warning text-warning"
              >
                At Risk
              </Badge>
            )}
            {isScheduled && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-none text-primary ml-auto"
                title="Task is scheduled"
              >
                <Clock className="h-5 w-5" />
              </Badge>
            )}
          </div>
        </div>

        {/* Quick status change arrows and menu */}
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {prevStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(prevStatus, "prev");
              }}
              disabled={updatingElement !== null}
              title={`Move to ${prevStatus}`}
            >
              {updatingElement === "prev" ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
          {nextStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(nextStatus, "next");
              }}
              disabled={updatingElement !== null}
              title={`Move to ${nextStatus}`}
            >
              {updatingElement === "next" ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark dark">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSchedule}>
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-lg p-4 animate-in fade-in-0 slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full mt-1 shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({
  status,
  tasks,
  projects,
  dailyTasks = [],
  onView,
  onEdit,
  onDelete,
  onSchedule,
  onUpdateTaskStatus,
  onSortChange,
  onFilterPriorityChange,
  onFilterTypeChange,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: {
  status: TaskStatus;
  tasks: Task[];
  projects: Project[];
  dailyTasks?: DailyTask[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: Id<"tasks">) => void;
  onSchedule: (task: Task) => void;
  onUpdateTaskStatus: (taskId: Id<"tasks">, status: TaskStatus) => void;
  sortOrder: "newest" | "oldest";
  onSortChange: (order: "newest" | "oldest") => void;
  filterPriority: string | null;
  onFilterPriorityChange: (priority: string | null) => void;
  filterType: string | null;
  onFilterTypeChange: (type: string | null) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const getProject = (projectId?: string) =>
    projects.find((p) => p._id === projectId);

  const isTaskScheduled = (taskId: string) =>
    dailyTasks.some((dt) => dt.taskId === taskId);

  const statusConfig = {
    todo: { label: "To Do", color: "bg-blue-500", icon: Circle },
    "in-progress": {
      label: "Progress",
      color: "bg-yellow-500",
      icon: Clock,
    },
    review: {
      label: "Review",
      color: "bg-orange-500",
      icon: Check,
    },
    done: { label: "Done", color: "bg-green-500", icon: CheckCircle2 },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-1 pb-4 sticky top-0 z-10">
        <h3 className="font-semibold text-base">{config.label}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
        <div className="ml-auto flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", "text-primary")}
                title="Filter by priority"
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterPriorityChange(null)}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterPriorityChange("high")}>
                High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterPriorityChange("medium")}
              >
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterPriorityChange("low")}>
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7 font-bold", "text-primary")}
                title="Filter by type"
              >
                T
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterTypeChange(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterTypeChange("general")}>
                General
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterTypeChange("bug")}>
                Bug
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterTypeChange("feature")}>
                Feature
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Sort column"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("oldest")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3 min-h-[200px]">
          {isLoading ? (
            <>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </>
          ) : tasks.length === 0 ? (
            <div className="bg-card/30 border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <Icon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop tasks here</p>
            </div>
          ) : (
            <>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  project={getProject(task.projectId)}
                  isScheduled={isTaskScheduled(task._id)}
                  onView={() => onView(task)}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task._id)}
                  onSchedule={() => onSchedule(task)}
                  onUpdateStatus={(newStatus) => {
                    const fullTask = tasks.find((t) => t._id === task._id);
                    if (fullTask) {
                      onUpdateTaskStatus(fullTask._id, newStatus);
                    }
                  }}
                />
              ))}
              {hasMore && onLoadMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  className="w-full mt-2 text-muted-foreground hover:text-foreground"
                >
                  View More
                </Button>
              )}
            </>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskList({
  tasks,
  projects,
  dailyTasks = [],
  onAddTask,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onScheduleTask,
  onViewChange,
  isLoading = false,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [doneTasksLimit, setDoneTasksLimit] = useState(5);
  const [columnSortBy, setColumnSortBy] = useState<{
    todo: "newest" | "oldest";
    "in-progress": "newest" | "oldest";
    review: "newest" | "oldest";
    done: "newest" | "oldest";
  }>({
    todo: "newest",
    "in-progress": "newest",
    review: "newest",
    done: "newest",
  });
  const [columnFilterPriority, setColumnFilterPriority] = useState<{
    todo: string | null;
    "in-progress": string | null;
    review: string | null;
    done: string | null;
  }>({
    todo: null,
    "in-progress": null,
    review: null,
    done: null,
  });

  const [columnFilterType, setColumnFilterType] = useState<{
    todo: string | null;
    "in-progress": string | null;
    review: string | null;
    done: string | null;
  }>({
    todo: null,
    "in-progress": null,
    review: null,
    done: null,
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject =
      !filterProject ||
      (filterProject === "none"
        ? !task.projectId
        : task.projectId === filterProject);
    return matchesSearch && matchesProject;
  });

  const filterAndSortTasks = (
    tasks: Task[],
    sortOrder: "newest" | "oldest",
    priority: string | null,
    type: string | null,
  ): Task[] => {
    let filtered = tasks;

    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    // Filter by type (treat empty/undefined as "general")
    if (type) {
      filtered = filtered.filter((t) => (t.type || "general") === type);
    }

    return [...filtered].sort((a, b) => {
      if (sortOrder === "newest") {
        return b._creationTime - a._creationTime;
      } else {
        return a._creationTime - b._creationTime;
      }
    });
  };

  const allDoneTasks = filterAndSortTasks(
    filteredTasks.filter((t) => t.status === "done"),
    columnSortBy.done,
    columnFilterPriority.done,
    columnFilterType.done,
  );

  const groupedTasks = {
    todo: filterAndSortTasks(
      filteredTasks.filter((t) => t.status === "todo"),
      columnSortBy.todo,
      columnFilterPriority.todo,
      columnFilterType.todo,
    ),
    "in-progress": filterAndSortTasks(
      filteredTasks.filter((t) => t.status === "in-progress"),
      columnSortBy["in-progress"],
      columnFilterPriority["in-progress"],
      columnFilterType["in-progress"],
    ),
    review: filterAndSortTasks(
      filteredTasks.filter((t) => t.status === "review"),
      columnSortBy.review,
      columnFilterPriority.review,
      columnFilterType.review,
    ),
    done: allDoneTasks.slice(0, doneTasksLimit),
  };

  const hasMoreDoneTasks = allDoneTasks.length > doneTasksLimit;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const overTask = tasks.find((t) => t._id === over.id);

    if (!activeTask) return;

    // If hovering over another task, get that task's status
    if (overTask && activeTask.status !== overTask.status) {
      onUpdateTaskStatus(activeTask._id, overTask.status);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const overTask = tasks.find((t) => t._id === over.id);

    if (!activeTask) return;

    // If dropped on another task, adopt that task's status
    if (overTask && activeTask.status !== overTask.status) {
      onUpdateTaskStatus(activeTask._id, overTask.status);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;
  const activeProject = activeTask?.projectId
    ? projects.find((p) => p._id === activeTask.projectId)
    : undefined;

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tasks
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {completedTasks} of {totalTasks} tasks completed (
                {completionPercentage}%)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onAddTask}
                size="lg"
                className="h-10 md:h-11 shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 md:h-11 bg-card border-border/50"
              />
            </div>

            <div className="w-full sm:w-2/3">
              {totalTasks > 0 && (
                <div className="relative overflow-hidden border border-blue-500/30 rounded-md shadow-sm shadow-blue-500/20">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 transition-all duration-700 ease-out"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />

                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-transparent"
                    style={{
                      left: `${completionPercentage}%`,
                    }}
                  />

                  <div className="relative px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        Overall Progress
                      </span>
                      <span className="text-xs text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {completedTasks} of {totalTasks} tasks
                      </span>
                    </div>
                    <span className="text-lg font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterProject === null ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setFilterProject(null);
                if (onViewChange) onViewChange("all");
              }}
            >
              All
            </Button>
            <Button
              variant={filterProject === "none" ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-full"
              onClick={() => {
                setFilterProject("none");
                if (onViewChange) onViewChange("all");
              }}
            >
              No Project
            </Button>
            {projects
              .map((project) => ({
                project,
                taskCount: tasks.filter((t) => t.projectId === project._id)
                  .length,
                // Only include tasks not done, scoped to this project
                typeOP: tasks.filter(
                  (t) => t.projectId === project._id && t.status !== "done",
                ),
              }))
              // Only keep projects that have at least one non-done task
              .filter(({ typeOP }) => typeOP.length > 0)
              // Optionally, you can still sort by total tasks if you want
              .sort((a, b) => b.taskCount - a.taskCount)
              .map(({ project }) => (
                <Button
                  key={project._id}
                  variant={
                    filterProject === project._id ? "default" : "outline"
                  }
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => {
                    setFilterProject(project._id);
                    if (onViewChange) onViewChange("all");
                  }}
                >
                  {project.name}
                </Button>
              ))}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {(["todo", "in-progress", "review", "done"] as const).map(
              (status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  tasks={groupedTasks[status]}
                  projects={projects}
                  dailyTasks={dailyTasks}
                  onView={onViewTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onSchedule={onScheduleTask}
                  onUpdateTaskStatus={onUpdateTaskStatus}
                  sortOrder={columnSortBy[status]}
                  onSortChange={(order) =>
                    setColumnSortBy((prev) => ({ ...prev, [status]: order }))
                  }
                  filterPriority={columnFilterPriority[status]}
                  onFilterPriorityChange={(priority) =>
                    setColumnFilterPriority((prev) => ({
                      ...prev,
                      [status]: priority,
                    }))
                  }
                  filterType={columnFilterType[status]}
                  onFilterTypeChange={(type) =>
                    setColumnFilterType((prev) => ({
                      ...prev,
                      [status]: type,
                    }))
                  }
                  isLoading={isLoading}
                  hasMore={status === "done" ? hasMoreDoneTasks : false}
                  onLoadMore={
                    status === "done"
                      ? () => setDoneTasksLimit((prev) => prev + 5)
                      : undefined
                  }
                />
              ),
            )}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  project={activeProject}
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onSchedule={() => {}}
                  onUpdateStatus={() => {}}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

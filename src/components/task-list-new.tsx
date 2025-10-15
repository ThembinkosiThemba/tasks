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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: Id<"tasks">) => void;
  onUpdateTaskStatus: (taskId: Id<"tasks">, status: "todo" | "in-progress" | "done") => void;
  onScheduleTask: (task: Task) => void;
}

interface TaskCardProps {
  task: Task;
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
  onToggleStatus: () => void;
  isDragging?: boolean;
}

function TaskCard({
  task,
  project,
  onEdit,
  onDelete,
  onSchedule,
  onToggleStatus,
  isDragging = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card border border-border/50 rounded-lg p-4 transition-all duration-200",
        "hover:border-primary/50 hover:shadow-md hover:shadow-primary/5",
        (isDragging || isSortableDragging) && "opacity-50",
        !isDragging && "animate-in fade-in-0 slide-in-from-bottom-2"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={onToggleStatus}
          className="mt-1 transition-transform hover:scale-110 shrink-0"
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-medium text-sm mb-2 leading-snug cursor-pointer hover:text-primary transition-colors",
              task.status === "done" && "line-through text-muted-foreground"
            )}
            onClick={onEdit}
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
              className={cn("text-xs capitalize font-medium", getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit task</DropdownMenuItem>
            <DropdownMenuItem onClick={onSchedule}>
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function DroppableColumn({
  status,
  tasks,
  projects,
  onEdit,
  onDelete,
  onSchedule,
  onToggleStatus,
}: {
  status: "todo" | "in-progress" | "done";
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: Id<"tasks">) => void;
  onSchedule: (task: Task) => void;
  onToggleStatus: (taskId: Id<"tasks">) => void;
}) {
  const getProject = (projectId?: string) => projects.find((p) => p._id === projectId);

  const statusConfig = {
    todo: { label: "To Do", color: "bg-blue-500", icon: Circle },
    "in-progress": { label: "In Progress", color: "bg-yellow-500", icon: Clock },
    done: { label: "Done", color: "bg-green-500", icon: CheckCircle2 },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-1 pb-4 sticky top-0 bg-background z-10">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        <h3 className="font-semibold text-base">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {tasks.length}
        </Badge>
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-[200px]">
          {tasks.length === 0 ? (
            <div className="bg-card/30 border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <Icon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop tasks here</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                project={getProject(task.projectId)}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task._id)}
                onSchedule={() => onSchedule(task)}
                onToggleStatus={() => onToggleStatus(task._id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskList({
  tasks,
  projects,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onScheduleTask,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const groupedTasks = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    "in-progress": filteredTasks.filter((t) => t.status === "in-progress"),
    done: filteredTasks.filter((t) => t.status === "done"),
  };

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
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {completedTasks} of {totalTasks} tasks completed ({completionPercentage}%)
              </p>
            </div>
            <Button
              onClick={onAddTask}
              size="lg"
              className="h-10 md:h-11 shadow-lg shadow-primary/20 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </Button>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 md:h-11 bg-card border-border/50">
                  <Filter className="mr-2 h-4 w-4" />
                  {filterPriority ? `Priority: ${filterPriority}` : "All Priorities"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                  High Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                  Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                  Low Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {totalTasks > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {(["todo", "in-progress", "done"] as const).map((status) => (
              <DroppableColumn
                key={status}
                status={status}
                tasks={groupedTasks[status]}
                projects={projects}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onSchedule={onScheduleTask}
                onToggleStatus={(taskId) => {
                  const task = tasks.find((t) => t._id === taskId);
                  if (!task) return;
                  const newStatus = task.status === "done" ? "todo" : "done";
                  onUpdateTaskStatus(taskId, newStatus);
                }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  project={activeProject}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onSchedule={() => {}}
                  onToggleStatus={() => {}}
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

import {
  Plus,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
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
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: Id<"tasks">) => void;
  onToggleStatus: (taskId: Id<"tasks">) => void;
  onScheduleTask: (task: Task) => void;
}

export function TaskList({
  tasks,
  projects,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onScheduleTask,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const getProject = (projectId?: string) =>
    projects.find((p) => p._id === projectId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10";
      case "low":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
              <p className="text-muted-foreground mt-1">
                {completedTasks} of {totalTasks} tasks completed (
                {completionPercentage}%)
              </p>
            </div>
            <Button
              onClick={onAddTask}
              size="lg"
              className="h-11 shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 bg-card border-border/50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {filterPriority
                    ? `Priority: ${filterPriority}`
                    : "All Priorities"}
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

          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    status === "todo" && "bg-blue-500",
                    status === "in-progress" && "bg-yellow-500",
                    status === "done" && "bg-primary",
                  )}
                />
                <h3 className="font-semibold text-lg capitalize">
                  {status.replace("-", " ")}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {statusTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {statusTasks.length === 0 ? (
                  <div className="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                ) : (
                  statusTasks.map((task) => {
                    const project = getProject(task.projectId);
                    return (
                      <div
                        key={task._id}
                        className="group bg-card border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-slide-in"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleStatus(task._id)}
                            className="mt-0.5 transition-transform hover:scale-110"
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
                                "font-medium text-sm mb-2 leading-snug",
                                task.status === "done" &&
                                  "line-through text-muted-foreground",
                              )}
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
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  <span className="text-xs font-medium">
                                    {project.name}
                                  </span>
                                </div>
                              )}
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs capitalize font-medium",
                                  getPriorityColor(task.priority),
                                )}
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
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onEditTask(task)}
                              >
                                Edit task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onScheduleTask(task)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteTask(task._id)}
                                className="text-destructive"
                              >
                                Delete task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

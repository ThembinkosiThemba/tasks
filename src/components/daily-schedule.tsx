import { useState } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  MoreHorizontal,
  ArrowRight,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, DailyTask, Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface DailyScheduleProps {
  tasks: Task[];
  dailyTasks: DailyTask[];
  projects: Project[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddSchedule: () => void;
  onToggleComplete: (dailyTaskId: Id<"dailyTasks">) => void;
  onUpdateDailyTask: (
    dailyTaskId: Id<"dailyTasks">,
    date: string,
    startTime?: string,
    endTime?: string,
    completed?: boolean,
  ) => void;
  onRemoveDailyTask: (dailyTaskId: Id<"dailyTasks">) => void;
  onUpdateTaskStatus: (taskId: Id<"tasks">, status: Task["status"]) => void;
}

export function DailySchedule({
  tasks,
  dailyTasks,
  projects,
  selectedDate,
  onDateChange,
  onAddSchedule,
  onToggleComplete,
  onUpdateDailyTask,
  onRemoveDailyTask,
  onUpdateTaskStatus,
}: DailyScheduleProps) {
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [clickedArrow, setClickedArrow] = useState<string | null>(null);

  const moveToTomorrow = (dailyTask: DailyTask) => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];
    onUpdateDailyTask(
      dailyTask._id,
      tomorrowDate,
      dailyTask.startTime,
      dailyTask.endTime,
      dailyTask.completed,
    );
  };

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

  const handleStatusUpdate = async (
    taskId: Id<"tasks">,
    newStatus: Task["status"],
    direction: "prev" | "next",
  ) => {
    const arrowId = `${taskId}-${direction}`;
    setUpdatingTaskId(taskId);
    setClickedArrow(arrowId);
    try {
      await onUpdateTaskStatus(taskId, newStatus);
    } finally {
      setTimeout(() => {
        setUpdatingTaskId(null);
        setClickedArrow(null);
      }, 300);
    }
  };

  const getStatusConfig = (status: Task["status"]) => {
    const configs = {
      todo: { label: "To Do", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
      "in-progress": { label: "In Progress", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
      review: { label: "Review", color: "bg-orange-500/10 text-orange-500 border-orange-500/30" },
      done: { label: "Done", color: "bg-green-500/10 text-green-500 border-green-500/30" },
    };
    return configs[status];
  };

  const getTask = (taskId: string) => tasks.find((t) => t._id === taskId);
  const getProject = (projectId?: string) =>
    projects.find((p) => p._id === projectId);

  const todaySchedule = dailyTasks
    .sort((a, b) => Number(a.completed) - Number(b.completed))
    .filter((dt) => dt.date === selectedDate)
    .filter((dt) => {
      if (!filterProject) return true;
      const task = getTask(dt.taskId);
      if (!task) return false;
      if (filterProject === "none") return !task.projectId;
      return task.projectId === filterProject;
    });

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const completedCount = todaySchedule.filter((dt) => dt.completed).length;
  const totalCount = todaySchedule.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Daily Schedule
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Plan and track your daily tasks
              </p>
            </div>
            <Button
              onClick={onAddSchedule}
              size="lg"
              className="h-10 md:h-11 shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Task
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Date Selector - More Compact */}
            <div className="flex items-center gap-2 bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/30 rounded-lg px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeDate(-1)}
                className="h-7 w-7 shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="flex items-center gap-2 min-w-0">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="text-[10px] text-muted-foreground bg-transparent border-none p-0 cursor-pointer hover:text-primary transition-colors"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeDate(1)}
                className="h-7 w-7 shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>

              {!isToday && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="h-7 text-xs ml-2"
                >
                  Today
                </Button>
              )}
            </div>

            {/* Daily Stats - More Compact */}
            <div className="flex items-center gap-4 bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/30 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">
                    {completedCount}
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-sm font-semibold">{totalCount}</span>
                </div>
              </div>

              {totalCount > 0 && (
                <>
                  <div className="h-6 w-px bg-border/50" />
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 h-1.5 bg-background/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {completionPercentage}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Project Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterProject === null ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setFilterProject(null)}
            >
              All
            </Button>
            <Button
              variant={filterProject === "none" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setFilterProject("none")}
            >
              No Project
            </Button>
            {projects
              .map((project) => ({
                project,
                taskCount: dailyTasks
                  .filter((dt) => dt.date === selectedDate)
                  .filter((dt) => {
                    const task = getTask(dt.taskId);
                    return task?.projectId === project._id;
                  }).length,
              }))
              .filter(({ taskCount }) => taskCount > 0)
              .sort((a, b) => b.taskCount - a.taskCount)
              .map(({ project }) => (
                <Button
                  key={project._id}
                  variant={
                    filterProject === project._id ? "default" : "outline"
                  }
                  size="sm"
                  className="h-7 rounded-full text-xs"
                  onClick={() => setFilterProject(project._id)}
                >
                  {project.name}
                </Button>
              ))}
          </div>
        </div>

        <div className="space-y-6">
          {todaySchedule.length === 0 ? (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-dashed border-border rounded-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks scheduled</h3>
              <p className="text-muted-foreground mb-6">
                Start planning your day by scheduling tasks
              </p>
              <Button
                onClick={onAddSchedule}
                variant="outline"
                className="bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule your first task
              </Button>
            </div>
          ) : (
            <>
              {/* Time-blocked tasks */}
              {todaySchedule.filter((dt) => dt.startTime && dt.endTime).length >
                0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground px-1">
                    Time Blocked
                  </h3>
                  {todaySchedule
                    .filter((dt) => dt.startTime && dt.endTime)
                    .sort((a, b) =>
                      (a.startTime || "").localeCompare(b.startTime || ""),
                    )
                    .map((dailyTask, index) => {
                      const task = getTask(dailyTask.taskId);
                      if (!task) return null;

                      const project = getProject(task.projectId);

                      return (
                        <div
                          key={dailyTask._id}
                          className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-slide-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="flex flex-col items-center gap-1 min-w-[70px] md:min-w-[80px] shrink-0">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs px-2 py-1 bg-primary/5 border-primary/20"
                              >
                                {dailyTask.startTime}
                              </Badge>
                              <div className="h-4 md:h-6 w-px bg-border" />
                              <Badge
                                variant="outline"
                                className="font-mono text-xs px-2 py-1 bg-muted"
                              >
                                {dailyTask.endTime}
                              </Badge>
                            </div>

                            <button
                              onClick={() => onToggleComplete(dailyTask._id)}
                              className="mt-1 md:mt-2 transition-transform hover:scale-110 shrink-0"
                            >
                              {dailyTask.completed ? (
                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0 pt-0 md:pt-1">
                              <h4
                                className={cn(
                                  "font-semibold text-sm md:text-base mb-2 leading-snug",
                                  dailyTask.completed &&
                                    "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs md:text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 flex-wrap">
                                {project && (
                                  <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-background/50 border border-border/30">
                                    <div
                                      className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-card"
                                      style={{
                                        backgroundColor: project.color,
                                        boxShadow: `0 0 0 2px ${project.color}40`,
                                      }}
                                    />
                                    <span className="text-xs font-medium truncate max-w-[120px]">
                                      {project.name}
                                    </span>
                                  </div>
                                )}
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {task.priority}
                                </Badge>

                                {/* Status Navigation */}
                                <div className="flex items-center gap-1 ml-auto">
                                  {getPrevStatus(task.status) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          task._id,
                                          getPrevStatus(task.status)!,
                                          "prev",
                                        )
                                      }
                                      disabled={updatingTaskId === task._id}
                                      title={`Move to ${getPrevStatus(task.status)}`}
                                    >
                                      {updatingTaskId === task._id &&
                                      clickedArrow === `${task._id}-prev` ? (
                                        <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                      ) : (
                                        <ChevronLeft
                                          className={cn(
                                            "h-3.5 w-3.5 transition-transform",
                                            clickedArrow === `${task._id}-prev` &&
                                              "rotate-[-360deg]",
                                          )}
                                        />
                                      )}
                                    </Button>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs font-medium capitalize px-2 py-0.5",
                                      getStatusConfig(task.status).color,
                                    )}
                                  >
                                    {getStatusConfig(task.status).label}
                                  </Badge>
                                  {getNextStatus(task.status) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          task._id,
                                          getNextStatus(task.status)!,
                                          "next",
                                        )
                                      }
                                      disabled={updatingTaskId === task._id}
                                      title={`Move to ${getNextStatus(task.status)}`}
                                    >
                                      {updatingTaskId === task._id &&
                                      clickedArrow === `${task._id}-next` ? (
                                        <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                      ) : (
                                        <ChevronRight
                                          className={cn(
                                            "h-3.5 w-3.5 transition-transform",
                                            clickedArrow === `${task._id}-next` &&
                                              "rotate-[360deg]",
                                          )}
                                        />
                                      )}
                                    </Button>
                                  )}
                                </div>
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
                              <DropdownMenuContent
                                align="end"
                                className="bg-dark dark"
                              >
                                <DropdownMenuItem
                                  onClick={() => moveToTomorrow(dailyTask)}
                                >
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Move to Tomorrow
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRemoveDailyTask(dailyTask._id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Remove from Schedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Non-time-blocked tasks */}
              {todaySchedule.filter((dt) => !dt.startTime || !dt.endTime)
                .length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground px-1">
                    To Do Today
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {todaySchedule
                      .filter((dt) => !dt.startTime || !dt.endTime)
                      .map((dailyTask) => {
                        const task = getTask(dailyTask.taskId);
                        if (!task) return null;

                        const project = getProject(task.projectId);

                        return (
                          <div
                            key={dailyTask._id}
                            className="group bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/30 rounded-lg p-3 md:p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => onToggleComplete(dailyTask._id)}
                                className="mt-0.5 transition-transform hover:scale-110 shrink-0"
                              >
                                {dailyTask.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <h4
                                  className={cn(
                                    "font-medium text-sm mb-1.5 leading-snug",
                                    dailyTask.completed &&
                                      "line-through text-muted-foreground",
                                  )}
                                >
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-1">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {project && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50 border border-border/20">
                                      <div
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                          backgroundColor: project.color,
                                        }}
                                      />
                                      <span className="text-[10px] font-medium truncate max-w-[80px]">
                                        {project.name}
                                      </span>
                                    </div>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-4 px-1.5 capitalize"
                                  >
                                    {task.priority}
                                  </Badge>

                                  {/* Status Navigation */}
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    {getPrevStatus(task.status) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            task._id,
                                            getPrevStatus(task.status)!,
                                            "prev",
                                          )
                                        }
                                        disabled={updatingTaskId === task._id}
                                        title={`Move to ${getPrevStatus(task.status)}`}
                                      >
                                        {updatingTaskId === task._id &&
                                        clickedArrow === `${task._id}-prev` ? (
                                          <div className="h-2.5 w-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                        ) : (
                                          <ChevronLeft
                                            className={cn(
                                              "h-3 w-3 transition-transform",
                                              clickedArrow === `${task._id}-prev` &&
                                                "rotate-[-360deg]",
                                            )}
                                          />
                                        )}
                                      </Button>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] font-medium capitalize px-1.5 h-4",
                                        getStatusConfig(task.status).color,
                                      )}
                                    >
                                      {getStatusConfig(task.status).label}
                                    </Badge>
                                    {getNextStatus(task.status) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            task._id,
                                            getNextStatus(task.status)!,
                                            "next",
                                          )
                                        }
                                        disabled={updatingTaskId === task._id}
                                        title={`Move to ${getNextStatus(task.status)}`}
                                      >
                                        {updatingTaskId === task._id &&
                                        clickedArrow === `${task._id}-next` ? (
                                          <div className="h-2.5 w-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                        ) : (
                                          <ChevronRight
                                            className={cn(
                                              "h-3 w-3 transition-transform",
                                              clickedArrow === `${task._id}-next` &&
                                                "rotate-[360deg]",
                                            )}
                                          />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-dark dark"
                                >
                                  <DropdownMenuItem
                                    onClick={() => moveToTomorrow(dailyTask)}
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Move to Tomorrow
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onRemoveDailyTask(dailyTask._id)
                                    }
                                    className="text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Remove from Schedule
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

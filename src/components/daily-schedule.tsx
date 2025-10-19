import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

export function DailySchedule({
  tasks,
  dailyTasks,
  projects,
  selectedDate,
  onDateChange,
  onAddSchedule,
  onToggleComplete,
}: DailyScheduleProps) {
  const todaySchedule = dailyTasks.filter((dt) => dt.date === selectedDate);

  const getTask = (taskId: string) => tasks.find((t) => t._id === taskId);
  const getProject = (projectId?: string) =>
    projects.find((p) => p._id === projectId);

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

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-xl p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeDate(-1)}
                  className="h-9 w-9 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex-1 text-center min-w-0">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                    <h3 className="text-lg md:text-2xl font-bold truncate">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-background border border-border/50 rounded-lg text-xs md:text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeDate(1)}
                  className="h-9 w-9 shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {!isToday && (
                <Button
                  variant="outline"
                  onClick={goToToday}
                  className="w-full bg-transparent text-xs md:text-sm"
                >
                  Jump to Today
                </Button>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" />
                <h4 className="font-semibold">Daily Stats</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Tasks
                  </span>
                  <span className="text-2xl font-bold">{totalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {completedCount}
                  </span>
                </div>
              </div>

              {totalCount > 0 && (
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Progress
                    </span>
                    <span className="text-sm font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
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
                          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-xl p-4 md:p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-slide-in"
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
                              </div>
                            </div>
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
                            className="bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/30 rounded-lg p-3 md:p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
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
                                </div>
                              </div>
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

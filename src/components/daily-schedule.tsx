import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
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
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Daily Schedule
              </h2>
              <p className="text-muted-foreground mt-1">
                Plan and track your daily tasks
              </p>
            </div>
            <Button
              onClick={onAddSchedule}
              size="lg"
              className="h-11 shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Task
            </Button>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(-1)}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">
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
                  className="px-4 py-2 bg-background border border-border/50 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(1)}
                className="h-10 w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {!isToday && (
              <Button
                variant="outline"
                onClick={goToToday}
                className="w-full bg-transparent"
              >
                Jump to Today
              </Button>
            )}

            {totalCount > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedCount} of {totalCount} completed
                  </span>
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
        </div>

        <div className="space-y-3">
          {todaySchedule.length === 0 ? (
            <div className="bg-card/50 border border-dashed border-border rounded-xl p-12 text-center">
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
            <div className="space-y-3">
              {todaySchedule
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((dailyTask, index) => {
                  const task = getTask(dailyTask.taskId);
                  if (!task) return null;

                  const project = getProject(task.projectId);

                  return (
                    <div
                      key={dailyTask._id}
                      className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-primary/5 border-primary/20"
                          >
                            {dailyTask.startTime}
                          </Badge>
                          <div className="h-6 w-px bg-border" />
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-muted"
                          >
                            {dailyTask.endTime}
                          </Badge>
                        </div>

                        <button
                          onClick={() => onToggleComplete(dailyTask._id)}
                          className="mt-2 transition-transform hover:scale-110"
                        >
                          {dailyTask.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 pt-1">
                          <h4
                            className={cn(
                              "font-semibold text-base mb-2 leading-snug",
                              dailyTask.completed &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            {project && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-card bg-[${project.color}] ring-[${project.color}]`}
                                />
                                <span className="text-xs font-medium">
                                  {project.name}
                                </span>
                              </div>
                            )}
                            <Badge
                              variant="secondary"
                              className="text-xs capitalize"
                            >
                              {task.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

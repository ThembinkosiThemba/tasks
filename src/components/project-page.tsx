import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Tag,
  AlertTriangle,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProjectEditDialog } from "@/components/project-edit-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Task, Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

const STATUS_COLORS: Record<string, string> = {
  todo: "#3b82f6",
  "in-progress": "#f59e0b",
  review: "#a855f7",
  done: "#10b981",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

interface ProjectPageProps {
  project: Project;
  tasks: Task[];
  onUpdateProject: (
    projectId: Id<"projects">,
    name: string,
    description: string | undefined,
    color: string,
    tags: string[] | undefined,
  ) => void;
  onViewTasks: () => void;
  onBack: () => void;
}

export function ProjectPage({
  project,
  tasks,
  onUpdateProject,
  onViewTasks,
  onBack,
}: ProjectPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === project._id);
  const totalTasks = projectTasks.length;
  const todoTasks = projectTasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const reviewTasks = projectTasks.filter((t) => t.status === "review").length;
  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Priority breakdown
  const highPriorityTasks = projectTasks.filter(
    (t) => t.priority === "high" && t.status !== "done",
  ).length;
  const mediumPriorityTasks = projectTasks.filter(
    (t) => t.priority === "medium" && t.status !== "done",
  ).length;
  const lowPriorityTasks = projectTasks.filter(
    (t) => t.priority === "low" && t.status !== "done",
  ).length;

  // Chart data
  const statusData = [
    { status: "To Do", count: todoTasks, fill: STATUS_COLORS.todo },
    {
      status: "In Progress",
      count: inProgressTasks,
      fill: STATUS_COLORS["in-progress"],
    },
    { status: "Review", count: reviewTasks, fill: STATUS_COLORS.review },
    { status: "Done", count: doneTasks, fill: STATUS_COLORS.done },
  ].filter((d) => d.count > 0);

  const priorityData = [
    { priority: "high", count: highPriorityTasks },
    { priority: "medium", count: mediumPriorityTasks },
    { priority: "low", count: lowPriorityTasks },
  ].filter((d) => d.count > 0);

  // Close edit dialog when project changes
  useEffect(() => {
    setEditDialogOpen(false);
  }, [project._id]);

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Project
          </Button>
        </div>

        {/* Project Header */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
          <div className="flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground leading-relaxed text-lg mb-3">
                  {project.description}
                </p>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
              <p className="text-3xl font-bold mb-1">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold mb-1">{doneTasks}</p>
              <p className="text-xs text-muted-foreground">
                {completionPercentage}% completion rate
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold mb-1">{inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-1">
                High Priority
              </p>
              <p className="text-3xl font-bold mb-1">{highPriorityTasks}</p>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        {totalTasks > 0 && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Progress Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-3 bg-background/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    To Do: {todoTasks}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    Progress: {inProgressTasks}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-xs text-muted-foreground">
                    Review: {reviewTasks}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Done: {doneTasks}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        {totalTasks > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            {statusData.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
                <div className="flex items-center gap-2 mb-6">
                  <ListTodo className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Status Distribution</h3>
                </div>
                <ChartContainer
                  config={{
                    todo: { label: "To Do", color: STATUS_COLORS.todo },
                    "in-progress": {
                      label: "In Progress",
                      color: STATUS_COLORS["in-progress"],
                    },
                    review: { label: "Review", color: STATUS_COLORS.review },
                    done: { label: "Done", color: STATUS_COLORS.done },
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count, percent }) =>
                          `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            )}

            {/* Priority Breakdown */}
            {priorityData.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Active Tasks by Priority
                  </h3>
                </div>
                <ChartContainer
                  config={{
                    count: { label: "Tasks", color: "hsl(var(--primary))" },
                  }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {priorityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PRIORITY_COLORS[entry.priority]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onViewTasks}
            size="lg"
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <ListTodo className="h-5 w-5" />
            View All Tasks
          </Button>
        </div>

        {/* Edit Dialog */}
        <ProjectEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={project}
          onSave={onUpdateProject}
        />
      </div>
    </div>
  );
}

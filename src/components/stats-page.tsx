import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
};

const STATUS_COLORS: Record<string, string> = {
  todo: COLORS.info,
  "in-progress": COLORS.warning,
  review: COLORS.purple,
  done: COLORS.success,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: COLORS.danger,
  medium: COLORS.warning,
  low: COLORS.success,
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; label: string };
}) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-primary/10`}>
          <Icon className={`h-5 w-5 text-primary`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.value > 0 ? "text-success" : "text-danger"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${trend.value < 0 ? "rotate-180" : ""}`}
            />
            <span className="font-medium">
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}

function StatsPageSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function StatsPage() {
  const overview = useQuery(api.stats.getOverview);
  const distribution = useQuery(api.stats.getTaskDistribution);
  const completionTime = useQuery(api.stats.getCompletionTimeStats);
  const productivity = useQuery(api.stats.getProductivityTrends);
  const projectPerformance = useQuery(api.stats.getProjectPerformance);
  const overdueTasks = useQuery(api.stats.getOverdueTasks, {
    thresholdDays: 3,
  });

  const isLoading =
    !overview ||
    !distribution ||
    !completionTime ||
    !productivity ||
    !projectPerformance ||
    !overdueTasks;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-dark dark">
        <StatsPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Statistics & Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights into your task management and productivity
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={overview.totalTasks}
            subtitle={`${overview.tasksThisWeek} this week`}
            icon={Target}
          />
          <StatCard
            title="Completed"
            value={overview.completedTasks}
            subtitle={`${overview.completedThisWeek} this week`}
            icon={CheckCircle2}
          />
          <StatCard
            title="Completion Rate"
            value={`${overview.completionRate.toFixed(1)}%`}
            subtitle="Overall success rate"
            icon={BarChart3}
          />
          <StatCard
            title="Avg. Completion Time"
            value={`${overview.averageCompletionTime.toFixed(1)}d`}
            subtitle="Days to complete"
            icon={Clock}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Distribution by Status */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Task Distribution</h3>
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
                    data={distribution.byStatus}
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
                    {distribution.byStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || COLORS.primary}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPie>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Tasks by Priority */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Priority Breakdown</h3>
            </div>
            <ChartContainer
              config={{
                count: { label: "Tasks", color: COLORS.primary },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribution.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {distribution.byPriority.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.priority] || COLORS.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Completion Time by Priority */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Avg. Completion Time by Priority
              </h3>
            </div>
            <ChartContainer
              config={{
                averageTime: {
                  label: "Days",
                  color: COLORS.primary,
                },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionTime.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="averageTime"
                    fill={COLORS.warning}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Productivity Trends */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Productivity Trend</h3>
            </div>
            <ChartContainer
              config={{
                created: { label: "Created", color: COLORS.info },
                completed: { label: "Completed", color: COLORS.success },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productivity.daily.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="1"
                    stroke={COLORS.info}
                    fill={COLORS.info}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="2"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>

        {/* Project Performance Table */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Project Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Completed
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Avg. Time
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    Overdue
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.map((project, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/30 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">
                      {project.projectName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.totalTasks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.completedTasks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          project.completionRate >= 75
                            ? "default"
                            : project.completionRate >= 50
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {project.completionRate.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {project.averageCompletionTime.toFixed(1)}d
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.overdueTasks > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {project.overdueTasks}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">
                Overdue Tasks ({overdueTasks.length})
              </h3>
            </div>
            <div className="space-y-3">
              {overdueTasks.slice(0, 10).map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {task.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{
                          borderColor: PRIORITY_COLORS[task.priority],
                          color: PRIORITY_COLORS[task.priority],
                        }}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      {Math.floor(task.daysOpen)} days open
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

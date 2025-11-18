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
  Calendar as CalendarIcon,
  Zap,
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
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { PerfectCompletionCalendar } from "@/components/perfect-completion-calendar";

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

export function StatsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const overview = useQuery(api.stats.getOverview);
  const distribution = useQuery(api.stats.getTaskDistribution);
  const completionTime = useQuery(api.stats.getCompletionTimeStats);
  const productivity = useQuery(api.stats.getProductivityTrends);
  const projectPerformance = useQuery(api.stats.getProjectPerformance);
  const overdueTasks = useQuery(api.stats.getOverdueTasks, {
    thresholdDays: 3,
  });
  const activePeriods = useQuery(api.stats.getMostActivePeriods);

  // Filter recent activity based on date range
  const filteredActivity = activePeriods?.recentActivity.filter((activity) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const activityDate = new Date(activity.date);
    return activityDate >= dateRange.from && activityDate <= dateRange.to;
  });

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
          {!overview ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Activity Timeline with Date Range Selector */}
        {!activePeriods ? (
          <Skeleton className="h-[400px]" />
        ) : (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {dateRange.from.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {dateRange.to.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </>
                      ) : (
                        dateRange.from.toLocaleDateString()
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <ChartContainer
              config={{
                created: { label: "Created", color: COLORS.info },
                completed: { label: "Completed", color: COLORS.success },
                total: { label: "Total Activity", color: COLORS.purple },
              }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={filteredActivity}>
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
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {new Date(
                                  payload[0]?.payload?.date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {payload.map((entry: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-4"
                              >
                                <span className="text-sm font-medium">
                                  {entry.name}:
                                </span>
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: entry.color }}
                                >
                                  {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="createdTasks"
                    name="Created"
                    stroke={COLORS.info}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completedTasks"
                    name="Completed"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalActivity"
                    name="Total Activity"
                    stroke={COLORS.purple}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        )}

        {/* Most Active Periods */}
        {!activePeriods ? (
          <Skeleton className="h-60" />
        ) : (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Most Active Periods</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Most Active Day */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Most Active Day</span>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-2xl font-bold mb-1">
                    {new Date(
                      activePeriods.mostActiveDay.date,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span className="font-medium text-info">
                        {activePeriods.mostActiveDay.createdTasks}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium text-success">
                        {activePeriods.mostActiveDay.completedTasks}
                      </span>
                    </div>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {activePeriods.mostActiveDay.totalActivity} total activities
                  </Badge>
                </div>
              </div>

              {/* Most Active Week */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Most Active Week</span>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-lg font-bold mb-1">
                    {new Date(
                      activePeriods.mostActiveWeek.weekStart,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(
                      activePeriods.mostActiveWeek.weekEnd,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span className="font-medium text-info">
                        {activePeriods.mostActiveWeek.createdTasks}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium text-success">
                        {activePeriods.mostActiveWeek.completedTasks}
                      </span>
                    </div>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {activePeriods.mostActiveWeek.totalActivity} total
                    activities
                  </Badge>
                </div>
              </div>

              {/* Most Active Month */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Most Active Month</span>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-2xl font-bold mb-1">
                    {activePeriods.mostActiveMonth.month}{" "}
                    {activePeriods.mostActiveMonth.year}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span className="font-medium text-info">
                        {activePeriods.mostActiveMonth.createdTasks}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium text-success">
                        {activePeriods.mostActiveMonth.completedTasks}
                      </span>
                    </div>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {activePeriods.mostActiveMonth.totalActivity} total
                    activities
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Perfect Completion Calendar */}
        <PerfectCompletionCalendar />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Trends */}
          {!productivity ? (
            <Skeleton className="h-80" />
          ) : (
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
          )}
          {/* Completion Time by Priority */}
          {!completionTime ? (
            <Skeleton className="h-80" />
          ) : (
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
          )}
          {/* Task Distribution by Status */}
          {!distribution ? (
            <Skeleton className="h-80" />
          ) : (
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
          )}

          {/* Tasks by Priority */}
          {!distribution ? (
            <Skeleton className="h-80" />
          ) : (
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
                          fill={
                            PRIORITY_COLORS[entry.priority] || COLORS.primary
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          )}
        </div>

        {/* Project Performance Table */}
        {!projectPerformance ? (
          <Skeleton className="h-80" />
        ) : (
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
                          <span className="text-muted-foreground text-sm">
                            0
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Overdue Tasks */}
        {overdueTasks && overdueTasks.length > 0 && (
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

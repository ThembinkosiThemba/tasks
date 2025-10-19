import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get overview statistics for the current user
 */
export const getOverview = query({
  args: {},
  returns: v.object({
    totalTasks: v.number(),
    completedTasks: v.number(),
    inProgressTasks: v.number(),
    todoTasks: v.number(),
    reviewTasks: v.number(),
    completionRate: v.number(),
    averageCompletionTime: v.number(), // in days
    tasksThisWeek: v.number(),
    tasksThisMonth: v.number(),
    completedThisWeek: v.number(),
    completedThisMonth: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const completedTasks = tasks.filter((t) => t.status === "done");
    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Calculate average completion time for completed tasks
    const completionTimes = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => (t.completedAt! - t._creationTime) / (1000 * 60 * 60 * 24)); // days

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      todoTasks: tasks.filter((t) => t.status === "todo").length,
      reviewTasks: tasks.filter((t) => t.status === "review").length,
      completionRate,
      averageCompletionTime,
      tasksThisWeek: tasks.filter((t) => t._creationTime >= oneWeekAgo).length,
      tasksThisMonth: tasks.filter((t) => t._creationTime >= oneMonthAgo)
        .length,
      completedThisWeek: completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= oneWeekAgo,
      ).length,
      completedThisMonth: completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= oneMonthAgo,
      ).length,
    };
  },
});

/**
 * Get task distribution by status, priority, and type
 */
export const getTaskDistribution = query({
  args: {},
  returns: v.object({
    byStatus: v.array(
      v.object({
        status: v.string(),
        count: v.number(),
      }),
    ),
    byPriority: v.array(
      v.object({
        priority: v.string(),
        count: v.number(),
      }),
    ),
    byType: v.array(
      v.object({
        type: v.string(),
        count: v.number(),
      }),
    ),
    byProject: v.array(
      v.object({
        projectId: v.optional(v.id("projects")),
        projectName: v.string(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Count by status
    const statusCounts = {
      todo: 0,
      "in-progress": 0,
      review: 0,
      done: 0,
    };
    tasks.forEach((t) => {
      statusCounts[t.status]++;
    });

    // Count by priority
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    tasks.forEach((t) => {
      priorityCounts[t.priority]++;
    });

    // Count by type
    const typeCounts: Record<string, number> = {
      general: 0,
      bug: 0,
      feature: 0,
    };
    tasks.forEach((t) => {
      const type = t.type || "general";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Count by project
    const projectCounts: Record<string, number> = {};
    tasks.forEach((t) => {
      const key = t.projectId || "none";
      projectCounts[key] = (projectCounts[key] || 0) + 1;
    });

    return {
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      byPriority: Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
      })),
      byType: Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
      })),
      byProject: Object.entries(projectCounts).map(([key, count]) => {
        const project = projects.find((p) => p._id === key);
        return {
          projectId: key === "none" ? undefined : (key as any),
          projectName: project ? project.name : "No Project",
          count,
        };
      }),
    };
  },
});

/**
 * Get completion time statistics by priority
 */
export const getCompletionTimeStats = query({
  args: {},
  returns: v.object({
    byPriority: v.array(
      v.object({
        priority: v.string(),
        averageTime: v.number(), // days
        count: v.number(),
      }),
    ),
    timeline: v.array(
      v.object({
        date: v.string(),
        averageTime: v.number(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const completedTasks = tasks.filter(
      (t) => t.status === "done" && t.completedAt,
    );

    // Calculate by priority
    const priorityStats: Record<string, { times: number[]; count: number }> = {
      low: { times: [], count: 0 },
      medium: { times: [], count: 0 },
      high: { times: [], count: 0 },
    };

    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const days = (t.completedAt - t._creationTime) / (1000 * 60 * 60 * 24);
        priorityStats[t.priority].times.push(days);
        priorityStats[t.priority].count++;
      }
    });

    const byPriority = Object.entries(priorityStats).map(
      ([priority, data]) => ({
        priority,
        averageTime:
          data.times.length > 0
            ? data.times.reduce((a, b) => a + b, 0) / data.times.length
            : 0,
        count: data.count,
      }),
    );

    // Calculate timeline (last 30 days)
    const timeline: Record<string, { times: number[]; count: number }> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      timeline[dateStr] = { times: [], count: 0 };
    }

    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const completedDate = new Date(t.completedAt)
          .toISOString()
          .split("T")[0];
        if (timeline[completedDate]) {
          const days =
            (t.completedAt - t._creationTime) / (1000 * 60 * 60 * 24);
          timeline[completedDate].times.push(days);
          timeline[completedDate].count++;
        }
      }
    });

    return {
      byPriority,
      timeline: Object.entries(timeline).map(([date, data]) => ({
        date,
        averageTime:
          data.times.length > 0
            ? data.times.reduce((a, b) => a + b, 0) / data.times.length
            : 0,
        count: data.count,
      })),
    };
  },
});

/**
 * Get productivity trends (tasks created and completed over time)
 */
export const getProductivityTrends = query({
  args: {},
  returns: v.object({
    daily: v.array(
      v.object({
        date: v.string(),
        created: v.number(),
        completed: v.number(),
      }),
    ),
    weekly: v.array(
      v.object({
        week: v.string(),
        created: v.number(),
        completed: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Daily stats for last 30 days
    const daily: Record<string, { created: number; completed: number }> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      daily[dateStr] = { created: 0, completed: 0 };
    }

    tasks.forEach((t) => {
      const createdDate = new Date(t._creationTime).toISOString().split("T")[0];
      if (daily[createdDate]) {
        daily[createdDate].created++;
      }

      if (t.completedAt) {
        const completedDate = new Date(t.completedAt)
          .toISOString()
          .split("T")[0];
        if (daily[completedDate]) {
          daily[completedDate].completed++;
        }
      }
    });

    // Weekly stats for last 12 weeks
    const weekly: Record<string, { created: number; completed: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekStr = weekStart.toISOString().split("T")[0];
      weekly[weekStr] = { created: 0, completed: 0 };
    }

    tasks.forEach((t) => {
      const createdDate = new Date(t._creationTime);
      const createdWeekStart = new Date(createdDate);
      createdWeekStart.setDate(createdDate.getDate() - createdDate.getDay());
      const createdWeekStr = createdWeekStart.toISOString().split("T")[0];
      if (weekly[createdWeekStr]) {
        weekly[createdWeekStr].created++;
      }

      if (t.completedAt) {
        const completedDate = new Date(t.completedAt);
        const completedWeekStart = new Date(completedDate);
        completedWeekStart.setDate(
          completedDate.getDate() - completedDate.getDay(),
        );
        const completedWeekStr = completedWeekStart.toISOString().split("T")[0];
        if (weekly[completedWeekStr]) {
          weekly[completedWeekStr].completed++;
        }
      }
    });

    return {
      daily: Object.entries(daily).map(([date, data]) => ({
        date,
        ...data,
      })),
      weekly: Object.entries(weekly).map(([week, data]) => ({
        week,
        ...data,
      })),
    };
  },
});

/**
 * Get project performance statistics
 */
export const getProjectPerformance = query({
  args: {},
  returns: v.array(
    v.object({
      projectId: v.optional(v.id("projects")),
      projectName: v.string(),
      totalTasks: v.number(),
      completedTasks: v.number(),
      completionRate: v.number(),
      averageCompletionTime: v.number(),
      overdueTasks: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projectStats: Record<string, any> = {};

    // Initialize with all projects
    projects.forEach((p) => {
      projectStats[p._id] = {
        projectId: p._id,
        projectName: p.name,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        completionTimes: [],
        averageCompletionTime: 0,
        overdueTasks: 0,
      };
    });

    // Add "No Project" category
    projectStats["none"] = {
      projectId: undefined,
      projectName: "No Project",
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      completionTimes: [],
      averageCompletionTime: 0,
      overdueTasks: 0,
    };

    // Aggregate task data
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    tasks.forEach((t) => {
      const key = t.projectId || "none";
      if (!projectStats[key]) {
        projectStats[key] = {
          projectId: t.projectId,
          projectName: "Unknown Project",
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          completionTimes: [],
          averageCompletionTime: 0,
          overdueTasks: 0,
        };
      }

      projectStats[key].totalTasks++;

      if (t.status === "done") {
        projectStats[key].completedTasks++;
        if (t.completedAt) {
          const days =
            (t.completedAt - t._creationTime) / (1000 * 60 * 60 * 24);
          projectStats[key].completionTimes.push(days);
        }
      }

      // Check if task is overdue (open > 3 days)
      if (t.status !== "done" && now - t._creationTime > threeDaysInMs) {
        projectStats[key].overdueTasks++;
      }
    });

    // Calculate rates and averages
    Object.values(projectStats).forEach((stats: any) => {
      stats.completionRate =
        stats.totalTasks > 0
          ? (stats.completedTasks / stats.totalTasks) * 100
          : 0;
      stats.averageCompletionTime =
        stats.completionTimes.length > 0
          ? stats.completionTimes.reduce((a: number, b: number) => a + b, 0) /
            stats.completionTimes.length
          : 0;
      delete stats.completionTimes; // Remove temporary array
    });

    return Object.values(projectStats).filter(
      (stats: any) => stats.totalTasks > 0,
    );
  },
});

/**
 * Get overdue tasks (tasks open longer than threshold)
 */
export const getOverdueTasks = query({
  args: {
    thresholdDays: v.optional(v.number()), // default: 3 days
  },
  returns: v.array(
    v.object({
      taskId: v.id("tasks"),
      title: v.string(),
      priority: v.string(),
      status: v.string(),
      projectId: v.optional(v.id("projects")),
      daysOpen: v.number(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const threshold = args.thresholdDays || 3;
    const thresholdMs = threshold * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const overdueTasks = tasks
      .filter((t) => {
        if (t.status === "done") return false;
        // const daysOpen = (now - t._creationTime) / (1000 * 60 * 60 * 24);
        return now - t._creationTime > thresholdMs;
      })
      .map((t) => ({
        taskId: t._id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        projectId: t.projectId,
        daysOpen: (now - t._creationTime) / (1000 * 60 * 60 * 24),
        createdAt: t._creationTime,
      }))
      .sort((a, b) => b.daysOpen - a.daysOpen);

    return overdueTasks;
  },
});

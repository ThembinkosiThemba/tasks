import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Default thresholds (in days)
const DEFAULT_THRESHOLDS = {
  high: 1,
  medium: 3,
  low: 7,
};

/**
 * Get threshold for a specific priority and optional project
 * Returns project-specific threshold if available, otherwise global default
 */
export const get = query({
  args: {
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Try to find project-specific threshold
    if (args.projectId) {
      const projectThreshold = await ctx.db
        .query("thresholds")
        .withIndex("by_user_project_priority", (q) =>
          q
            .eq("userId", userId)
            .eq("projectId", args.projectId)
            .eq("priority", args.priority)
        )
        .first();

      if (projectThreshold) {
        return projectThreshold.daysThreshold;
      }
    }

    // Try to find global threshold
    const globalThreshold = await ctx.db
      .query("thresholds")
      .withIndex("by_user_project_priority", (q) =>
        q.eq("userId", userId).eq("projectId", undefined).eq("priority", args.priority)
      )
      .first();

    if (globalThreshold) {
      return globalThreshold.daysThreshold;
    }

    // Return system default
    return DEFAULT_THRESHOLDS[args.priority];
  },
});

/**
 * Get all thresholds for the current user
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("thresholds"),
      _creationTime: v.number(),
      projectId: v.optional(v.id("projects")),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      daysThreshold: v.number(),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("thresholds")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Get default thresholds
 */
export const getDefaults = query({
  args: {},
  returns: v.object({
    high: v.number(),
    medium: v.number(),
    low: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    return DEFAULT_THRESHOLDS;
  },
});

/**
 * Set threshold for a specific priority and optional project
 */
export const set = mutation({
  args: {
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    daysThreshold: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("thresholds"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Validate threshold value
    if (args.daysThreshold < 0) {
      throw new Error("Threshold must be positive");
    }

    // Check if threshold already exists
    const existing = await ctx.db
      .query("thresholds")
      .withIndex("by_user_project_priority", (q) =>
        q
          .eq("userId", userId)
          .eq("projectId", args.projectId)
          .eq("priority", args.priority)
      )
      .first();

    if (existing) {
      // Update existing threshold
      await ctx.db.patch(existing._id, {
        daysThreshold: args.daysThreshold,
      });
      return existing._id;
    } else {
      // Create new threshold
      return await ctx.db.insert("thresholds", {
        userId,
        projectId: args.projectId,
        priority: args.priority,
        daysThreshold: args.daysThreshold,
      });
    }
  },
});

/**
 * Delete a threshold
 */
export const remove = mutation({
  args: { thresholdId: v.id("thresholds") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const threshold = await ctx.db.get(args.thresholdId);
    if (!threshold) {
      throw new Error("Threshold not found");
    }

    // Ensure user can only delete their own thresholds
    if (threshold.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.thresholdId);
    return null;
  },
});

/**
 * Check all tasks and create notifications for overdue tasks
 * This is called by the cron job
 */
export const checkAndNotify = internalMutation({
  args: {},
  returns: v.number(), // number of notifications created
  handler: async (ctx) => {
    // Get all users with tasks
    const tasks = await ctx.db.query("tasks").collect();
    const userIds = Array.from(new Set(tasks.map((t) => t.userId)));

    let notificationsCreated = 0;
    const now = Date.now();

    for (const userId of userIds) {
      // Get user's tasks that are not done
      const userTasks = tasks.filter(
        (t) => t.userId === userId && t.status !== "done"
      );

      // Get user's thresholds
      const userThresholds = await ctx.db
        .query("thresholds")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      // Get user's existing overdue notifications to avoid duplicates
      const existingNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("type"), "task_overdue"))
        .filter((q) => q.eq(q.field("read"), false))
        .collect();

      const notifiedTaskIds = new Set(
        existingNotifications
          .map((n) => n.taskId)
          .filter((id): id is any => id !== undefined)
      );

      for (const task of userTasks) {
        // Skip if already notified
        if (notifiedTaskIds.has(task._id)) continue;

        // Get threshold for this task
        let threshold = DEFAULT_THRESHOLDS[task.priority];

        // Check for project-specific threshold
        if (task.projectId) {
          const projectThreshold = userThresholds.find(
            (t) =>
              t.projectId === task.projectId && t.priority === task.priority
          );
          if (projectThreshold) {
            threshold = projectThreshold.daysThreshold;
          }
        }

        // Check for global threshold
        const globalThreshold = userThresholds.find(
          (t) => !t.projectId && t.priority === task.priority
        );
        if (globalThreshold) {
          threshold = globalThreshold.daysThreshold;
        }

        // Calculate days open
        const daysOpen = (now - task._creationTime) / (1000 * 60 * 60 * 24);

        // Check if overdue
        if (daysOpen > threshold) {
          // Create notification
          await ctx.db.insert("notifications", {
            userId,
            type: "task_overdue",
            title: `Task Overdue: ${task.title}`,
            message: `This ${task.priority} priority task has been open for ${Math.floor(daysOpen)} days (threshold: ${threshold} days)`,
            taskId: task._id,
            read: false,
          });
          notificationsCreated++;
        } else if (daysOpen > threshold * 0.8) {
          // At risk (80% of threshold)
          // Check if we already have an at-risk notification
          const existingAtRisk = existingNotifications.find(
            (n) => n.taskId === task._id && n.type === "task_at_risk"
          );
          if (!existingAtRisk) {
            const remaining = threshold - daysOpen;
            await ctx.db.insert("notifications", {
              userId,
              type: "task_at_risk",
              title: `Task At Risk: ${task.title}`,
              message: `This task will exceed threshold in ${Math.ceil(remaining)} days`,
              taskId: task._id,
              read: false,
            });
            notificationsCreated++;
          }
        }
      }
    }

    return notificationsCreated;
  },
});

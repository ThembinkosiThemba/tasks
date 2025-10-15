import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all daily tasks for the current user
 */
export const list = query({
  args: {
    date: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("dailyTasks"),
      _creationTime: v.number(),
      taskId: v.id("tasks"),
      date: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      completed: v.boolean(),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let dailyTasks;

    if (args.date) {
      // Use the by_user_and_date index for efficient filtering
      dailyTasks = await ctx.db
        .query("dailyTasks")
        .withIndex("by_user_and_date", (q) =>
          q
            .eq("userId", userId)
            .eq("date", args.date!)
        )
        .collect();
    } else {
      // Get all daily tasks for the user
      dailyTasks = await ctx.db
        .query("dailyTasks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }

    return dailyTasks;
  },
});

/**
 * Get daily tasks for a specific task
 */
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  returns: v.array(
    v.object({
      _id: v.id("dailyTasks"),
      _creationTime: v.number(),
      taskId: v.id("tasks"),
      date: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      completed: v.boolean(),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify the task belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized");
    }

    const dailyTasks = await ctx.db
      .query("dailyTasks")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    return dailyTasks;
  },
});

/**
 * Create a new daily task
 */
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    completed: v.optional(v.boolean()),
  },
  returns: v.id("dailyTasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or unauthorized");
    }

    const dailyTaskId = await ctx.db.insert("dailyTasks", {
      taskId: args.taskId,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      completed: args.completed ?? false,
      userId: userId,
    });

    return dailyTaskId;
  },
});

/**
 * Update an existing daily task
 */
export const update = mutation({
  args: {
    dailyTaskId: v.id("dailyTasks"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    completed: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const dailyTask = await ctx.db.get(args.dailyTaskId);
    if (!dailyTask) {
      throw new Error("Daily task not found");
    }

    // Ensure user can only update their own daily tasks
    if (dailyTask.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.dailyTaskId, {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      completed: args.completed,
    });

    return null;
  },
});

/**
 * Toggle the completed status of a daily task
 */
export const toggleComplete = mutation({
  args: { dailyTaskId: v.id("dailyTasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const dailyTask = await ctx.db.get(args.dailyTaskId);
    if (!dailyTask) {
      throw new Error("Daily task not found");
    }

    // Ensure user can only update their own daily tasks
    if (dailyTask.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.dailyTaskId, {
      completed: !dailyTask.completed,
    });

    return null;
  },
});

/**
 * Delete a daily task
 */
export const remove = mutation({
  args: { dailyTaskId: v.id("dailyTasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const dailyTask = await ctx.db.get(args.dailyTaskId);
    if (!dailyTask) {
      throw new Error("Daily task not found");
    }

    // Ensure user can only delete their own daily tasks
    if (dailyTask.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.dailyTaskId);

    return null;
  },
});

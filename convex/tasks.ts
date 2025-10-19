import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all tasks for the current user
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("done"),
      ),
    ),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      status: v.union(
        v.literal("todo"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("done"),
      ),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
      type: v.optional(v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))),
      completedAt: v.optional(v.number()),
      reminderDate: v.optional(v.number()),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    let query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Apply status filter if provided
    if (args.status) {
      query = ctx.db
        .query("tasks")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!),
        );
    }

    let tasks = await query.collect();

    // Apply project filter if provided
    if (args.projectId) {
      tasks = tasks.filter((task) => task.projectId === args.projectId);
    }

    return tasks;
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      status: v.union(
        v.literal("todo"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("done"),
      ),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
      ),
      type: v.optional(v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))),
      completedAt: v.optional(v.number()),
      reminderDate: v.optional(v.number()),
      userId: v.id("users"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);

    // Ensure user can only access their own tasks
    if (task && task.userId !== userId) {
      return null;
    }

    return task;
  },
});

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    status: v.union(
      v.literal("todo"),
      v.literal("review"),
      v.literal("in-progress"),
      v.literal("done"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    type: v.optional(v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))),
    reminderDate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // If projectId is provided, verify it exists and belongs to the user
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project");
      }
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      status: args.status,
      priority: args.priority,
      type: args.type,
      reminderDate: args.reminderDate,
      userId: userId,
    });

    return taskId;
  },
});

/**
 * Update an existing task
 * Syncs daily tasks when status changes to/from done
 */
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    type: v.optional(v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))),
    reminderDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Ensure user can only update their own tasks
    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // If projectId is provided, verify it exists and belongs to the user
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Invalid project");
      }
    }

    const wasCompleted = task.status === "done";
    const isNowCompleted = args.status === "done";

    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      status: args.status,
      priority: args.priority,
      type: args.type,
      reminderDate: args.reminderDate,
      ...(isNowCompleted && !wasCompleted ? { completedAt: Date.now() } : {}),
    });

    // Sync daily tasks when status changes to/from done
    if (wasCompleted !== isNowCompleted) {
      const dailyTasks = await ctx.db
        .query("dailyTasks")
        .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
        .collect();

      for (const dailyTask of dailyTasks) {
        await ctx.db.patch(dailyTask._id, {
          completed: isNowCompleted,
        });
      }
    }

    return null;
  },
});

/**
 * Complete a task (sets status to done and records completion time)
 * Also marks all associated daily tasks as completed
 */
export const complete = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Ensure user can only complete their own tasks
    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.taskId, {
      status: "done",
      completedAt: Date.now(),
    });

    // Mark all associated daily tasks as completed
    const dailyTasks = await ctx.db
      .query("dailyTasks")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    for (const dailyTask of dailyTasks) {
      if (!dailyTask.completed) {
        await ctx.db.patch(dailyTask._id, {
          completed: true,
        });
      }
    }

    return null;
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Ensure user can only delete their own tasks
    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.taskId);

    return null;
  },
});

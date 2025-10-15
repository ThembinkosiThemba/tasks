import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all projects for the current user
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      color: v.string(),
      userId: v.id("users"),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return projects;
  },
});

/**
 * Get a single project by ID
 */
export const get = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      color: v.string(),
      userId: v.id("users"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);

    // Ensure user can only access their own projects
    if (project && project.userId !== userId) {
      return null;
    }

    return project;
  },
});

/**
 * Create a new project
 */
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      color: args.color,
      userId: userId,
    });

    return projectId;
  },
});

/**
 * Update an existing project
 */
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    color: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Ensure user can only update their own projects
    if (project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.projectId, {
      name: args.name,
      color: args.color,
    });

    return null;
  },
});

/**
 * Delete a project
 */
export const remove = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Ensure user can only delete their own projects
    if (project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.projectId);

    return null;
  },
});

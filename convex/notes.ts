import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all meeting notes for the current user, sorted by date descending
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("meetingNotes"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      date: v.string(),
      tags: v.optional(v.array(v.string())),
      pinned: v.optional(v.boolean()),
      starred: v.optional(v.boolean()),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx, args) => {
    console.log(args);
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const notes = await ctx.db
      .query("meetingNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notes;
  },
});

/**
 * Get a single meeting note by ID
 */
export const get = query({
  args: { noteId: v.id("meetingNotes") },
  returns: v.union(
    v.object({
      _id: v.id("meetingNotes"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      date: v.string(),
      tags: v.optional(v.array(v.string())),
      pinned: v.optional(v.boolean()),
      starred: v.optional(v.boolean()),
      userId: v.id("users"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);

    // Ensure user can only access their own notes
    if (note && note.userId !== userId) {
      return null;
    }

    return note;
  },
});

/**
 * Create a new meeting note
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    date: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("meetingNotes"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const noteId = await ctx.db.insert("meetingNotes", {
      title: args.title,
      content: args.content,
      date: args.date,
      tags: args.tags,
      userId: userId,
    });

    return noteId;
  },
});

/**
 * Update an existing meeting note
 */
export const update = mutation({
  args: {
    noteId: v.id("meetingNotes"),
    title: v.string(),
    content: v.string(),
    date: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Ensure user can only update their own notes
    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      title: args.title,
      content: args.content,
      date: args.date,
      tags: args.tags,
    });

    return null;
  },
});

/**
 * Delete a meeting note
 */
export const remove = mutation({
  args: { noteId: v.id("meetingNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Ensure user can only delete their own notes
    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.noteId);

    return null;
  },
});

/**
 * Toggle pin status of a meeting note
 */
export const togglePin = mutation({
  args: { noteId: v.id("meetingNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Ensure user can only pin their own notes
    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      pinned: !note.pinned,
    });

    return null;
  },
});

/**
 * Toggle star status of a meeting note
 */
export const toggleStar = mutation({
  args: { noteId: v.id("meetingNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Ensure user can only star their own notes
    if (note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      starred: !note.starred,
    });

    return null;
  },
});

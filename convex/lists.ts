import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLists = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("lists"),
      _creationTime: v.number(),
      title: v.string(),
      type: v.union(v.literal("pricing"), v.literal("general")),
      items: v.array(
        v.object({
          title: v.string(),
          status: v.union(v.literal("checked"), v.literal("unchecked")),
          price: v.optional(v.number()),
        }),
      ),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return lists;
  },
});

export const createList = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("pricing"), v.literal("general")),
    items: v.optional(
      v.array(
        v.object({
          title: v.string(),
          status: v.union(v.literal("checked"), v.literal("unchecked")),
          price: v.optional(v.number()),
        }),
      ),
    ),
  },
  returns: v.id("lists"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const listId = await ctx.db.insert("lists", {
      title: args.title,
      type: args.type,
      items: args.items || [],
      userId: userId,
    });

    return listId;
  },
});

export const updateList = mutation({
  args: {
    _id: v.id("lists"),
    title: v.optional(v.string()),
    type: v.optional(v.union(v.literal("pricing"), v.literal("general"))),
    items: v.optional(
      v.array(
        v.object({
          title: v.string(),
          status: v.union(v.literal("checked"), v.literal("unchecked")),
          price: v.optional(v.number()),
        }),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args._id);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.type !== undefined) updates.type = args.type;
    if (args.items !== undefined) updates.items = args.items;

    await ctx.db.patch(args._id, updates);

    return null;
  },
});

export const addListItem = mutation({
  args: {
    listId: v.id("lists"),
    title: v.string(),
    price: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const newItem = {
      title: args.title,
      status: "unchecked" as const,
      price: args.price,
    };

    await ctx.db.patch(args.listId, {
      items: [...list.items, newItem],
    });

    return null;
  },
});

export const updateListItem = mutation({
  args: {
    listId: v.id("lists"),
    itemIndex: v.number(),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal("checked"), v.literal("unchecked"))),
    price: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (args.itemIndex < 0 || args.itemIndex >= list.items.length) {
      throw new Error("Invalid item index");
    }

    const updatedItems = [...list.items];
    const currentItem = updatedItems[args.itemIndex];

    updatedItems[args.itemIndex] = {
      title: args.title !== undefined ? args.title : currentItem.title,
      status: args.status !== undefined ? args.status : currentItem.status,
      price: args.price !== undefined ? args.price : currentItem.price,
    };

    await ctx.db.patch(args.listId, {
      items: updatedItems,
    });

    return null;
  },
});

export const removeListItem = mutation({
  args: {
    listId: v.id("lists"),
    itemIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (args.itemIndex < 0 || args.itemIndex >= list.items.length) {
      throw new Error("Invalid item index");
    }

    const updatedItems = list.items.filter(
      (_, index) => index !== args.itemIndex,
    );

    await ctx.db.patch(args.listId, {
      items: updatedItems,
    });

    return null;
  },
});

export const removeList = mutation({
  args: { _id: v.id("lists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const list = await ctx.db.get(args._id);
    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args._id);

    return null;
  },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    tags: v.optional(v.array(v.string())),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
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
    completedAt: v.optional(v.number()),
    reminderDate: v.optional(v.number()),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_and_status", ["userId", "status"]),

  dailyTasks: defineTable({
    taskId: v.id("tasks"),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    completed: v.boolean(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_user_and_date", ["userId", "date"]),

  meetingNotes: defineTable({
    title: v.string(),
    content: v.string(),
    date: v.string(),
    tags: v.optional(v.array(v.string())),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  notifications: defineTable({
    type: v.string(),
    title: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    read: v.boolean(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  thresholds: defineTable({
    projectId: v.optional(v.id("projects")), // null/undefined = global default
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    daysThreshold: v.number(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_project", ["userId", "projectId"])
    .index("by_user_project_priority", ["userId", "projectId", "priority"]),
});

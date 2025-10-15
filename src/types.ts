import type { Id } from "../convex/_generated/dataModel";

// Convex document types (with _id and _creationTime)
export interface Project {
  _id: Id<"projects">
  _creationTime: number
  name: string
  color: string
  userId: Id<"users">
}

export interface Task {
  _id: Id<"tasks">
  _creationTime: number
  title: string
  description?: string
  projectId?: Id<"projects">
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  completedAt?: number
  userId: Id<"users">
}

export interface DailyTask {
  _id: Id<"dailyTasks">
  _creationTime: number
  taskId: Id<"tasks">
  date: string
  startTime: string
  endTime: string
  completed: boolean
  userId: Id<"users">
}

export interface User {
  email: string
  name: string
}

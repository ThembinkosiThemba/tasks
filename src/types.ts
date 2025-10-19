import type { Id } from "../convex/_generated/dataModel";

// Convex document types (with _id and _creationTime)
export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  name: string;
  description?: string;
  color: string;
  tags?: string[];
  userId: Id<"users">;
}

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskType = "bug" | "feature" | "general";

export interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  description?: string;
  projectId?: Id<"projects">;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  type?: TaskType;
  completedAt?: number;
  reminderDate?: number;
  userId: Id<"users">;
}

export interface DailyTask {
  _id: Id<"dailyTasks">;
  _creationTime: number;
  taskId: Id<"tasks">;
  date: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  userId: Id<"users">;
}

export interface User {
  email: string;
  name: string;
}

export interface MeetingNote {
  _id: Id<"meetingNotes">;
  _creationTime: number;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  userId: Id<"users">;
}

export interface Notification {
  _id: Id<"notifications">;
  _creationTime: number;
  type: string;
  title: string;
  message: string;
  taskId?: Id<"tasks">;
  read: boolean;
  userId: Id<"users">;
}

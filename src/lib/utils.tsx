import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Streamdown } from "streamdown";
import { Task } from "@/types";
import { Check, CheckCircle2, Circle, Clock } from "lucide-react";
import type { BundledTheme } from "shiki";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const themes = ["github-light", "github-dark"] as [BundledTheme, BundledTheme];

export const MarkdownRender = (content: string) => {
  return (
    <div>
      <Streamdown shikiTheme={themes}>{content}</Streamdown>
    </div>
  );
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    case "medium":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    case "low":
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const getStatusConfig = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return { label: "To Do", color: "bg-blue-500", icon: Circle };
    case "in-progress":
      return { label: "In Progress", color: "bg-yellow-500", icon: Clock };
    case "review":
      return {
        label: "Review",
        color: "bg-orange-500",
        icon: Check,
      };
    case "done":
      return { label: "Done", color: "bg-green-500", icon: CheckCircle2 };
  }
};

export const cardGradient =
  "bg-gradient-to-br from-primary/5 to-primary/[0.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10";

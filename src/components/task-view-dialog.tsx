import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Clock, Circle, CheckCircle2 } from "lucide-react";
import type { Task, Project } from "@/types";
import { cn } from "@/lib/utils";

interface TaskViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
}

export function TaskViewDialog({
  open,
  onOpenChange,
  task,
  project,
  onEdit,
  onDelete,
  onSchedule,
}: TaskViewDialogProps) {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
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

  const getStatusConfig = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return { label: "To Do", color: "bg-blue-500", icon: Circle };
      case "in-progress":
        return { label: "In Progress", color: "bg-yellow-500", icon: Clock };
      case "done":
        return { label: "Done", color: "bg-green-500", icon: CheckCircle2 };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/50 border border-border/30">
              <div className={cn("h-2 w-2 rounded-full", statusConfig.color)} />
              <span className="text-sm font-medium">{statusConfig.label}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm capitalize font-medium",
                getPriorityColor(task.priority),
              )}
            >
              {task.priority} Priority
            </Badge>
            {project && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/50 border border-border/30">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm font-medium">{project.name}</span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Created
              </p>
              <p className="text-sm">
                {new Date(task._creationTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {task.completedAt && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Completed
                </p>
                <p className="text-sm text-foreground">
                  {new Date(task.completedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              onSchedule();
            }}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

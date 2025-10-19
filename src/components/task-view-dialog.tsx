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
import { Pencil, Trash, Clock } from "lucide-react";
import type { Task, Project } from "@/types";
import { cn, getPriorityColor, getStatusConfig } from "@/lib/utils";

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

  const statusConfig = getStatusConfig(task.status);

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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/30">
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
              {task.priority}
            </Badge>
            {project && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/30">
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
                <p className="text-sm">
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

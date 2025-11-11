import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Task, Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  projects: Project[];
  selectedTask?: Task;
  onSave: (
    taskIds: Id<"tasks">[],
    date: string,
    startTime?: string,
    endTime?: string,
  ) => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  tasks,
  projects,
  selectedTask,
  onSave,
}: ScheduleDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set(selectedTask ? [selectedTask._id] : []),
  );
  const [date, setDate] = useState(today);
  const [useTimeBlock, setUseTimeBlock] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("non-done");

  // Update selected tasks when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setSelectedTaskIds(new Set([selectedTask._id]));
    } else {
      setSelectedTaskIds(new Set());
    }
  }, [selectedTask]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDate(today);
      setSearchQuery("");
      setStatusFilter("non-done");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskIds.size === 0) return;

    const taskIdsArray = Array.from(selectedTaskIds) as Id<"tasks">[];

    if (useTimeBlock) {
      onSave(taskIdsArray, date, startTime, endTime);
    } else {
      onSave(taskIdsArray, date);
    }
    onOpenChange(false);
  };

  const toggleTask = (taskId: string) => {
    const newSet = new Set(selectedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTaskIds(newSet);
  };

  const getProject = (projectId?: string) =>
    projects.find((p) => p._id === projectId);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "non-done") {
      matchesStatus = task.status !== "done";
    } else if (statusFilter !== "all") {
      matchesStatus = task.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: Task["status"]) => {
    const configs = {
      todo: {
        label: "To Do",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      },
      "in-progress": {
        label: "In Progress",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      },
      review: {
        label: "Review",
        color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      },
      done: {
        label: "Done",
        color: "bg-green-500/10 text-green-500 border-green-500/30",
      },
    };
    return configs[status];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-dark max-h-[90vh] max-w-2xl pb-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Tasks</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2">Status:</span>

            <Button
              type="button"
              variant={statusFilter === "non-done" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setStatusFilter("non-done")}
            >
              Not Done
            </Button>
            <Button
              type="button"
              variant={statusFilter === "todo" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setStatusFilter("todo")}
            >
              To Do
            </Button>
            <Button
              type="button"
              variant={statusFilter === "in-progress" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setStatusFilter("in-progress")}
            >
              In Progress
            </Button>
            <Button
              type="button"
              variant={statusFilter === "review" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setStatusFilter("review")}
            >
              Review
            </Button>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <Label>Select Tasks ({selectedTaskIds.size} selected)</Label>
            <div className="border-none rounded-lg max-h-[260px] overflow-y-auto">
              <div className="py-3 space-y-2">
                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tasks found
                  </p>
                ) : (
                  filteredTasks.map((task) => {
                    const project = getProject(task.projectId);
                    const isSelected = selectedTaskIds.has(task._id);

                    return (
                      <div
                        key={task._id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-all",
                          isSelected
                            ? "bg-primary/10 border-primary/50"
                            : "bg-card hover:bg-card/80 border-border/50",
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTask(task._id)}
                          className="mt-1"
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => toggleTask(task._id)}
                        >
                          <h4 className="font-medium text-sm mb-1 leading-snug">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {project && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50 border border-border/20">
                                <div
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="text-[10px] font-medium">
                                  {project.name}
                                </span>
                              </div>
                            )}
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4 px-1.5 capitalize"
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] h-4 px-1.5",
                                getStatusConfig(task.status).color,
                              )}
                            >
                              {getStatusConfig(task.status).label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time Block Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeBlock"
              checked={useTimeBlock}
              onCheckedChange={(checked) => setUseTimeBlock(checked as boolean)}
            />
            <Label
              htmlFor="timeBlock"
              className="text-sm font-normal cursor-pointer"
            >
              Time block these tasks
            </Label>
          </div>

          {useTimeBlock && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={selectedTaskIds.size === 0}>
              Schedule {selectedTaskIds.size > 0 && `(${selectedTaskIds.size})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

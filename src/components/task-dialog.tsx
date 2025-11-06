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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import type { Task, Project, TaskType } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  projects: Project[];
  onSave: (task: Partial<Task>) => Promise<Id<"tasks"> | void>;
  onSchedule?: (
    taskId: Id<"tasks">,
    date: string,
    startTime?: string,
    endTime?: string,
  ) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  projects,
  onSave,
  onSchedule,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [taskType, setTaskType] = useState<string>("general");
  const [reminderDate, setReminderDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Scheduling fields
  const [shouldSchedule, setShouldSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [useTimeBlock, setUseTimeBlock] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setProjectId((task.projectId as string) || "none");
      setStatus(task.status);
      setPriority(task.priority);
      setTaskType((task.type as string) || "general");
      setReminderDate(
        task.reminderDate
          ? new Date(task.reminderDate).toISOString().slice(0, 16)
          : "",
      );
    } else {
      setTitle("");
      setDescription("");
      setProjectId("none");
      setStatus("todo");
      setPriority("medium");
      setTaskType("general");
      setReminderDate("");
      setShouldSchedule(false);
      setScheduleDate(new Date().toISOString().split("T")[0]);
      setUseTimeBlock(false);
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedTask = await onSave({
        title,
        description,
        projectId: projectId === "none" ? undefined : (projectId as any),
        status,
        priority,
        type: taskType === "general" ? undefined : (taskType as TaskType),
        reminderDate: reminderDate
          ? new Date(reminderDate).getTime()
          : undefined,
      });

      // If scheduling is enabled and this is a new task, schedule it
      if (shouldSchedule && !task && onSchedule && savedTask) {
        if (useTimeBlock) {
          onSchedule(
            savedTask as Id<"tasks">,
            scheduleDate,
            startTime,
            endTime,
          );
        } else {
          onSchedule(savedTask as Id<"tasks">, scheduleDate);
        }
      }

      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 gap-1">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v: Task["status"]) => setStatus(v)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v: Task["priority"]) => setPriority(v)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type (optional)</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="No type" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduling section - only show when creating a new task */}
          {!task && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shouldSchedule"
                  checked={shouldSchedule}
                  onCheckedChange={(checked) =>
                    setShouldSchedule(checked as boolean)
                  }
                />
                <Label
                  htmlFor="shouldSchedule"
                  className="text-sm font-normal cursor-pointer"
                >
                  Schedule this task
                </Label>
              </div>

              {shouldSchedule && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDate">Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useTimeBlock"
                      checked={useTimeBlock}
                      onCheckedChange={(checked) =>
                        setUseTimeBlock(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="useTimeBlock"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Time block this task
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
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={"outline"}
              className="text-black"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  selectedTask?: Task;
  onSave: (
    taskId: Id<"tasks">,
    date: string,
    startTime?: string,
    endTime?: string,
  ) => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  tasks,
  selectedTask,
  onSave,
}: ScheduleDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [taskId, setTaskId] = useState<string>(selectedTask?._id || "");
  const [date, setDate] = useState(today);
  const [useTimeBlock, setUseTimeBlock] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Update taskId when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setTaskId(selectedTask._id);
    }
  }, [selectedTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;
    if (useTimeBlock) {
      onSave(taskId as Id<"tasks">, date, startTime, endTime);
    } else {
      onSave(taskId as Id<"tasks">, date);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-dark overflow-x-scroll">
        <DialogHeader>
          <DialogTitle>Schedule Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Select value={taskId} onValueChange={setTaskId} required>
              <SelectTrigger id="task">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent className="overflow-x-hidden">
                {tasks.map((task) => (
                  <SelectItem
                    className="line-clamp-1"
                    key={task._id}
                    value={task._id}
                  >
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

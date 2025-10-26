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
import type { MeetingNote } from "@/types";

interface MeetingNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: MeetingNote;
  onSave: (note: Partial<MeetingNote>) => void;
}

export function MeetingNoteDialog({
  open,
  onOpenChange,
  note,
  onSave,
}: MeetingNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      date: new Date().toISOString().split("T")[0], // Auto-set to today
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {note ? "Edit Meeting Note" : "New Meeting Note"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
              className="text-xl font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your notes...)"
              rows={20}
              className="font-normal text-base leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-between items-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground">
              Date will be set to today
            </span>
            <div className="flex gap-2">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant={"secondary"} type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

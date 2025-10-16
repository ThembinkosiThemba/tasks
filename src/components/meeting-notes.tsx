import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  Calendar,
  Eye,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRender } from "@/lib/utils";
import type { MeetingNote } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface MeetingNotesProps {
  notes: MeetingNote[];
  onAddNote: () => void;
  onEditNote: (note: MeetingNote) => void;
  onDeleteNote: (noteId: Id<"meetingNotes">) => void;
  onSaveNote: (noteData: Partial<MeetingNote>) => void;
}

interface NoteCardProps {
  note: MeetingNote;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

function NoteCard({ note, onEdit, onDelete, onView }: NoteCardProps) {
  const formattedDate = new Date(note.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const preview =
    note.content.length > 150
      ? note.content.substring(0, 150) + "..."
      : note.content;

  return (
    <div
      className={cn(
        "group bg-gradient-to-br from-card/80 to-card/60 border border-border/50 rounded-lg p-5 transition-all duration-200",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "animate-in fade-in-0 slide-in-from-bottom-2",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4
              className="font-semibold text-base leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={onView}
            >
              {note.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-dark dark">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed whitespace-pre-wrap">
            {preview}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetingNotes({
  notes,
  // onAddNote,
  // onEditNote,
  onDeleteNote,
  onSaveNote,
}: MeetingNotesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingNote, setViewingNote] = useState<MeetingNote | null>(null);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreateNote = () => {
    setIsCreatingNew(true);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setLastSaved(null);
  };

  const handleEditNoteClick = (note: MeetingNote) => {
    setIsCreatingNew(false);
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setLastSaved(null);
  };

  // Auto-save functionality with debouncing
  const autoSave = () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    const noteData: Partial<MeetingNote> = {
      title: title || "Untitled",
      content,
      date: new Date().toISOString().split("T")[0],
    };

    if (editingNote) {
      onSaveNote({ ...noteData, _id: editingNote._id } as any);
    } else {
      onSaveNote(noteData);
    }

    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  };

  // Trigger auto-save when title or content changes
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (title.trim() || content.trim()) {
        autoSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content]);

  const handleCancel = () => {
    setIsCreatingNew(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setLastSaved(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Show editor if creating or editing
  const showEditor = isCreatingNew || editingNote !== null;

  // Get formatted save status
  const getSaveStatus = () => {
    if (isSaving) return "Saving...";
    if (lastSaved) {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      if (diff < 60000) return "Saved just now";
      if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
      return "Saved";
    }
    return "Not saved";
  };

  // Full-window editor view
  if (showEditor) {
    return (
      <div className="flex-1 overflow-auto bg-dark">
        <div className="h-full max-w-[900px] mx-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-border/50 sticky top-0 bg-dark/95 backdrop-blur-sm z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {isSaving ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  {getSaveStatus()}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Type to start auto-saving
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 p-6 md:p-12 space-y-6">
            {/* Title Input */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="text-4xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
            />

            {/* Content Textarea */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your notes... (Markdown supported)"
              className="min-h-[500px] resize-none border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed font-normal"
            />
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex-1 overflow-auto bg-dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Meeting Notes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>
            <Button
              onClick={handleCreateNote}
              size="lg"
              className="h-10 md:h-11 shadow-lg shadow-primary/20 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 md:h-11 bg-card border-border/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="bg-card/30 border-2 border-dashed border-border/50 rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-base text-muted-foreground mb-2">
                {searchQuery ? "No notes found" : "No meeting notes yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first meeting note to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={() => handleEditNoteClick(note)}
                  onDelete={() => onDeleteNote(note._id)}
                  onView={() => setViewingNote(note)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Note Dialog */}
      <Dialog
        open={viewingNote !== null}
        onOpenChange={(open) => !open && setViewingNote(null)}
      >
        <DialogContent className="bg-dark max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewingNote?.title}</DialogTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2">
              <Calendar className="h-4 w-4" />
              {viewingNote?.date &&
                new Date(viewingNote.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </div>
          </DialogHeader>
          <div className="prose prose-invert max-w-none mt-4">
            {viewingNote && MarkdownRender(viewingNote.content)}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => {
                if (viewingNote) {
                  handleEditNoteClick(viewingNote);
                  setViewingNote(null);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setViewingNote(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FileText,
  Pencil,
  Trash,
  Search,
  Calendar,
  Eye,
  ArrowLeft,
  Check,
  Loader,
  Pin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  onSaveNote: (noteData: Partial<MeetingNote>) => Promise<Id<"meetingNotes"> | void>;
  onTogglePin: (noteId: Id<"meetingNotes">) => void;
  onToggleStar: (noteId: Id<"meetingNotes">) => void;
}

interface NoteCardProps {
  note: MeetingNote;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
}

function NoteCard({ note, onEdit, onDelete, onView, onTogglePin, onToggleStar }: NoteCardProps) {
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
        "group relative bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/50 rounded-xl p-6 transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "animate-in fade-in-0 slide-in-from-bottom-2",
        note.pinned && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      {/* Pinned/Starred indicators at top right */}
      {(note.pinned || note.starred) && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {note.pinned && (
            <div className="bg-primary/20 text-primary rounded-full p-1.5">
              <Pin className="h-3 w-3 fill-current" />
            </div>
          )}
          {note.starred && (
            <div className="bg-yellow-500/20 text-yellow-500 rounded-full p-1.5">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 pr-12">
            <h4
              className="font-semibold text-lg leading-tight cursor-pointer hover:text-primary transition-colors mb-2"
              onClick={onView}
            >
              {note.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

        </div>

        {/* Preview content */}
        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {preview}
        </p>

        {/* Actions bar at bottom */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {/* Desktop: Show all action buttons */}
          <div className="hidden lg:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1.5"
              onClick={onView}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 text-xs gap-1.5", note.starred && "text-yellow-500")}
              onClick={onToggleStar}
            >
              <Star className={cn("h-3.5 w-3.5", note.starred && "fill-current")} />
              <span>{note.starred ? "Starred" : "Star"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 text-xs gap-1.5", note.pinned && "text-primary")}
              onClick={onTogglePin}
            >
              <Pin className={cn("h-3.5 w-3.5", note.pinned && "fill-current")} />
              <span>{note.pinned ? "Pinned" : "Pin"}</span>
            </Button>
          </div>

          {/* Mobile: Show view button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 px-2 text-xs gap-1.5"
            onClick={onView}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>

          {/* Edit and Delete actions - both desktop and mobile */}
          <div className="flex items-center gap-1">
            {/* Mobile: Quick pin/star actions */}
            <div className="lg:hidden flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", note.starred && "text-yellow-500")}
                onClick={onToggleStar}
              >
                <Star className={cn("h-3.5 w-3.5", note.starred && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", note.pinned && "text-primary")}
                onClick={onTogglePin}
              >
                <Pin className={cn("h-3.5 w-3.5", note.pinned && "fill-current")} />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              title="Edit note"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/70 hover:text-destructive"
              onClick={onDelete}
              title="Delete note"
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
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
  onTogglePin,
  onToggleStar,
}: MeetingNotesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingNote, setViewingNote] = useState<MeetingNote | null>(null);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<MeetingNote | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "pinned" | "starred">("all");

  // Editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for tracking initial state and debounce timer
  const initialTitleRef = useRef("");
  const initialContentRef = useRef("");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      title !== initialTitleRef.current ||
      content !== initialContentRef.current;
    setHasUnsavedChanges(hasChanges);
  }, [title, content]);

  // Auto-save with 10 second debounce
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if there are unsaved changes and content exists
    if (hasUnsavedChanges && (title.trim() || content.trim())) {
      autoSaveTimerRef.current = setTimeout(() => {
        void handleSave();
      }, 10000); // 10 seconds
    }

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, hasUnsavedChanges]);

  // Ctrl+S keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (title.trim() || content.trim()) {
          void handleSave();
        }
      }
    };

    // Only add listener when editor is open
    if (isCreatingNew || editingNote !== null) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreatingNew, editingNote, title, content]);

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && (isCreatingNew || editingNote !== null)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isCreatingNew, editingNote]);

  const handleCreateNote = () => {
    setIsCreatingNew(true);
    setEditingNote(null);
    setViewingNote(null);
    setIsEditMode(true);
    setTitle("");
    setContent("");
    initialTitleRef.current = "";
    initialContentRef.current = "";
    setHasUnsavedChanges(false);
  };

  const handleEditNoteClick = (note: MeetingNote) => {
    setIsCreatingNew(false);
    setEditingNote(note);
    setViewingNote(note);
    setIsEditMode(true);
    setTitle(note.title);
    setContent(note.content);
    initialTitleRef.current = note.title;
    initialContentRef.current = note.content;
    setHasUnsavedChanges(false);
  };

  const handleViewNote = (note: MeetingNote) => {
    setViewingNote(note);
    setEditingNote(note);
    setIsCreatingNew(false);
    setIsEditMode(false);
    setTitle(note.title);
    setContent(note.content);
    initialTitleRef.current = note.title;
    initialContentRef.current = note.content;
    setHasUnsavedChanges(false);
  };

  const handleDeleteClick = (note: MeetingNote) => {
    setDeleteConfirmNote(note);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmNote) {
      onDeleteNote(deleteConfirmNote._id);
      setDeleteConfirmNote(null);
    }
  };

  // Manual save functionality
  const handleSave = async () => {
    // Prevent saving completely empty notes
    if (!title.trim() && !content.trim()) return;

    // Prevent concurrent saves
    if (isSaving) return;

    setIsSaving(true);
    const noteData: Partial<MeetingNote> = {
      title: title.trim() || "Untitled",
      content: content.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      if (editingNote) {
        await onSaveNote({ ...noteData, _id: editingNote._id } as any);
      } else {
        // When creating a new note, get the ID and update editingNote
        const newNoteId = await onSaveNote(noteData);
        if (newNoteId) {
          // The `notes` prop might not be updated yet with the new note.
          // To prevent creating duplicate notes on subsequent auto-saves,
          // we create a temporary note object with the new ID and existing
          // data to hold the state.
          setEditingNote({
            ...noteData,
            _id: newNoteId,
            _creationTime: Date.now(),
          } as MeetingNote);
          setIsCreatingNew(false);
        }
      }

      // Update initial refs to mark as saved
      initialTitleRef.current = title.trim() || "Untitled";
      initialContentRef.current = content.trim();
      setHasUnsavedChanges(false);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const handleCancel = () => {
    // Warn if there are unsaved changes
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?",
      );
      if (!confirmClose) return;
    }

    setIsCreatingNew(false);
    setEditingNote(null);
    setViewingNote(null);
    setIsEditMode(false);
    setTitle("");
    setContent("");
    initialTitleRef.current = "";
    initialContentRef.current = "";
    setHasUnsavedChanges(false);
  };

  // Helper function to get date label for grouping
  const getDateLabel = (dateString: string): string => {
    const noteDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    noteDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - noteDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This Week";
    if (diffDays < 30) return "This Month";

    // Format as "Month Year" for older notes
    return noteDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ? true :
        activeFilter === "pinned" ? note.pinned :
        activeFilter === "starred" ? note.starred :
        true;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // First sort by pinned status
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Group notes by date
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const label = getDateLabel(note.date);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(note);
    return groups;
  }, {} as Record<string, MeetingNote[]>);

  // Define the order of groups
  const groupOrder = ["Today", "Yesterday", "This Week", "This Month"];
  const orderedGroups = Object.keys(groupedNotes).sort((a, b) => {
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);

    // If both are in the predefined order, sort by that
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is in predefined order, it comes first
    if (indexA !== -1) return -1;
    // If only B is in predefined order, it comes first
    if (indexB !== -1) return 1;
    // Otherwise, sort month-year groups in reverse chronological order
    return b.localeCompare(a);
  });

  // Show editor/viewer if creating, editing, or viewing
  const showEditor = isCreatingNew || viewingNote !== null;

  // Full-window editor/viewer view
  if (showEditor) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-b from-dark via-dark to-dark/95">
        <div className="max-w-[850px] mx-auto flex flex-col">
          {/* Minimal Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border/30 sticky top-0 bg-dark/80 backdrop-blur-md z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {isEditMode && hasUnsavedChanges && !isSaving && (
                <span className="text-xs text-amber-500/80 hidden sm:inline">
                  Unsaved changes • Press Ctrl+S to save
                </span>
              )}
              {!isEditMode && viewingNote && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  size="sm"
                  variant="secondary"
                  className="shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit Note
                </Button>
              )}
              {isEditMode && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || (!title.trim() && !content.trim())}
                  size="sm"
                  className="shadow-sm"
                  variant={"secondary"}
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Save Note
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Editor/Viewer Area */}
          <div className="flex-1 px-8 md:px-16 py-10 space-y-5 overflow-auto">
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Note"
                  className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/30 text-foreground/95"
                  autoFocus={isCreatingNew}
                />

                {/* Subtle separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your thoughts... You can use **bold**, *italic*, lists, and more."
                  className="w-full resize-none bg-transparent border-none outline-none focus:outline-none text-base md:text-lg leading-relaxed text-foreground/90 placeholder:text-muted-foreground/30 font-normal"
                  style={{ minHeight: "calc(100vh - 280px)" }}
                />
              </>
            ) : (
              <>
                <h1 className="w-full text-3xl md:text-4xl font-bold text-foreground/95">
                  {title || "Untitled Note"}
                </h1>

                {/* Subtle separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />

                <div className="prose prose-invert max-w-none text-base md:text-lg leading-relaxed text-foreground/90">
                  {MarkdownRender(content)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-dark">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Meeting Notes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredNotes.length}{" "}
                {filteredNotes.length === 1 ? "note" : "notes"}
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

          {/* Search Bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 md:h-11 bg-card border-border/50"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-card/30 rounded-lg border border-border/40 w-fit">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("pinned")}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  activeFilter === "pinned"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Pin className={cn("h-3.5 w-3.5", activeFilter === "pinned" && "fill-current")} />
                <span className="hidden sm:inline">Pinned</span>
              </button>
              <button
                onClick={() => setActiveFilter("starred")}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                  activeFilter === "starred"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Star className={cn("h-3.5 w-3.5", activeFilter === "starred" && "fill-current")} />
                <span className="hidden sm:inline">Starred</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
            orderedGroups.map((groupLabel) => (
              <div key={groupLabel} className="space-y-4">
                {/* Date Group Header */}
                <div className="flex items-center gap-3 sticky top-0 bg-dark/95 backdrop-blur-md py-3 z-10 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <h3 className="text-base font-semibold text-foreground/90">
                      {groupLabel}
                    </h3>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                  <span className="text-xs text-muted-foreground">
                    {groupedNotes[groupLabel].length} {groupedNotes[groupLabel].length === 1 ? "note" : "notes"}
                  </span>
                </div>

                {/* Notes Grid */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  {groupedNotes[groupLabel].map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={() => handleEditNoteClick(note)}
                      onDelete={() => handleDeleteClick(note)}
                      onView={() => handleViewNote(note)}
                      onTogglePin={() => onTogglePin(note._id)}
                      onToggleStar={() => onToggleStar(note._id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmNote !== null}
        onOpenChange={(open) => !open && setDeleteConfirmNote(null)}
      >
        <DialogContent className="bg-dark" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Note?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmNote?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmNote(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

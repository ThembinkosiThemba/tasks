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
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        "group bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-border/50 rounded-lg p-5 transition-all duration-200",
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

            {/* Desktop: Show all icons on hover */}
            <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onView}
                title="View note"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                title="Edit note"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
                title="Delete note"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile: Show dropdown menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
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
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<MeetingNote | null>(null);

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
  }, [title, content, hasUnsavedChanges, notes, editingNote]);

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
  }, [isCreatingNew, editingNote, title, content, notes]);

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
          // Find the newly created note from the notes array
          const newNote = notes.find(note => note._id === newNoteId);
          if (newNote) {
            setEditingNote(newNote);
            setIsCreatingNew(false);
          }
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

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                  onDelete={() => handleDeleteClick(note)}
                  onView={() => handleViewNote(note)}
                />
              ))}
            </div>
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

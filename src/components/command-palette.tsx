import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutGrid,
  Calendar,
  Plus,
  CheckSquare,
  FolderKanban,
  FileText,
} from "lucide-react";
import type { Project, Task } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  tasks: Task[];
  onNavigate: (view: string) => void;
  onAddTask: () => void;
  onAddProject: () => void;
  onAddSchedule: () => void;
  onAddNote: () => void;
  onSelectTask: (task: Task) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  projects,
  tasks,
  onNavigate,
  onAddTask,
  onAddProject,
  onAddSchedule,
  onAddNote,
  onSelectTask,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  const filteredTasks = search
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : tasks.slice(0, 5);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Quick navigation and actions"
    >
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(onAddTask)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Task</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘N</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddProject)}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>New Project</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘P</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddSchedule)}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Schedule Task</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘S</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onAddNote)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>New Meeting Note</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘M</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => onNavigate("all"))}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>All Tasks</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘1</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate("daily"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Daily Schedule</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘2</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate("notes"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Meeting Notes</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘3</span>
          </CommandItem>
        </CommandGroup>

        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project._id}
                  onSelect={() => runCommand(() => onNavigate(project._id))}
                >
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {filteredTasks.map((task) => (
                <CommandItem
                  key={task._id}
                  onSelect={() => runCommand(() => onSelectTask(task))}
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span className="truncate">{task.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {task.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

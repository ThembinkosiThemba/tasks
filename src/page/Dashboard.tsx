import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar";
import { TaskList } from "@/components/task-list-new";
import { DailySchedule } from "@/components/daily-schedule";
import { MeetingNotes } from "@/components/meeting-notes";
import { TaskDialog } from "@/components/task-dialog";
import { TaskViewDialog } from "@/components/task-view-dialog";
import { ProjectDialog } from "@/components/project-dialog";
import { ScheduleDialog } from "@/components/schedule-dialog";
import { MeetingNoteDialog } from "@/components/meeting-note-dialog";
import { CommandPalette } from "@/components/command-palette";
import { MobileHeader } from "@/components/mobile-header";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import type { Task, MeetingNote } from "@/types";

export default function Dashboard() {
  const { signOut } = useAuthActions();

  // Convex queries
  const projects = useQuery(api.projects.list) ?? [];
  const tasksQuery = useQuery(api.tasks.list, {});
  const tasks = tasksQuery ?? [];
  const isTasksLoading = tasksQuery === undefined;
  const dailyTasks = useQuery(api.dailyTasks.list, {}) ?? [];
  const meetingNotes = useQuery(api.notes.list) ?? [];
  const notifications = useQuery(api.notifications.list) ?? [];
  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;

  // Convex mutations
  const createProject = useMutation(api.projects.create);
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const completeTask = useMutation(api.tasks.complete);
  const createDailyTask = useMutation(api.dailyTasks.create);
  const toggleDailyTaskComplete = useMutation(api.dailyTasks.toggleComplete);
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);
  const markNotificationAsRead = useMutation(api.notifications.markAsRead);
  const markAllNotificationsAsRead = useMutation(
    api.notifications.markAllAsRead,
  );
  const deleteNotification = useMutation(api.notifications.remove);

  const [selectedView, setSelectedView] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [viewingTask, setViewingTask] = useState<Task | undefined>();
  const [schedulingTask, setSchedulingTask] = useState<Task | undefined>();
  const [editingNote, setEditingNote] = useState<MeetingNote | undefined>();

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts for command palette and actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette (handled in CommandPalette component)
      // Cmd/Ctrl + N for new task
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setEditingTask(undefined);
        setTaskDialogOpen(true);
      }
      // Cmd/Ctrl + P for new project
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setProjectDialogOpen(true);
      }
      // Cmd/Ctrl + S for schedule task
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        setScheduleDialogOpen(true);
      }
      // Cmd/Ctrl + 1 for all tasks
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        setSelectedView("all");
      }
      // Cmd/Ctrl + 2 for daily schedule
      if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        setSelectedView("daily");
      }
      // Cmd/Ctrl + 3 for meeting notes
      if ((e.metaKey || e.ctrlKey) && e.key === "3") {
        e.preventDefault();
        setSelectedView("notes");
      }
      // Cmd/Ctrl + M for new meeting note
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        setEditingNote(undefined);
        setNoteDialogOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddProject = async (name: string, color: string) => {
    await createProject({ name, color });
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask({
        taskId: editingTask._id,
        title: taskData.title!,
        description: taskData.description,
        projectId: taskData.projectId,
        status: taskData.status!,
        priority: taskData.priority!,
        reminderDate: taskData.reminderDate,
      });
    } else {
      await createTask({
        title: taskData.title!,
        description: taskData.description,
        projectId: taskData.projectId,
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        reminderDate: taskData.reminderDate,
      });
    }
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    await deleteTask({ taskId });
  };

  const handleUpdateTaskStatus = async (
    taskId: Id<"tasks">,
    newStatus: "todo" | "in-progress" | "done",
  ) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (newStatus === "done") {
      // Use completeTask mutation for done status
      await completeTask({ taskId });
    } else {
      // Use updateTask for other statuses
      await updateTask({
        taskId,
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        status: newStatus,
        priority: task.priority,
      });
    }
  };

  const handleScheduleTask = async (
    taskId: Id<"tasks">,
    date: string,
    startTime: string,
    endTime: string,
  ) => {
    await createDailyTask({
      taskId,
      date,
      startTime,
      endTime,
      completed: false,
    });
    setSchedulingTask(undefined);
  };

  const handleToggleDailyComplete = async (dailyTaskId: Id<"dailyTasks">) => {
    await toggleDailyTaskComplete({ dailyTaskId });
  };

  const handleSaveNote = async (noteData: Partial<MeetingNote>) => {
    if (editingNote) {
      await updateNote({
        noteId: editingNote._id,
        title: noteData.title!,
        content: noteData.content!,
        date: noteData.date!,
      });
    } else {
      await createNote({
        title: noteData.title!,
        content: noteData.content!,
        date: noteData.date!,
      });
    }
    setEditingNote(undefined);
  };

  const handleDeleteNote = async (noteId: Id<"meetingNotes">) => {
    await deleteNote({ noteId });
  };

  const handleMarkNotificationAsRead = async (
    notificationId: Id<"notifications">,
  ) => {
    await markNotificationAsRead({ notificationId });
  };

  const handleMarkAllNotificationsAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDeleteNotification = async (
    notificationId: Id<"notifications">,
  ) => {
    await deleteNotification({ notificationId });
  };

  const filteredTasks =
    selectedView === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === (selectedView as Id<"projects">));

  return (
    <div className="flex flex-col h-screen bg-dark dark">
      <MobileHeader
        onMenuOpen={() => setMobileMenuOpen(true)}
        onCommandOpen={() => setCommandPaletteOpen(true)}
        notificationsSlot={
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={(id) => void handleMarkNotificationAsRead(id)}
            onMarkAllAsRead={() => void handleMarkAllNotificationsAsRead()}
            onDelete={(id) => void handleDeleteNotification(id)}
          />
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          onAddProject={() => setProjectDialogOpen(true)}
          onLogout={() => void signOut()}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {selectedView === "daily" ? (
          <DailySchedule
            tasks={tasks}
            dailyTasks={dailyTasks}
            projects={projects}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddSchedule={() => setScheduleDialogOpen(true)}
            onToggleComplete={(id) => void handleToggleDailyComplete(id)}
          />
        ) : selectedView === "notes" ? (
          <MeetingNotes
            notes={meetingNotes}
            onAddNote={() => {
              setEditingNote(undefined);
              setNoteDialogOpen(true);
            }}
            onEditNote={(note) => {
              setEditingNote(note);
              setNoteDialogOpen(true);
            }}
            onDeleteNote={(id) => void handleDeleteNote(id)}
            onSaveNote={handleSaveNote}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            projects={projects}
            onAddTask={() => {
              setEditingTask(undefined);
              setTaskDialogOpen(true);
            }}
            onViewTask={(task) => {
              setViewingTask(task);
              setTaskViewOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setTaskDialogOpen(true);
            }}
            onDeleteTask={(id) => void handleDeleteTask(id)}
            onUpdateTaskStatus={(id, status) =>
              void handleUpdateTaskStatus(id, status)
            }
            onScheduleTask={(task) => {
              setSchedulingTask(task);
              setScheduleDialogOpen(true);
            }}
            isLoading={isTasksLoading}
          />
        )}
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        projects={projects}
        tasks={tasks}
        onNavigate={setSelectedView}
        onAddTask={() => {
          setEditingTask(undefined);
          setTaskDialogOpen(true);
        }}
        onAddProject={() => setProjectDialogOpen(true)}
        onAddSchedule={() => setScheduleDialogOpen(true)}
        onAddNote={() => {
          setEditingNote(undefined);
          setNoteDialogOpen(true);
        }}
        onSelectTask={(task) => {
          setEditingTask(task);
          setTaskDialogOpen(true);
        }}
      />

      <TaskViewDialog
        open={taskViewOpen}
        onOpenChange={setTaskViewOpen}
        task={viewingTask}
        project={
          viewingTask?.projectId
            ? projects.find((p) => p._id === viewingTask.projectId)
            : undefined
        }
        onEdit={() => {
          setEditingTask(viewingTask);
          setTaskDialogOpen(true);
        }}
        onDelete={() => {
          if (viewingTask) void handleDeleteTask(viewingTask._id);
        }}
        onSchedule={() => {
          setSchedulingTask(viewingTask);
          setScheduleDialogOpen(true);
        }}
      />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        projects={projects}
        onSave={handleSaveTask}
      />

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSave={handleAddProject}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        tasks={tasks}
        selectedTask={schedulingTask}
        onSave={handleScheduleTask}
      />

      <MeetingNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        note={editingNote}
        onSave={handleSaveNote}
      />
    </div>
  );
}

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar";
import { TaskList } from "@/components/task-list";
import { DailySchedule } from "@/components/daily-schedule";
import { TaskDialog } from "@/components/task-dialog";
import { ProjectDialog } from "@/components/project-dialog";
import { ScheduleDialog } from "@/components/schedule-dialog";
import type { Task } from "@/types";

export default function Dashboard() {
  const { signOut } = useAuthActions();

  // Convex queries
  const projects = useQuery(api.projects.list) ?? [];
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const dailyTasks = useQuery(api.dailyTasks.list, {}) ?? [];

  // Convex mutations
  const createProject = useMutation(api.projects.create);
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const completeTask = useMutation(api.tasks.complete);
  const createDailyTask = useMutation(api.dailyTasks.create);
  const toggleDailyTaskComplete = useMutation(api.dailyTasks.toggleComplete);

  const [selectedView, setSelectedView] = useState<"all" | "daily" | string>(
    "all",
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [schedulingTask, setSchedulingTask] = useState<Task | undefined>();

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
      });
    } else {
      await createTask({
        title: taskData.title!,
        description: taskData.description,
        projectId: taskData.projectId,
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
      });
    }
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    await deleteTask({ taskId });
  };

  const handleToggleStatus = async (taskId: Id<"tasks">) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.status === "done") {
      // Change back to todo
      await updateTask({
        taskId,
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        status: "todo",
        priority: task.priority,
      });
    } else {
      // Mark as complete
      await completeTask({ taskId });
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

  const filteredTasks =
    selectedView === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === (selectedView as Id<"projects">));

  return (
    <div className="flex flex-col h-screen bg-dark dark">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          onAddProject={() => setProjectDialogOpen(true)}
          onLogout={() => void signOut()}
        />

        {selectedView === "daily" ? (
          <DailySchedule
            tasks={tasks}
            dailyTasks={dailyTasks}
            projects={projects}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddSchedule={() => setScheduleDialogOpen(true)}
            onToggleComplete={handleToggleDailyComplete}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            projects={projects}
            onAddTask={() => {
              setEditingTask(undefined);
              setTaskDialogOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setTaskDialogOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
            onScheduleTask={(task) => {
              setSchedulingTask(task);
              setScheduleDialogOpen(true);
            }}
          />
        )}

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
      </div>
    </div>
  );
}

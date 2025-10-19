import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Target,
  TrendingUp,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectEditDialog } from "@/components/project-edit-dialog";
import type { Task, Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

interface ProjectPageProps {
  project: Project;
  tasks: Task[];
  onUpdateProject: (
    projectId: Id<"projects">,
    name: string,
    description: string | undefined,
    color: string,
    tags: string[] | undefined,
  ) => void;
  onViewTasks: () => void;
  onBack: () => void;
}

export function ProjectPage({
  project,
  tasks,
  onUpdateProject,
  onViewTasks,
  onBack,
}: ProjectPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === project._id);
  const totalTasks = projectTasks.length;
  const todoTasks = projectTasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const reviewTasks = projectTasks.filter((t) => t.status === "review").length;
  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Close edit dialog when project changes
  useEffect(() => {
    setEditDialogOpen(false);
  }, [project._id]);

  return (
    <div className="flex-1 overflow-auto bg-dark dark">
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Project
          </Button>
        </div>

        {/* Project Info */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-offset-4 ring-offset-card"
              style={{
                backgroundColor: project.color,
                boxShadow: `0 0 0 4px ${project.color}40`,
              }}
            >
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Overview Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Project Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Tasks
                </span>
                <span className="text-2xl font-bold">{totalTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-2xl font-bold text-primary">
                  {doneTasks}
                </span>
              </div>
              {totalTasks > 0 && (
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Progress
                    </span>
                    <span className="text-sm font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Status Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">To Do</span>
                </div>
                <Badge variant="secondary">{todoTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="secondary">{inProgressTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Review</span>
                </div>
                <Badge variant="secondary">{reviewTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Done</span>
                </div>
                <Badge variant="secondary">{doneTasks}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            onClick={onViewTasks}
            size="lg"
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <ListTodo className="h-5 w-5" />
            View All Tasks
          </Button>
        </div>

        {/* Edit Dialog */}
        <ProjectEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={project}
          onSave={onUpdateProject}
        />
      </div>
    </div>
  );
}

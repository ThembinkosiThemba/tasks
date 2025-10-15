import {
  Plus,
  Calendar,
  CheckSquare,
  LogOut,
  LayoutGrid,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types";
import { useState } from "react";

interface SidebarProps {
  projects: Project[];
  selectedView: "all" | "daily" | string;
  onViewChange: (view: string) => void;
  onAddProject: () => void;
  onLogout: () => void;
}

export function Sidebar({
  projects,
  selectedView,
  onViewChange,
  onAddProject,
  onLogout,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-72 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col h-screen">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">task</h1>
            <p className="text-xs text-muted-foreground">Workspace</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          <Button
            variant={selectedView === "all" ? "secondary" : "ghost"}
            className="w-full justify-start h-10 font-medium transition-all hover:translate-x-1"
            onClick={() => onViewChange("all")}
          >
            <LayoutGrid className="mr-3 h-4 w-4" />
            All Tasks
          </Button>

          <Button
            variant={selectedView === "daily" ? "secondary" : "ghost"}
            className="w-full justify-start h-10 font-medium transition-all hover:translate-x-1"
            onClick={() => onViewChange("daily")}
          >
            <Calendar className="mr-3 h-4 w-4" />
            Daily Schedule
          </Button>
        </div>

        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground/90">
              Projects
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={onAddProject}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 bg-background/50 border-border/50 text-sm"
            />
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="space-y-1">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? "No projects found" : "No projects yet"}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <Button
                  key={project._id}
                  variant={selectedView === project._id ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 font-medium transition-all hover:translate-x-1 group"
                  onClick={() => onViewChange(project._id)}
                >
                  <div
                    className={`mr-3 h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all group-hover:scale-110 bg-[${project.color}] ring-[${project.color}40]`}
                  />
                  <span className="truncate">{project.name}</span>
                </Button>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-muted-foreground hover:text-destructive transition-all hover:translate-x-1"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

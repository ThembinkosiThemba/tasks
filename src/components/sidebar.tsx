import {
  Plus,
  Calendar,
  CheckSquare,
  LogOut,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  MoreHorizontal,
  Trash,
  BarChart3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  projects: Project[];
  selectedView: string;
  onViewChange: (view: string) => void;
  onAddProject: () => void;
  onDeleteProject: (projectId: Id<"projects">) => void;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  projects,
  selectedView,
  onViewChange,
  onAddProject,
  onDeleteProject,
  onLogout,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (onMobileClose) onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">task</h1>
              <p className="text-xs text-muted-foreground">Workspace</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-1">
        <Button
          variant={selectedView === "all" ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 font-medium transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={() => handleViewChange("all")}
          title={collapsed ? "All Tasks" : undefined}
        >
          <LayoutGrid className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "All Tasks"}
        </Button>

        <Button
          variant={selectedView === "daily" ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 font-medium transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={() => handleViewChange("daily")}
          title={collapsed ? "Daily Schedule" : undefined}
        >
          <Calendar className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Daily Schedule"}
        </Button>

        <Button
          variant={selectedView === "stats" ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 font-medium transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={() => handleViewChange("stats")}
          title={collapsed ? "Statistics" : undefined}
        >
          <BarChart3 className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Statistics"}
        </Button>

        <Button
          variant={selectedView === "lists" ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 font-medium transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={() => handleViewChange("lists")}
          title={collapsed ? "Lists" : undefined}
        >
          <List className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Lists"}
        </Button>

        <Button
          variant={selectedView === "notes" ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 font-medium transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={() => handleViewChange("notes")}
          title={collapsed ? "Notes" : undefined}
        >
          <FileText className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Notes"}
        </Button>
      </div>

      {/* Scrollable Projects Section */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          {!collapsed && (
            <>
              <div className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setProjectsExpanded(!projectsExpanded)}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground/90 hover:text-primary transition-colors"
                  >
                    {projectsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>Projects</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={onAddProject}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {projectsExpanded && (
                  <>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-9 bg-background/50 border-border/50 text-sm"
                      />
                    </div>

                    <div className="space-y-1 pb-6">
                      {filteredProjects.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          {searchQuery
                            ? "No projects found"
                            : "No projects yet"}
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <div
                            key={project._id}
                            className="group/item flex items-center gap-1"
                          >
                            <Button
                              variant={
                                selectedView === `project:${project._id}` ||
                                selectedView === project._id
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="flex-1 justify-start h-10 font-medium transition-all hover:translate-x-1 group"
                              onClick={() =>
                                handleViewChange(`project:${project._id}`)
                              }
                            >
                              <div
                                className="mr-3 h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all group-hover:scale-110"
                                style={{
                                  backgroundColor: project.color,
                                  boxShadow: `0 0 0 2px ${project.color}40`,
                                }}
                              />
                              <span className="truncate">{project.name}</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-dark dark"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject(project._id);
                                    if (selectedView === project._id) {
                                      onViewChange("all");
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </ScrollArea>

        {/* Scroll shadows (optional) */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-dark to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-dark to-transparent" />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full h-10 text-muted-foreground hover:text-destructive transition-all hover:translate-x-1",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
          onClick={onLogout}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Sign out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-border bg-dark backdrop-blur-sm flex flex-col h-screen transition-all duration-300 relative",
          "hidden lg:flex",
          collapsed ? "w-20" : "w-56",
          "lg:relative lg:translate-x-0",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-72 translate-x-0"
            : "fixed -translate-x-full",
        )}
      >
        {mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 lg:hidden z-10"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {sidebarContent}

        {/* Collapse Toggle (desktop only) */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-md hover:bg-accent z-10"
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-6 w-6" />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </Button>
        )}
      </div>
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, LayoutGrid, List, Calendar, MoreHorizontal, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateTaskDialog } from "@/components/projects/CreateTaskDialog";

type TaskStatus = "todo" | "in_progress" | "completed";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "Por Hacer", color: "bg-muted" },
  { id: "in_progress", title: "En Progreso", color: "bg-info/20" },
  { id: "completed", title: "Completado", color: "bg-success/20" },
];

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Alta" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Media" },
  low: { color: "text-info", bg: "bg-info/10", label: "Baja" },
};

const statusConfig = {
  active: { label: "Activo", color: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completado", color: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground border-muted" },
  on_hold: { label: "En Espera", color: "bg-warning/20 text-warning border-warning/30" },
};

export default function Projects() {
  const [view, setView] = useState<"kanban" | "list" | "gantt">("kanban");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: teamMembers } = useTeamMembers();
  
  const selectedProject = selectedProjectId 
    ? projects?.find(p => p.id === selectedProjectId) 
    : projects?.[0];
  
  const { data: tasks, isLoading: loadingTasks } = useTasks(selectedProject?.id);
  const { mutate: updateTask } = useUpdateTask();

  const getTasksByStatus = (status: TaskStatus) =>
    tasks?.filter((t) => t.status === status) || [];

  const getMemberInitials = (userId: string | null) => {
    if (!userId) return "?";
    const member = teamMembers?.find(m => m.id === userId);
    if (member?.full_name) {
      return member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return member?.email?.slice(0, 2).toUpperCase() || "?";
  };

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus proyectos y tareas</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar proyectos..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
          <Button variant={view === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setView("kanban")}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!projects?.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">No hay proyectos</h3>
          <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar</p>
          <CreateProjectDialog />
        </div>
      ) : (
        <Tabs value={selectedProject?.id} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 flex-wrap h-auto">
            {projects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {selectedProject && (
            <TabsContent value={selectedProject.id} className="space-y-6">
              <div className="glass rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                      <Badge className={cn("border", statusConfig[selectedProject.status].color)}>
                        {statusConfig[selectedProject.status].label}
                      </Badge>
                    </div>
                    {selectedProject.clients && (
                      <p className="text-muted-foreground">Cliente: {selectedProject.clients.name}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Progreso</p>
                    <div className="mt-2">
                      <span className="font-medium">{selectedProject.progress}%</span>
                      <Progress value={selectedProject.progress} className="h-2 mt-1" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Límite</p>
                    <p className="mt-2 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {selectedProject.end_date || "Sin fecha"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Presupuesto</p>
                    <p className="mt-2 font-medium">${Number(selectedProject.budget).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tareas</p>
                    <p className="mt-2 font-medium">{tasks?.length || 0} tareas</p>
                  </div>
                </div>
              </div>

              {view === "kanban" && (
                <div className="grid grid-cols-3 gap-4">
                  {columns.map((column) => (
                    <div key={column.id} className="space-y-3">
                      <div className={cn("rounded-lg p-3", column.color)}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{column.title}</h3>
                          <Badge variant="secondary">{getTasksByStatus(column.id).length}</Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {getTasksByStatus(column.id).map((task) => (
                          <div key={task.id} className="glass glass-hover rounded-lg p-4 cursor-pointer animate-scale-in">
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={cn("text-xs border", priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                                {priorityConfig[task.priority].label}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                {getMemberInitials(task.assigned_to)}
                              </div>
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <CreateTaskDialog projectId={selectedProject.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "list" && (
                <div className="glass rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarea</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Asignado</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.map((task) => (
                        <tr key={task.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="p-4">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">
                              {columns.find(c => c.id === task.status)?.title}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={cn("border", priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                              {priorityConfig[task.priority].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                              {getMemberInitials(task.assigned_to)}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!tasks?.length && (
                    <div className="p-8 text-center text-muted-foreground">
                      No hay tareas. <CreateTaskDialog projectId={selectedProject.id} trigger={<button className="text-primary underline">Crear una</button>} />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

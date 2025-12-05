import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  MoreHorizontal,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "todo" | "in-progress" | "review" | "completed";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: TaskStatus;
  projectId: string;
}

const projects = [
  {
    id: "1",
    name: "Rediseño Web BizTech",
    client: "BizTech Inc.",
    progress: 75,
    status: "active",
    dueDate: "15 Dic 2025",
    team: ["AD", "JM", "LC"],
    budget: 25000,
    spent: 18750,
  },
  {
    id: "2",
    name: "App Móvil E-commerce",
    client: "TechStore",
    progress: 45,
    status: "active",
    dueDate: "20 Ene 2026",
    team: ["AD", "RS"],
    budget: 45000,
    spent: 20250,
  },
  {
    id: "3",
    name: "Sistema CRM Personalizado",
    client: "Consulting Pro",
    progress: 90,
    status: "review",
    dueDate: "10 Dic 2025",
    team: ["JM", "LC", "AD"],
    budget: 35000,
    spent: 31500,
  },
];

const tasks: Task[] = [
  { id: "1", title: "Diseñar wireframes", description: "Crear wireframes para las páginas principales", assignee: "AD", priority: "high", dueDate: "8 Dic", status: "completed", projectId: "1" },
  { id: "2", title: "Desarrollar componentes UI", description: "Implementar sistema de diseño", assignee: "JM", priority: "high", dueDate: "10 Dic", status: "in-progress", projectId: "1" },
  { id: "3", title: "Integrar API", description: "Conectar frontend con backend", assignee: "LC", priority: "medium", dueDate: "12 Dic", status: "todo", projectId: "1" },
  { id: "4", title: "Testing funcional", description: "Pruebas de funcionalidad", assignee: "AD", priority: "medium", dueDate: "14 Dic", status: "todo", projectId: "1" },
  { id: "5", title: "Revisión con cliente", description: "Presentar avances", assignee: "RS", priority: "high", dueDate: "15 Dic", status: "review", projectId: "1" },
  { id: "6", title: "Deploy producción", description: "Subir a servidor", assignee: "JM", priority: "high", dueDate: "15 Dic", status: "todo", projectId: "1" },
];

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "Por Hacer", color: "bg-muted" },
  { id: "in-progress", title: "En Progreso", color: "bg-info/20" },
  { id: "review", title: "En Revisión", color: "bg-warning/20" },
  { id: "completed", title: "Completado", color: "bg-success/20" },
];

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Alta" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Media" },
  low: { color: "text-info", bg: "bg-info/10", label: "Baja" },
};

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [view, setView] = useState<"kanban" | "list" | "gantt">("kanban");

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status && t.projectId === selectedProject.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus proyectos y tareas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar proyectos..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
            className={view === "kanban" ? "" : "text-muted-foreground"}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className={view === "list" ? "" : "text-muted-foreground"}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "gantt" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("gantt")}
            className={view === "gantt" ? "" : "text-muted-foreground"}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs defaultValue={selectedProject.id} className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          {projects.map((project) => (
            <TabsTrigger
              key={project.id}
              value={project.id}
              onClick={() => setSelectedProject(project)}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {project.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {projects.map((project) => (
          <TabsContent key={project.id} value={project.id} className="space-y-6">
            {/* Project Info Card */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{project.name}</h2>
                    <Badge
                      className={cn(
                        "border",
                        project.status === "active" && "bg-primary/20 text-primary border-primary/30",
                        project.status === "review" && "bg-warning/20 text-warning border-warning/30"
                      )}
                    >
                      {project.status === "active" ? "Activo" : "En Revisión"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">Cliente: {project.client}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Progreso</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Límite</p>
                  <p className="mt-2 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {project.dueDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Equipo</p>
                  <div className="flex -space-x-2 mt-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Presupuesto</p>
                  <p className="mt-2 font-medium">
                    ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            {view === "kanban" && (
              <div className="grid grid-cols-4 gap-4">
                {columns.map((column) => (
                  <div key={column.id} className="space-y-3">
                    <div className={cn("rounded-lg p-3", column.color)}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{column.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getTasksByStatus(column.id).length}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {getTasksByStatus(column.id).map((task) => (
                        <div
                          key={task.id}
                          className="glass glass-hover rounded-lg p-4 cursor-pointer animate-scale-in"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge
                              className={cn(
                                "text-xs border",
                                priorityConfig[task.priority].bg,
                                priorityConfig[task.priority].color
                              )}
                            >
                              {priorityConfig[task.priority].label}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                              {task.assignee}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        className="w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Tarea
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
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
                    {tasks.filter(t => t.projectId === project.id).map((task) => (
                      <tr key={task.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className={cn(
                            task.status === "completed" && "bg-success/20 text-success",
                            task.status === "in-progress" && "bg-info/20 text-info",
                            task.status === "review" && "bg-warning/20 text-warning",
                            task.status === "todo" && "bg-muted text-muted-foreground"
                          )}>
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
                            {task.assignee}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{task.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Gantt View Placeholder */}
            {view === "gantt" && (
              <div className="glass rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Vista Gantt</h3>
                <p className="text-muted-foreground">
                  La vista de diagrama Gantt estará disponible próximamente.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

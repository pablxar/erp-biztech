import { useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Clock,
  Loader2,
  Edit,
  Trash2,
  GripVertical,
  Calendar,
  DollarSign,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects, useDeleteProject, Project } from "@/hooks/useProjects";
import { useTasks, useUpdateTask, Task } from "@/hooks/useTasks";

import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateTaskDialog } from "@/components/projects/CreateTaskDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { EditTaskDialog } from "@/components/projects/EditTaskDialog";
import { TaskAssigneesDisplay } from "@/components/projects/TaskAssigneesDisplay";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

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
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  
  // Delete states
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Drag and drop
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<TaskStatus | null>(null);
  
  const { data: projects, isLoading: loadingProjects } = useProjects();
  
  const deleteProject = useDeleteProject();
  
  // Filter projects
  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const selectedProject = selectedProjectId 
    ? projects?.find(p => p.id === selectedProjectId) 
    : filteredProjects[0];
  
  const { data: tasks, isLoading: loadingTasks } = useTasks(selectedProject?.id);
  const { mutate: updateTask } = useUpdateTask();

  const getTasksByStatus = (status: TaskStatus) =>
    tasks?.filter((t) => t.status === status) || [];

  // Drag handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetColumn(status);
  };

  const handleDragLeave = () => {
    setDropTargetColumn(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    setDropTargetColumn(null);
    
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    updateTask(
      { id: draggedTask.id, status },
      { onSuccess: () => toast.success("Tarea movida") }
    );
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDropTargetColumn(null);
  };

  // Action handlers
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditProjectOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id, {
        onSuccess: () => {
          setDeleteProjectOpen(false);
          setProjectToDelete(null);
          if (selectedProjectId === projectToDelete.id) {
            setSelectedProjectId(null);
          }
        },
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
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
          <Input 
            placeholder="Buscar proyectos..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      {!filteredProjects.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? "No se encontraron proyectos" : "No hay proyectos"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Intenta con otro término de búsqueda" : "Crea tu primer proyecto para comenzar"}
          </p>
          {!searchQuery && <CreateProjectDialog />}
        </div>
      ) : (
        <Tabs value={selectedProject?.id} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 flex-wrap h-auto gap-1">
            {filteredProjects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  project.status === "active" && "bg-primary",
                  project.status === "completed" && "bg-success",
                  project.status === "pending" && "bg-muted-foreground",
                  project.status === "on_hold" && "bg-warning"
                )} />
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {selectedProject && (
            <TabsContent value={selectedProject.id} className="space-y-6">
              {/* Project Header Card */}
              <div 
                className="glass rounded-xl p-6 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group"
                onClick={() => handleEditProject(selectedProject)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {selectedProject.name}
                      </h2>
                      <Badge className={cn("border", statusConfig[selectedProject.status].color)}>
                        {statusConfig[selectedProject.status].label}
                      </Badge>
                    </div>
                    {selectedProject.description && (
                      <p className="text-muted-foreground text-sm">{selectedProject.description}</p>
                    )}
                    {selectedProject.clients && (
                      <p className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Cliente: <span className="font-medium">{selectedProject.clients.name}</span>
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => handleEditProject(selectedProject)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar proyecto
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(selectedProject)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar proyecto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Progreso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{selectedProject.progress || 0}%</span>
                      <Progress value={selectedProject.progress || 0} className="h-2 flex-1" />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Fecha Límite</span>
                    </div>
                    <p className="font-semibold">
                      {selectedProject.end_date 
                        ? format(new Date(selectedProject.end_date), "d MMM yyyy", { locale: es })
                        : "Sin fecha"
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs">Presupuesto</span>
                    </div>
                    <p className="font-semibold">${Number(selectedProject.budget || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-xs">Tareas</span>
                    </div>
                    <p className="font-semibold">
                      {tasks?.filter(t => t.status === 'completed').length || 0} / {tasks?.length || 0}
                      <span className="text-xs text-muted-foreground ml-1">completadas</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Clic para editar proyecto →
                </p>
              </div>

              {/* Kanban View */}
              {view === "kanban" && (
                <div>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                    <GripVertical className="w-3 h-3" />
                    Arrastra las tareas para cambiar su estado
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map((column) => (
                      <div 
                        key={column.id} 
                        className="space-y-3"
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                      >
                        <div className={cn("rounded-lg p-3", column.color)}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{column.title}</h3>
                            <Badge variant="secondary">{getTasksByStatus(column.id).length}</Badge>
                          </div>
                        </div>
                        <div 
                          className={cn(
                            "space-y-3 min-h-[200px] p-2 rounded-lg transition-colors",
                            dropTargetColumn === column.id && "bg-primary/10 ring-2 ring-primary ring-dashed"
                          )}
                        >
                          {getTasksByStatus(column.id).map((task) => (
                            <div 
                              key={task.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onDragEnd={handleDragEnd}
                              onClick={() => handleEditTask(task)}
                              className={cn(
                                "glass glass-hover rounded-lg p-4 cursor-pointer animate-scale-in group",
                                "hover:ring-2 hover:ring-primary/50 transition-all",
                                draggedTask?.id === task.id && "opacity-50"
                              )}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={cn("text-xs border", priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                                  {priorityConfig[task.priority].label}
                                </Badge>
                                <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                              </div>
                              <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <TaskAssigneesDisplay taskId={task.id} size="sm" max={3} />
                                {task.due_date && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(task.due_date), "d MMM", { locale: es })}
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
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.map((task) => (
                        <tr 
                          key={task.id} 
                          className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer"
                          onClick={() => handleEditTask(task)}
                        >
                          <td className="p-4">
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                            )}
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
                            <TaskAssigneesDisplay taskId={task.id} size="md" max={4} />
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {task.due_date 
                              ? format(new Date(task.due_date), "d MMM yyyy", { locale: es })
                              : '-'
                            }
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon" onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
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

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={isEditProjectOpen}
        onOpenChange={setIsEditProjectOpen}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
      />

      {/* Delete Project Confirmation */}
      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el proyecto <strong>{projectToDelete?.name}</strong> y todas sus tareas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
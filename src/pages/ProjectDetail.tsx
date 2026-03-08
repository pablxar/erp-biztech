import { useState, useMemo, DragEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
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
  LayoutGrid,
  List,
  Code2,
  Megaphone,
  Video,
  Globe,
  Plus,
  Building,
  Mail,
  Phone,
  Banknote,
  ArrowUpRight,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject, useDeleteProject, Project } from "@/hooks/useProjects";
import { useTasks, useUpdateTask, Task } from "@/hooks/useTasks";
import { useTransactions } from "@/hooks/useTransactions";
import { CreateTaskDialog } from "@/components/projects/CreateTaskDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { EditTaskDialog } from "@/components/projects/EditTaskDialog";
import { RegisterPaymentDialog } from "@/components/projects/RegisterPaymentDialog";
import { TaskAssigneesDisplay } from "@/components/projects/TaskAssigneesDisplay";
import { formatCurrency, PAYMENT_STATUS_CONFIG } from "@/lib/servicePricing";
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

const serviceTypeConfig = {
  software_development: { 
    label: "Desarrollo de Software", 
    icon: Code2, 
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "ERP, CRM, SCM, Apps Internas"
  },
  digital_marketing: { 
    label: "Marketing Digital", 
    icon: Megaphone, 
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Meta Ads, Google Ads, Email Marketing, CRO"
  },
  audiovisual: { 
    label: "Audiovisual", 
    icon: Video, 
    color: "text-warning",
    bgColor: "bg-warning/10",
    description: "Videos, Fotografía y Contenido Visual"
  },
  web_development: { 
    label: "Web Development", 
    icon: Globe, 
    color: "text-info",
    bgColor: "bg-info/10",
    description: "E-commerce y Landing Pages"
  },
};

type ServiceType = keyof typeof serviceTypeConfig;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [activeTab, setActiveTab] = useState("tasks");
  
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<TaskStatus | null>(null);
  
  const { data: project, isLoading: loadingProject } = useProject(id || "");
  const { data: tasks, isLoading: loadingTasks } = useTasks(id);
  const { data: allTransactions } = useTransactions();
  const { mutate: updateTask } = useUpdateTask();
  const deleteProject = useDeleteProject();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Project payment transactions
  const projectPayments = useMemo(() => {
    if (!allTransactions || !id) return [];
    return allTransactions.filter(
      (t) => t.project_id === id && t.type === "income"
    );
  }, [allTransactions, id]);

  const totalPaid = useMemo(
    () => projectPayments.reduce((sum, t) => sum + Number(t.amount), 0),
    [projectPayments]
  );

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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
  };

  const confirmDeleteProject = () => {
    if (project) {
      deleteProject.mutate(project.id, {
        onSuccess: () => {
          setDeleteProjectOpen(false);
          navigate("/projects");
        },
      });
    }
  };

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Proyecto no encontrado</h2>
        <p className="text-muted-foreground mb-4">El proyecto que buscas no existe o fue eliminado.</p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a proyectos
        </Button>
      </div>
    );
  }

  const serviceConfig = project.service_type 
    ? serviceTypeConfig[project.service_type as ServiceType] 
    : null;
  const ServiceIcon = serviceConfig?.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/projects" className="hover:text-foreground transition-colors">
              Proyectos
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{project.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditProjectOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDeleteProjectOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar proyecto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Header */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left: Project Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              {ServiceIcon && (
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", serviceConfig?.bgColor)}>
                  <ServiceIcon className={cn("w-7 h-7", serviceConfig?.color)} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <Badge className={cn("border", statusConfig[project.status].color)}>
                    {statusConfig[project.status].label}
                  </Badge>
                </div>
                {serviceConfig && (
                  <p className={cn("text-sm", serviceConfig.color)}>{serviceConfig.label}</p>
                )}
              </div>
            </div>
            {project.description && (
              <p className="text-muted-foreground mb-4">{project.description}</p>
            )}
            
            {/* Client Info */}
            {project.clients && (
              <div className="glass rounded-lg p-4 bg-secondary/30">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Cliente</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {project.clients.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{project.clients.name}</p>
                    {project.clients.company && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {project.clients.company}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-64">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Progreso</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{project.progress || 0}%</span>
                <Progress value={project.progress || 0} className="h-2 flex-1" />
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Fecha Límite</span>
              </div>
              <p className="text-lg font-semibold">
                {project.end_date 
                  ? format(new Date(project.end_date), "d MMM yyyy", { locale: es })
                  : "Sin definir"
                }
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Cobros</span>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(totalPaid)}
                <span className="text-muted-foreground font-normal text-sm"> / {formatCurrency(Number(project.budget || 0))}</span>
              </p>
              {Number(project.budget) > 0 && (
                <Progress value={(totalPaid / Number(project.budget)) * 100} className="h-1.5 mt-2" />
              )}
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Tareas</span>
              </div>
              <p className="text-lg font-semibold">
                {tasks?.filter(t => t.status === 'completed').length || 0}
                <span className="text-muted-foreground font-normal"> / {tasks?.length || 0}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              Pagos
              {projectPayments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {projectPayments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
          </TabsList>
          
          {activeTab === "tasks" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                <Button 
                  variant={view === "kanban" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setView("kanban")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={view === "list" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setView("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <CreateTaskDialog projectId={project.id} />
            </div>
          )}
        </div>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          {loadingTasks ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : view === "kanban" ? (
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
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleEditTask(task)}
                          isDragging={draggedTask?.id === task.id}
                        />
                      ))}
                      {getTasksByStatus(column.id).length === 0 && (
                        <div className="h-20 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-lg">
                          Sin tareas
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarea</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridad</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Asignados</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks?.map((task) => (
                    <tr 
                      key={task.id}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => handleEditTask(task)}
                    >
                      <td className="p-4">
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn(
                          task.status === 'completed' && "border-success/30 text-success",
                          task.status === 'in_progress' && "border-info/30 text-info",
                          task.status === 'todo' && "border-muted text-muted-foreground",
                        )}>
                          {task.status === 'todo' && "Por hacer"}
                          {task.status === 'in_progress' && "En progreso"}
                          {task.status === 'completed' && "Completado"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={cn("text-xs border", priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                          {priorityConfig[task.priority].label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <TaskAssigneesDisplay taskId={task.id} size="sm" max={3} />
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {task.due_date 
                            ? format(new Date(task.due_date), "d MMM", { locale: es })
                            : "-"
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!tasks || tasks.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        <p className="mb-2">No hay tareas en este proyecto</p>
                        <CreateTaskDialog projectId={project.id} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4 space-y-6">
          {/* Payment Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-success/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Estado de Cobro</h3>
                      <Badge className={cn("border mt-1", PAYMENT_STATUS_CONFIG[project.payment_status as keyof typeof PAYMENT_STATUS_CONFIG]?.color || "bg-muted text-muted-foreground")}>
                        {PAYMENT_STATUS_CONFIG[project.payment_status as keyof typeof PAYMENT_STATUS_CONFIG]?.label || "Sin estado"}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress bar with labels */}
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Cobrado</p>
                        <p className="text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(Number(project.budget || 0))}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress
                        value={Number(project.budget) > 0 ? (totalPaid / Number(project.budget)) * 100 : 0}
                        className="h-4 rounded-full"
                      />
                      {Number(project.budget) > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground mix-blend-difference">
                          {Math.round((totalPaid / Number(project.budget)) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {project.payment_status !== 'paid' && Number(project.budget) > 0 && (
                  <Button
                    size="lg"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="gap-2 shadow-lg shrink-0 h-12 px-6"
                  >
                    <Banknote className="w-5 h-5" />
                    Registrar Cobro
                  </Button>
                )}
                {project.payment_status === 'paid' && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 text-success shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold text-sm">Cobro Completo</span>
                  </div>
                )}
              </div>

              {/* Summary metrics */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 rounded-xl bg-background/80 border border-border/30 backdrop-blur-sm text-center">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Precio Acordado</p>
                  <p className="font-bold text-base">{formatCurrency(Number(project.budget || 0))}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-center">
                  <p className="text-[10px] font-medium text-success uppercase tracking-wider mb-1">Cobrado</p>
                  <p className="font-bold text-base text-success">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/5 border border-warning/20 text-center">
                  <p className="text-[10px] font-medium text-warning uppercase tracking-wider mb-1">Pendiente</p>
                  <p className="font-bold text-base text-warning">
                    {formatCurrency(Math.max(0, Number(project.budget || 0) - totalPaid))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Timeline */}
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Historial de Cobros
              </h3>
              {projectPayments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {projectPayments.length} {projectPayments.length === 1 ? 'cobro' : 'cobros'}
                </Badge>
              )}
            </div>
            {projectPayments.length > 0 ? (
              <div className="p-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />
                  
                  <div className="space-y-1">
                    {projectPayments.map((payment, index) => {
                      const isLast = index === projectPayments.length - 1;
                      const runningTotal = projectPayments
                        .slice(0, index + 1)
                        .reduce((sum, p) => sum + Number(p.amount), 0);
                      const budgetTotal = Number(project.budget) || 0;
                      const progressAtPoint = budgetTotal > 0 ? (runningTotal / budgetTotal) * 100 : 0;
                      
                      return (
                        <div
                          key={payment.id}
                          className="relative flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors group"
                        >
                          {/* Timeline dot */}
                          <div className={cn(
                            "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                            isLast 
                              ? "bg-success/10 border-success" 
                              : "bg-background border-border group-hover:border-primary"
                          )}>
                            <ArrowUpRight className={cn(
                              "w-4 h-4",
                              isLast ? "text-success" : "text-muted-foreground group-hover:text-primary"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{payment.description}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(payment.date), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                              </div>
                              <span className="font-bold text-success whitespace-nowrap text-sm">
                                +{formatCurrency(Number(payment.amount))}
                              </span>
                            </div>
                            {/* Mini progress at this point */}
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={progressAtPoint} className="h-1 flex-1" />
                              <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">
                                {Math.round(progressAtPoint)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="font-semibold mb-1">Sin cobros registrados</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Los cobros aparecerán aquí cuando se registren
                </p>
                {project.payment_status !== 'paid' && Number(project.budget) > 0 && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <Banknote className="w-4 h-4" />
                    Registrar primer cobro
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">Detalles del Proyecto</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nombre</p>
                  <p className="font-medium">{project.name}</p>
                </div>
                {project.description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descripción</p>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}
                {serviceConfig && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo de Servicio</p>
                    <div className="flex items-center gap-2">
                      <ServiceIcon className={cn("w-4 h-4", serviceConfig.color)} />
                      <span className="font-medium">{serviceConfig.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{serviceConfig.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha Inicio</p>
                    <p className="font-medium">
                      {project.start_date 
                        ? format(new Date(project.start_date), "d MMM yyyy", { locale: es })
                        : "-"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha Fin</p>
                    <p className="font-medium">
                      {project.end_date 
                        ? format(new Date(project.end_date), "d MMM yyyy", { locale: es })
                        : "-"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {project.clients && (
              <div className="glass rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold mb-4">Información del Cliente</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {project.clients.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-lg">{project.clients.name}</p>
                    {project.clients.company && (
                      <p className="text-sm text-muted-foreground">{project.clients.company}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/clients`)}>
                  Ver perfil del cliente
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {project && (
        <EditProjectDialog
          project={project}
          open={isEditProjectOpen}
          onOpenChange={setIsEditProjectOpen}
        />
      )}

      {project && (
        <RegisterPaymentDialog
          project={project}
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          previousPayments={totalPaid}
        />
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={isEditTaskOpen}
          onOpenChange={(open) => {
            setIsEditTaskOpen(open);
            if (!open) setEditingTask(null);
          }}
        />
      )}

      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto
              <span className="font-medium text-foreground"> "{project?.name}"</span> y 
              todas sus tareas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProject}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  onDragStart: (e: DragEvent<HTMLDivElement>, task: Task) => void;
  onDragEnd: () => void;
  onClick: () => void;
  isDragging: boolean;
}

function TaskCard({ task, onDragStart, onDragEnd, onClick, isDragging }: TaskCardProps) {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "glass rounded-lg p-4 cursor-pointer group",
        "hover:ring-2 hover:ring-primary/50 transition-all",
        "border border-border/50",
        isDragging && "opacity-50"
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
  );
}
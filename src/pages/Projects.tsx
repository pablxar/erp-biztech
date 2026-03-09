import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Edit,
  Trash2,
  Calendar,
  Users,
  ArrowRight,
  Code2,
  Megaphone,
  Video,
  Globe,
  Filter,
  SortAsc,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects, useDeleteProject, Project } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PAYMENT_STATUS_CONFIG, PaymentStatus } from "@/lib/servicePricing";

const statusConfig = {
  active: { label: "Activo", color: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completado", color: "bg-success/20 text-success border-success/30" },
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground border-muted" },
  on_hold: { label: "En Espera", color: "bg-warning/20 text-warning border-warning/30" },
};

const serviceTypeConfig = {
  software_development: { 
    label: "Desarrollo de Software", 
    shortLabel: "Software",
    icon: Code2, 
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "ERP, CRM, SCM, Apps Internas"
  },
  digital_marketing: { 
    label: "Marketing Digital", 
    shortLabel: "Marketing",
    icon: Megaphone, 
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Meta Ads, Google Ads, Email Marketing, CRO"
  },
  audiovisual: { 
    label: "Audiovisual", 
    shortLabel: "Audiovisual",
    icon: Video, 
    color: "text-warning",
    bgColor: "bg-warning/10",
    description: "Videos, Fotografía y Contenido Visual"
  },
  web_development: { 
    label: "Web Development", 
    shortLabel: "Web",
    icon: Globe, 
    color: "text-info",
    bgColor: "bg-info/10",
    description: "E-commerce y Landing Pages"
  },
};

type ServiceType = keyof typeof serviceTypeConfig;

export default function Projects() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects || [];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.clients?.name?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus !== "all") {
      result = result.filter(p => p.status === filterStatus);
    }
    
    // Service filter
    if (filterService !== "all") {
      result = result.filter(p => p.service_type === filterService);
    }
    
    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        case "deadline":
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        default:
          return 0;
      }
    });
    
    return result;
  }, [projects, searchQuery, filterStatus, filterService, sortBy]);

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsEditProjectOpen(true);
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteProjectOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id, {
        onSuccess: () => {
          setDeleteProjectOpen(false);
          setProjectToDelete(null);
        },
      });
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Stats
  const stats = useMemo(() => {
    const all = projects || [];
    return {
      total: all.length,
      active: all.filter(p => p.status === 'active').length,
      completed: all.filter(p => p.status === 'completed').length,
      pending: all.filter(p => p.status === 'pending' || p.status === 'on_hold').length,
    };
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1 text-sm hidden sm:block">
            Gestiona todos los proyectos de tus clientes
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
          <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-xl lg:text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-primary/20">
          <p className="text-[10px] lg:text-xs text-primary uppercase tracking-wider">Activos</p>
          <p className="text-xl lg:text-2xl font-bold mt-1 text-primary">{stats.active}</p>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-success/20">
          <p className="text-[10px] lg:text-xs text-success uppercase tracking-wider">Completados</p>
          <p className="text-xl lg:text-2xl font-bold mt-1 text-success">{stats.completed}</p>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-muted">
          <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">Pendientes</p>
          <p className="text-xl lg:text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 bg-secondary/50 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[110px] lg:w-[140px] bg-secondary/50 h-9 text-xs lg:text-sm">
            <Filter className="w-3.5 h-3.5 mr-1 lg:mr-2 flex-shrink-0" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="on_hold">En Espera</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterService} onValueChange={setFilterService}>
          <SelectTrigger className="w-[120px] lg:w-[160px] bg-secondary/50 h-9 text-xs lg:text-sm hidden sm:flex">
            <SelectValue placeholder="Servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="software_development">Software</SelectItem>
            <SelectItem value="digital_marketing">Marketing</SelectItem>
            <SelectItem value="audiovisual">Audiovisual</SelectItem>
            <SelectItem value="web_development">Web</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[110px] lg:w-[140px] bg-secondary/50 h-9 text-xs lg:text-sm hidden sm:flex">
            <SortAsc className="w-3.5 h-3.5 mr-1 lg:mr-2 flex-shrink-0" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
            <SelectItem value="progress">Progreso</SelectItem>
            <SelectItem value="deadline">Fecha límite</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg ml-auto">
          <Button 
            variant={view === "grid" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setView("grid")}
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
      </div>

      {/* Projects Grid/List */}
      {!filteredAndSortedProjects.length ? (
        <div className="glass rounded-xl p-12 text-center border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || filterStatus !== "all" || filterService !== "all" 
              ? "No se encontraron proyectos" 
              : "No hay proyectos"
            }
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || filterStatus !== "all" || filterService !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Crea tu primer proyecto para comenzar a gestionar el trabajo de tus clientes"
            }
          </p>
          {!searchQuery && filterStatus === "all" && filterService === "all" && (
            <CreateProjectDialog />
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onView={() => handleViewProject(project.id)}
              onEdit={(e) => handleEditProject(project, e)}
              onDelete={(e) => handleDeleteProject(project, e)}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Proyecto</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Cliente</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Servicio</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Progreso</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Fecha Límite</th>
                <th className="text-right p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => handleViewProject(project.id)}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-sm">{project.clients?.name || "-"}</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {project.service_type && serviceTypeConfig[project.service_type as ServiceType] && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = serviceTypeConfig[project.service_type as ServiceType];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className={cn("w-4 h-4", config.color)} />
                              <span className="text-sm">{config.shortLabel}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className={cn("text-xs border", statusConfig[project.status].color)}>
                      {statusConfig[project.status].label}
                    </Badge>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={project.progress || 0} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="text-sm text-muted-foreground">
                      {project.end_date 
                        ? format(new Date(project.end_date), "d MMM yyyy", { locale: es })
                        : "-"
                      }
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleEditProject(project, e as any)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteProject(project, e as any)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={isEditProjectOpen}
          onOpenChange={(open) => {
            setIsEditProjectOpen(open);
            if (!open) setEditingProject(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto
              <span className="font-medium text-foreground"> "{projectToDelete?.name}"</span> y 
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

// Project Card Component
interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const serviceConfig = project.service_type 
    ? serviceTypeConfig[project.service_type as ServiceType] 
    : null;
  const ServiceIcon = serviceConfig?.icon;

  return (
    <div 
      onClick={onView}
      className="glass rounded-xl p-5 border border-border/50 cursor-pointer group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {ServiceIcon && (
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", serviceConfig?.bgColor)}>
              <ServiceIcon className={cn("w-5 h-5", serviceConfig?.color)} />
            </div>
          )}
          {!ServiceIcon && (
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <Badge className={cn("text-xs border", statusConfig[project.status].color)}>
            {statusConfig[project.status].label}
          </Badge>
          {project.payment_status && PAYMENT_STATUS_CONFIG[project.payment_status as PaymentStatus] && (
            <Badge className={cn("text-xs border", PAYMENT_STATUS_CONFIG[project.payment_status as PaymentStatus].color)}>
              {PAYMENT_STATUS_CONFIG[project.payment_status as PaymentStatus].label}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
      )}
      {!project.description && <div className="mb-4" />}

      {/* Client */}
      {project.clients && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span>{project.clients.name}</span>
          {project.clients.company && (
            <span className="text-xs">• {project.clients.company}</span>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium">{project.progress || 0}%</span>
        </div>
        <Progress value={project.progress || 0} className="h-1.5" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {project.end_date 
            ? format(new Date(project.end_date), "d MMM yyyy", { locale: es })
            : "Sin fecha límite"
          }
        </div>
        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Ver proyecto
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
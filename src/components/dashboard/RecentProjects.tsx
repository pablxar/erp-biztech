import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Calendar, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig = {
  active: { 
    label: "En Progreso", 
    className: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary"
  },
  pending: { 
    label: "Pendiente", 
    className: "bg-muted text-muted-foreground border-muted",
    dot: "bg-muted-foreground"
  },
  on_hold: { 
    label: "En Espera", 
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-500"
  },
  completed: { 
    label: "Completado", 
    className: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary"
  },
};

export function RecentProjects() {
  const { data: projects, isLoading } = useProjects();

  const recentProjects = projects?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Proyectos Recientes</h3>
              <p className="text-xs text-muted-foreground">{projects?.length || 0} proyectos totales</p>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No hay proyectos aún</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Crea tu primer proyecto</p>
            </div>
          ) : (
            recentProjects.map((project, index) => {
              const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending;
              const progress = project.progress || 0;
              
              return (
                <Link
                  to={`/projects/${project.id}`}
                  key={project.id}
                  className={cn(
                    "group block p-4 rounded-xl",
                    "bg-gradient-to-r from-secondary/50 to-secondary/30",
                    "border border-border/30 hover:border-primary/30",
                    "transition-all duration-300",
                    "hover:shadow-lg hover:shadow-primary/5"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {project.clients?.name || 'Sin cliente'}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("ml-3 border flex items-center gap-1.5", config.className)}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className={cn(
                        "font-semibold",
                        progress >= 80 ? "text-primary" : progress >= 50 ? "text-info" : "text-muted-foreground"
                      )}>
                        {progress}%
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                          progress >= 80 ? "bg-gradient-to-r from-primary to-primary/80" : 
                          progress >= 50 ? "bg-gradient-to-r from-info to-info/80" : 
                          "bg-gradient-to-r from-muted-foreground to-muted-foreground/80"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  {project.end_date && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Vence: {format(new Date(project.end_date), "d MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <Link 
          to="/projects" 
          className="flex items-center justify-center gap-2 mt-4 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          Ver todos los proyectos
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

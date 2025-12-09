import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  active: { label: "En Progreso", variant: "default" as const, className: "bg-primary/20 text-primary border-primary/30" },
  pending: { label: "Pendiente", variant: "outline" as const, className: "bg-muted text-muted-foreground border-muted" },
  on_hold: { label: "En Espera", variant: "secondary" as const, className: "bg-warning/20 text-warning border-warning/30" },
  completed: { label: "Completado", variant: "default" as const, className: "bg-success/20 text-success border-success/30" },
};

export function RecentProjects() {
  const { data: projects, isLoading } = useProjects();

  const recentProjects = projects?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Proyectos Recientes</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Proyectos Recientes</h3>
        <a href="/projects" className="text-sm text-primary hover:underline">
          Ver todos
        </a>
      </div>

      <div className="space-y-4">
        {recentProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay proyectos aún</p>
        ) : (
          recentProjects.map((project, index) => {
            const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending;
            return (
              <div
                key={project.id}
                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.clients?.name || 'Sin cliente'}</p>
                  </div>
                  <Badge variant={config.variant} className={cn("border", config.className)}>
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                {project.end_date && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Vence: {format(new Date(project.end_date), "d MMM yyyy", { locale: es })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

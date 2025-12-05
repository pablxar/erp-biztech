import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: 1,
    name: "Rediseño Web BizTech",
    client: "BizTech Inc.",
    progress: 75,
    status: "active",
    dueDate: "15 Dic 2025",
  },
  {
    id: 2,
    name: "App Móvil E-commerce",
    client: "TechStore",
    progress: 45,
    status: "active",
    dueDate: "20 Ene 2026",
  },
  {
    id: 3,
    name: "Sistema CRM Personalizado",
    client: "Consulting Pro",
    progress: 90,
    status: "review",
    dueDate: "10 Dic 2025",
  },
  {
    id: 4,
    name: "Dashboard Analytics",
    client: "DataViz Corp",
    progress: 30,
    status: "pending",
    dueDate: "28 Feb 2026",
  },
];

const statusConfig = {
  active: { label: "En Progreso", variant: "default" as const },
  review: { label: "En Revisión", variant: "secondary" as const },
  pending: { label: "Pendiente", variant: "outline" as const },
  completed: { label: "Completado", variant: "default" as const },
};

export function RecentProjects() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Proyectos Recientes</h3>
        <a href="/projects" className="text-sm text-primary hover:underline">
          Ver todos
        </a>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              <Badge
                variant={statusConfig[project.status as keyof typeof statusConfig].variant}
                className={cn(
                  project.status === "active" && "bg-primary/20 text-primary border-primary/30",
                  project.status === "review" && "bg-warning/20 text-warning border-warning/30",
                  project.status === "completed" && "bg-success/20 text-success border-success/30"
                )}
              >
                {statusConfig[project.status as keyof typeof statusConfig].label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Vence: {project.dueDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Flag } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Revisar diseño de landing page",
    project: "Rediseño Web BizTech",
    priority: "high",
    dueDate: "Hoy",
    completed: false,
  },
  {
    id: 2,
    title: "Preparar presentación para cliente",
    project: "Sistema CRM Personalizado",
    priority: "high",
    dueDate: "Mañana",
    completed: false,
  },
  {
    id: 3,
    title: "Actualizar documentación API",
    project: "App Móvil E-commerce",
    priority: "medium",
    dueDate: "12 Dic",
    completed: false,
  },
  {
    id: 4,
    title: "Testing módulo de pagos",
    project: "App Móvil E-commerce",
    priority: "high",
    dueDate: "14 Dic",
    completed: true,
  },
  {
    id: 5,
    title: "Reunión de seguimiento",
    project: "Dashboard Analytics",
    priority: "low",
    dueDate: "15 Dic",
    completed: false,
  },
];

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10" },
  medium: { color: "text-warning", bg: "bg-warning/10" },
  low: { color: "text-info", bg: "bg-info/10" },
};

export function TasksList() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tareas Pendientes</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {tasks.filter((t) => !t.completed).length} pendientes
        </Badge>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-all",
              task.completed
                ? "bg-secondary/20 opacity-60"
                : "bg-secondary/30 hover:bg-secondary/50"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Checkbox
              checked={task.completed}
              className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium text-sm",
                  task.completed && "line-through"
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {task.project}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={cn(
                  "p-1.5 rounded",
                  priorityConfig[task.priority as keyof typeof priorityConfig].bg
                )}
              >
                <Flag
                  className={cn(
                    "w-3 h-3",
                    priorityConfig[task.priority as keyof typeof priorityConfig].color
                  )}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {task.dueDate}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

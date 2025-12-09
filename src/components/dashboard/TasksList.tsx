import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Clock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const priorityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10" },
  medium: { color: "text-warning", bg: "bg-warning/10" },
  low: { color: "text-info", bg: "bg-info/10" },
};

export function TasksList() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  // Get pending tasks first, then completed (limit to 5)
  const sortedTasks = [...(tasks || [])]
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    })
    .slice(0, 5);

  const pendingCount = tasks?.filter(t => t.status !== 'completed').length || 0;

  const formatDueDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return "Hoy";
    if (isTomorrow(d)) return "Mañana";
    const diff = differenceInDays(d, new Date());
    if (diff < 0) return "Vencida";
    if (diff < 7) return format(d, "EEEE", { locale: es });
    return format(d, "d MMM", { locale: es });
  };

  const handleToggleComplete = (taskId: string, currentStatus: string) => {
    updateTask.mutate({
      id: taskId,
      status: currentStatus === 'completed' ? 'todo' : 'completed',
    });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Tareas Pendientes</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Tareas Pendientes</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {pendingCount} pendientes
        </Badge>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay tareas aún</p>
        ) : (
          sortedTasks.map((task, index) => {
            const isCompleted = task.status === 'completed';
            const dueLabel = formatDueDate(task.due_date);
            
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all",
                  isCompleted
                    ? "bg-secondary/20 opacity-60"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", isCompleted && "line-through")}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.projects?.name || 'Sin proyecto'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={cn("p-1.5 rounded", priorityConfig[task.priority as keyof typeof priorityConfig]?.bg || priorityConfig.medium.bg)}>
                    <Flag className={cn("w-3 h-3", priorityConfig[task.priority as keyof typeof priorityConfig]?.color || priorityConfig.medium.color)} />
                  </div>
                  {dueLabel && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {dueLabel}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

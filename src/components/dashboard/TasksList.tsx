import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Clock, Flag, CheckCircle2, ArrowRight, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

const priorityConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Alta" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Media" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Baja" },
};

export function TasksList() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const sortedTasks = [...(tasks || [])]
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    })
    .slice(0, 5);

  const pendingCount = tasks?.filter(t => t.status !== 'completed').length || 0;
  const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;

  const formatDueDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return { text: "Hoy", urgent: true };
    if (isTomorrow(d)) return { text: "Mañana", urgent: false };
    const diff = differenceInDays(d, new Date());
    if (diff < 0) return { text: "Vencida", urgent: true };
    if (diff < 7) return { text: format(d, "EEEE", { locale: es }), urgent: false };
    return { text: format(d, "d MMM", { locale: es }), urgent: false };
  };

  const handleToggleComplete = (taskId: string, currentStatus: string) => {
    updateTask.mutate({
      id: taskId,
      status: currentStatus === 'completed' ? 'todo' : 'completed',
    });
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6">
      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tareas</h3>
              <p className="text-xs text-muted-foreground">{pendingCount} pendientes · {completedCount} completadas</p>
            </div>
          </div>
          
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            {pendingCount} activas
          </Badge>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No hay tareas aún</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Crea tu primera tarea</p>
            </div>
          ) : (
            sortedTasks.map((task, index) => {
              const isCompleted = task.status === 'completed';
              const dueInfo = formatDueDate(task.due_date);
              const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
              
              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                    "border",
                    isCompleted
                      ? "bg-secondary/20 border-border/20 opacity-70"
                      : "bg-gradient-to-r from-secondary/50 to-secondary/30 border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-all",
                        isCompleted 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm transition-all",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {task.projects?.name || 'Sin proyecto'}
                    </p>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Priority */}
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border",
                      priority.bg, priority.border, priority.color
                    )}>
                      <Flag className="w-3 h-3" />
                      {priority.label}
                    </div>
                    
                    {/* Due Date */}
                    {dueInfo && !isCompleted && (
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                        dueInfo.urgent 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-secondary text-muted-foreground"
                      )}>
                        <Clock className="w-3 h-3" />
                        {dueInfo.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <Link 
          to="/team-tasks" 
          className="flex items-center justify-center gap-2 mt-4 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          Ver todas las tareas
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

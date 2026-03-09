import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Flag,
  X,
  Tag,
  Sparkles,
  Target,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import { useTodos, useUpdateTodo, useDeleteTodo, Todo } from "@/hooks/useTodos";
import { CreateTodoDialog } from "@/components/todos/CreateTodoDialog";
import { EditTodoDialog } from "@/components/todos/EditTodoDialog";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Kanban components
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";

type ViewMode = "kanban" | "list";
type TodoStatus = "todo" | "in_progress" | "completed";

const statusConfig: Record<TodoStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  todo: { 
    label: "Por hacer", 
    icon: Circle, 
    color: "text-muted-foreground",
    bgColor: "bg-muted/30"
  },
  in_progress: { 
    label: "En progreso", 
    icon: Clock, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  completed: { 
    label: "Completado", 
    icon: CheckCircle2, 
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  high: { label: "Alta", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" },
  medium: { label: "Media", color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/20" },
  low: { label: "Baja", color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/20" },
};

export default function TeamTasks() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);

  const { data: todos = [], isLoading } = useTodos();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const categories = useMemo(() => {
    const cats = todos.map(t => t.category).filter(Boolean) as string[];
    return [...new Set(cats)];
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || todo.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [todos, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const todosByStatus = useMemo(() => {
    return {
      todo: filteredTodos.filter((t) => t.status === "todo"),
      in_progress: filteredTodos.filter((t) => t.status === "in_progress"),
      completed: filteredTodos.filter((t) => t.status === "completed"),
    };
  }, [filteredTodos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === "completed").length;
    const inProgress = todos.filter(t => t.status === "in_progress").length;
    const highPriority = todos.filter(t => t.priority === "high" && t.status !== "completed").length;
    return { total, completed, inProgress, highPriority };
  }, [todos]);

  const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    await updateTodo.mutateAsync({ id: todoId, status: newStatus });
    if (selectedTodo?.id === todoId) {
      setSelectedTodo(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Tarea movida a "${statusConfig[newStatus].label}"`);
  };

  const handleDragEnd = (itemId: string, newStatus: string) => {
    const validStatuses: TodoStatus[] = ['todo', 'in_progress', 'completed'];
    if (validStatuses.includes(newStatus as TodoStatus)) {
      const todo = todos.find(t => t.id === itemId);
      if (todo && todo.status !== newStatus) {
        handleStatusChange(itemId, newStatus as TodoStatus);
      }
    }
  };

  const handleDelete = async (todoId: string) => {
    await deleteTodo.mutateAsync(todoId);
    if (selectedTodo?.id === todoId) {
      setSelectedTodo(null);
    }
  };

  const handleEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsEditDialogOpen(true);
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "d MMM", { locale: es });
  };

  const isDueDatePast = (dateStr: string | null) => {
    if (!dateStr) return false;
    return isPast(new Date(dateStr)) && !isToday(new Date(dateStr));
  };

  const TodoCardContent = ({ todo, compact = false }: { todo: Todo; compact?: boolean }) => {
    const StatusIcon = statusConfig[todo.status].icon;
    
    return (
      <Card 
        className={cn(
          "group transition-all duration-200 hover:shadow-lg border-border/50",
          "hover:border-primary/30 hover:-translate-y-0.5",
          selectedTodo?.id === todo.id && "ring-2 ring-primary border-primary/50",
          todo.priority === "high" && "border-l-2 border-l-red-500"
        )}
        onClick={() => setSelectedTodo(todo)}
      >
        <CardContent className={cn("p-4", compact && "p-3")}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusConfig[todo.status].color)} />
                <h3 className={cn(
                  "font-medium truncate",
                  todo.status === "completed" && "line-through text-muted-foreground"
                )}>
                  {todo.title}
                </h3>
              </div>
              
              {todo.description && !compact && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {todo.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", priorityConfig[todo.priority].bgColor, priorityConfig[todo.priority].color)}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityConfig[todo.priority].label}
                </Badge>

                {todo.category && (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {todo.category}
                  </Badge>
                )}

                {todo.due_date && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      isDueDatePast(todo.due_date) && todo.status !== "completed" 
                        ? "text-red-500 border-red-500/30 bg-red-500/10" 
                        : "text-muted-foreground"
                    )}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDueDate(todo.due_date)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {todo.assignee && (
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarImage src={todo.assignee.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {todo.assignee.full_name?.[0] || todo.assignee.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(todo); }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(todo.id, status as TodoStatus); }}
                      disabled={todo.status === status}
                    >
                      <config.icon className={cn("mr-2 h-4 w-4", config.color)} />
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DetailPanel = () => {
    if (!selectedTodo) return null;

    const config = statusConfig[selectedTodo.status];
    const StatusIcon = config.icon;

    return (
      <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-[400px] lg:border-l lg:border-border bg-card/95 lg:bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Detalle de Tarea</h3>
          <Button variant="ghost" size="icon" onClick={() => setSelectedTodo(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn("h-5 w-5", config.color)} />
              <Badge className={cn("text-xs", config.bgColor, config.color)}>
                {config.label}
              </Badge>
            </div>
            <h2 className={cn(
              "text-xl font-bold",
              selectedTodo.status === "completed" && "line-through text-muted-foreground"
            )}>
              {selectedTodo.title}
            </h2>
          </div>

          {selectedTodo.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h4>
              <p className="text-sm">{selectedTodo.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Prioridad</span>
              <div className="flex items-center gap-2">
                <Badge className={cn(priorityConfig[selectedTodo.priority].bgColor, priorityConfig[selectedTodo.priority].color)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityConfig[selectedTodo.priority].label}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Categoría</span>
              <div className="flex items-center gap-2">
                {selectedTodo.category ? (
                  <Badge variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {selectedTodo.category}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin categoría</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Fecha límite</span>
              <div className="flex items-center gap-2">
                {selectedTodo.due_date ? (
                  <Badge 
                    variant="outline"
                    className={cn(
                      isDueDatePast(selectedTodo.due_date) && selectedTodo.status !== "completed"
                        ? "text-red-500 border-red-500/30 bg-red-500/10"
                        : ""
                    )}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(selectedTodo.due_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin fecha</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Asignado a</span>
              {selectedTodo.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedTodo.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {selectedTodo.assignee.full_name?.[0] || selectedTodo.assignee.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{selectedTodo.assignee.full_name || selectedTodo.assignee.email}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Sin asignar</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Cambiar estado</h4>
            <Select 
              value={selectedTodo.status} 
              onValueChange={(value) => handleStatusChange(selectedTodo.id, value as TodoStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([status, cfg]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                      {cfg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Creado: {format(new Date(selectedTodo.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
              <p>Actualizado: {format(new Date(selectedTodo.updated_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button className="w-full" onClick={() => handleEdit(selectedTodo)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Tarea
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive"
            onClick={() => handleDelete(selectedTodo.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tareas del Equipo
            </h1>
            <p className="text-muted-foreground mt-1 text-xs lg:text-sm hidden sm:block">
              Arrastra tareas entre columnas
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 text-sm" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva</span> Tarea
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2.5 rounded-lg bg-primary/10">
                <ListTodo className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg lg:text-2xl font-bold">{stats.total}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Total</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2.5 rounded-lg bg-blue-500/10">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg lg:text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">En progreso</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2.5 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg lg:text-2xl font-bold">{stats.completed}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Completadas</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2.5 rounded-lg bg-red-500/10">
                <Flag className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg lg:text-2xl font-bold">{stats.highPriority}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Alta prioridad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 bg-secondary/50 h-8 lg:h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px] lg:w-[140px] bg-secondary/50 h-8 lg:h-9 text-xs lg:text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[100px] lg:w-[140px] bg-secondary/50 h-8 lg:h-9 text-xs lg:text-sm hidden sm:flex">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg ml-auto">
            <Button 
              variant={viewMode === "kanban" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("kanban")}
              className="h-7 w-7 lg:h-8 lg:w-8 p-0"
            >
              <LayoutGrid className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("list")}
              className="h-7 w-7 lg:h-8 lg:w-8 p-0"
            >
              <List className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {filteredTodos.length === 0 ? (
          <div className="glass rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center border border-border/50">
            <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ListTodo className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No hay tareas</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "No se encontraron tareas"
                : "Crea tu primera tarea para organizar el trabajo"}
            </p>
            {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            )}
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            items={filteredTodos}
            onDragEnd={handleDragEnd}
            renderOverlay={(todo) => <TodoCardContent todo={todo} />}
          >
            <ScrollArea className="w-full pb-4">
              <div className="flex gap-3 lg:gap-4 min-w-max">
                {(Object.keys(statusConfig) as TodoStatus[]).map((status) => {
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  return (
                    <KanbanColumn
                      key={status}
                      id={status}
                      title={config.label}
                      count={todosByStatus[status].length}
                      icon={<StatusIcon className="h-4 w-4" />}
                      iconColor={config.color}
                      bgColor={config.bgColor}
                      emptyMessage="Arrastra tareas aquí"
                    >
                      {todosByStatus[status].map((todo) => (
                        <KanbanCard key={todo.id} id={todo.id}>
                          <TodoCardContent todo={todo} />
                        </KanbanCard>
                      ))}
                    </KanbanColumn>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </KanbanBoard>
        ) : (
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <TodoCardContent key={todo.id} todo={todo} compact />
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedTodo && <DetailPanel />}

      {/* Dialogs */}
      <CreateTodoDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
      {todoToEdit && (
        <EditTodoDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          todo={todoToEdit}
        />
      )}
    </div>
  );
}

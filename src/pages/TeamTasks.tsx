import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
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

  // Get unique categories from todos
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

  const TodoCard = ({ todo, compact = false }: { todo: Todo; compact?: boolean }) => {
    const StatusIcon = statusConfig[todo.status].icon;
    
    return (
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-lg border-border/50",
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

  const KanbanColumn = ({ status, todos }: { status: TodoStatus; todos: Todo[] }) => {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <div className="flex-1 min-w-[300px] max-w-[400px]">
        <div className={cn("rounded-xl p-4", config.bgColor)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", config.color)} />
              <h3 className="font-semibold">{config.label}</h3>
              <Badge variant="secondary" className="ml-1">
                {todos.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
            {todos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay tareas
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DetailPanel = () => {
    if (!selectedTodo) return null;

    const config = statusConfig[selectedTodo.status];
    const StatusIcon = config.icon;

    return (
      <div className="w-[400px] border-l border-border bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Detalle de Tarea</h3>
          <Button variant="ghost" size="icon" onClick={() => setSelectedTodo(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title and Status */}
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

          {/* Description */}
          {selectedTodo.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h4>
              <p className="text-sm">{selectedTodo.description}</p>
            </div>
          )}

          {/* Details Grid */}
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

          {/* Status Change */}
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

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Creado: {format(new Date(selectedTodo.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
              <p>Actualizado: {format(new Date(selectedTodo.updated_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
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

  return (
    <>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <ListTodo className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Tareas Internas</h1>
                    <p className="text-muted-foreground text-sm">
                      Gestiona las tareas del equipo BizTech
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Tareas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-blue-500/5 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">En Progreso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-green-500/5 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-red-500/5 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Flag className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.highPriority}</p>
                      <p className="text-xs text-muted-foreground">Alta Prioridad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 border-b border-border bg-card/20 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <SelectItem key={priority} value={priority}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-background/50">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 min-w-[300px]">
                    <Skeleton className="h-[400px] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : viewMode === "kanban" ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {(Object.keys(statusConfig) as TodoStatus[]).map((status) => (
                  <KanbanColumn key={status} status={status} todos={todosByStatus[status]} />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-w-4xl">
                {filteredTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No hay tareas</h3>
                    <p className="text-sm text-muted-foreground/70">
                      Crea tu primera tarea interna para el equipo
                    </p>
                  </div>
                ) : (
                  filteredTodos.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedTodo && <DetailPanel />}
      </div>

      <CreateTodoDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <EditTodoDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} todo={todoToEdit} />
    </>
  );
}

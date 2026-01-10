import { useState, useMemo, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  CalendarClock,
  GripVertical,
  Calendar as CalendarIcon,
  Target,
  Sparkles,
  Search,
  Filter,
  LayoutGrid,
  List,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, useCreateEvent, useUpdateEvent, Event } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday as isDateToday, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays, isSameMonth, parseISO, differenceInDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EventDetailDialog } from "@/components/calendar/EventDetailDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";

type ViewMode = "month" | "week" | "day";

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const daysOfWeekFull = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Stats Card Component
const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = "primary" 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  trend?: string;
  color?: "primary" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="glass rounded-xl p-4 animate-fade-in hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        {trend && (
          <Badge variant="secondary" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    project_id: "",
  });
  
  const { data: events, isLoading } = useEvents();
  const { data: projects } = useProjects();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  // Calculate stats
  const stats = useMemo(() => {
    if (!events) return { total: 0, today: 0, thisWeek: 0, upcoming: 0 };
    
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    
    const todayEvents = events.filter(e => isSameDay(parseISO(e.start_time), today));
    const weekEvents = events.filter(e => {
      const eventDate = parseISO(e.start_time);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
    const upcomingEvents = events.filter(e => parseISO(e.start_time) >= today);
    
    return {
      total: events.length,
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      upcoming: upcomingEvents.length,
    };
  }, [events]);

  // Filter events by search
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!searchQuery.trim()) return events;
    
    const query = searchQuery.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.project?.name?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfWeek = getDay(start);
    const padding = Array(firstDayOfWeek).fill(null);
    
    return [...padding, ...days];
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Time slots for day/week view
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
    }));
  }, []);

  const getEventsForDay = (day: Date | null) => {
    if (!day || !filteredEvents) return [];
    return filteredEvents.filter(e => isSameDay(parseISO(e.start_time), day));
  };

  const getEventsForHour = (day: Date, hour: number) => {
    if (!filteredEvents) return [];
    return filteredEvents.filter(e => {
      const eventDate = parseISO(e.start_time);
      return isSameDay(eventDate, day) && eventDate.getHours() === hour;
    });
  };

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };
  
  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [startHour, startMin] = newEvent.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(selectedDate);
    const [endHour, endMin] = newEvent.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMin, 0, 0);

    try {
      await createEvent.mutateAsync({
        title: newEvent.title,
        description: newEvent.description || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        project_id: newEvent.project_id || undefined,
      });
      
      setIsDialogOpen(false);
      setNewEvent({ title: "", description: "", startTime: "09:00", endTime: "10:00", project_id: "" });
      toast.success("Evento creado correctamente");
    } catch (error) {
      toast.error("Error al crear evento");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, event: Event) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", event.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetDate(day);
  };

  const handleDragLeave = () => {
    setDropTargetDate(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetDay: Date) => {
    e.preventDefault();
    setDropTargetDate(null);
    
    if (!draggedEvent) return;
    
    const originalStart = parseISO(draggedEvent.start_time);
    const originalEnd = parseISO(draggedEvent.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    const newStart = new Date(targetDay);
    newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + duration);
    
    try {
      await updateEvent.mutateAsync({
        id: draggedEvent.id,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      });
      toast.success("Evento movido correctamente");
    } catch (error) {
      toast.error("Error al mover evento");
    }
    
    setDraggedEvent(null);
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
    setDropTargetDate(null);
  };

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  // Get selected day's events
  const selectedDayEvents = useMemo(() => {
    if (!filteredEvents) return [];
    return filteredEvents
      .filter(e => isSameDay(parseISO(e.start_time), selectedDate))
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [filteredEvents, selectedDate]);

  // Get navigation title
  const getNavigationTitle = () => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy", { locale: es });
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM yyyy", { locale: es })}`;
    }
    return format(currentDate, "EEEE, d MMMM yyyy", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Calendario</h1>
              <p className="text-muted-foreground">
                Gestiona eventos, reuniones y fechas importantes
              </p>
            </div>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={CalendarDays}
          label="Total Eventos"
          value={stats.total}
          color="primary"
        />
        <StatsCard
          icon={Target}
          label="Eventos Hoy"
          value={stats.today}
          color={stats.today > 0 ? "success" : "primary"}
        />
        <StatsCard
          icon={CalendarClock}
          label="Esta Semana"
          value={stats.thisWeek}
          color="warning"
        />
        <StatsCard
          icon={Sparkles}
          label="Próximos"
          value={stats.upcoming}
          color="primary"
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="gap-1.5"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Mes</span>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="gap-1.5"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Semana</span>
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="gap-1.5"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Día</span>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrev}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} className="hidden sm:flex">
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <h2 className="text-lg font-semibold capitalize ml-2">
            {getNavigationTitle()}
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 glass rounded-xl p-6 animate-fade-in">
          {/* Drag hint */}
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Arrastra los eventos para moverlos a otra fecha
          </p>

          {/* Month View */}
          {viewMode === "month" && (
            <>
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="min-h-[100px]" />;
                  }
                  
                  const dayEvents = getEventsForDay(day);
                  const isToday = isDateToday(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isDropTarget = dropTargetDate && isSameDay(day, dropTargetDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      onDragOver={(e) => handleDragOver(e, day)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      className={cn(
                        "min-h-[100px] p-2 rounded-lg transition-all cursor-pointer border border-transparent",
                        "hover:bg-secondary/50",
                        isSelected && "bg-secondary border-primary/30",
                        isToday && "ring-2 ring-primary",
                        isDropTarget && "bg-primary/20 ring-2 ring-primary ring-dashed",
                        !isCurrentMonth && "opacity-40"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => handleEventClick(e, event)}
                            className={cn(
                              "text-xs px-2 py-1 rounded truncate",
                              "cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity",
                              "flex items-center gap-1 group",
                              event.project_id 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-primary/20 text-primary border border-primary/30",
                              draggedEvent?.id === event.id && "opacity-50"
                            )}
                          >
                            <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-70 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-xs text-muted-foreground px-2">
                            +{dayEvents.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <ScrollArea className="h-[600px]">
              <div className="min-w-[800px]">
                {/* Week Header */}
                <div className="grid grid-cols-8 gap-1 mb-2 sticky top-0 bg-background z-10 pb-2">
                  <div className="w-16" />
                  {weekDays.map((day) => (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "text-center p-2 rounded-lg",
                        isDateToday(day) && "bg-primary/10"
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: es })}</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        isDateToday(day) && "text-primary"
                      )}>
                        {format(day, "d")}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.filter(slot => slot.hour >= 6 && slot.hour <= 22).map((slot) => (
                    <div key={slot.hour} className="grid grid-cols-8 gap-1 min-h-[60px] border-t border-border/30">
                      <div className="w-16 text-xs text-muted-foreground pr-2 text-right pt-1">
                        {slot.label}
                      </div>
                      {weekDays.map((day) => {
                        const hourEvents = getEventsForHour(day, slot.hour);
                        return (
                          <div 
                            key={`${day.toISOString()}-${slot.hour}`}
                            onClick={() => {
                              setSelectedDate(day);
                              setNewEvent(prev => ({ 
                                ...prev, 
                                startTime: slot.label,
                                endTime: `${(slot.hour + 1).toString().padStart(2, '0')}:00`
                              }));
                              setIsDialogOpen(true);
                            }}
                            className={cn(
                              "p-1 rounded transition-colors cursor-pointer",
                              "hover:bg-secondary/50",
                              isDateToday(day) && "bg-primary/5"
                            )}
                          >
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => handleEventClick(e, event)}
                                className={cn(
                                  "text-xs px-2 py-1 rounded truncate mb-1",
                                  event.project_id 
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-primary/20 text-primary border border-primary/30",
                                  "hover:opacity-80 cursor-pointer"
                                )}
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Day View */}
          {viewMode === "day" && (
            <ScrollArea className="h-[600px]">
              <div className="space-y-1">
                {timeSlots.filter(slot => slot.hour >= 6 && slot.hour <= 22).map((slot) => {
                  const hourEvents = getEventsForHour(currentDate, slot.hour);
                  return (
                    <div 
                      key={slot.hour}
                      onClick={() => {
                        setNewEvent(prev => ({ 
                          ...prev, 
                          startTime: slot.label,
                          endTime: `${(slot.hour + 1).toString().padStart(2, '0')}:00`
                        }));
                        setSelectedDate(currentDate);
                        setIsDialogOpen(true);
                      }}
                      className={cn(
                        "flex gap-4 min-h-[60px] p-2 rounded-lg transition-colors cursor-pointer",
                        "hover:bg-secondary/50 border-l-2 border-transparent",
                        hourEvents.length > 0 && "border-l-primary bg-secondary/20"
                      )}
                    >
                      <div className="w-16 text-sm text-muted-foreground text-right pt-1 flex-shrink-0">
                        {slot.label}
                      </div>
                      <div className="flex-1 space-y-1">
                        {hourEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(e, event)}
                            className={cn(
                              "p-3 rounded-lg cursor-pointer transition-colors",
                              event.project_id 
                                ? "bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30" 
                                : "bg-primary/20 border border-primary/30 hover:bg-primary/30"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            {event.project && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {event.project.name}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Panel */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <div className="text-center py-4 mb-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <p className="text-5xl font-bold text-primary">{format(selectedDate, "d")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(selectedDate, "EEEE", { locale: es })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(selectedDate, "MMMM yyyy", { locale: es })}
              </p>
            </div>

            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Eventos del Día
              {selectedDayEvents.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedDayEvents.length}
                </Badge>
              )}
            </h3>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-2">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 rounded-full bg-secondary/50 w-fit mx-auto mb-3">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No hay eventos</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Crear evento
                    </Button>
                  </div>
                ) : (
                  selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsEventDetailOpen(true);
                      }}
                      className={cn(
                        "p-3 rounded-lg transition-all cursor-pointer group",
                        "hover:translate-x-1",
                        event.project_id 
                          ? "bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40" 
                          : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          event.project_id ? "bg-emerald-500/20" : "bg-primary/10"
                        )}>
                          {event.project_id ? (
                            <Target className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
                          </div>
                          {event.project && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {event.project.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Nuevo Evento
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleToday}
              >
                <Clock className="w-4 h-4" />
                Ir a Hoy
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setViewMode("month")}
              >
                <LayoutGrid className="w-4 h-4" />
                Vista Mensual
              </Button>
            </div>
          </div>

          {/* Upcoming Events Preview */}
          {stats.upcoming > 0 && (
            <div className="glass rounded-xl p-6 animate-slide-up">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Próximos Eventos
              </h3>
              <div className="space-y-2">
                {filteredEvents
                  ?.filter(e => parseISO(e.start_time) >= startOfDay(new Date()))
                  .slice(0, 3)
                  .map((event) => {
                    const daysUntil = differenceInDays(parseISO(event.start_time), new Date());
                    return (
                      <div 
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventDetailOpen(true);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <div className="text-center min-w-[40px]">
                          <p className="text-lg font-bold text-primary">
                            {format(parseISO(event.start_time), "d")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(event.start_time), "MMM", { locale: es })}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysUntil === 0 ? "Hoy" : daysUntil === 1 ? "Mañana" : `En ${daysUntil} días`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Crear Nuevo Evento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Nombre del evento"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Proyecto (opcional)</Label>
              <Select
                value={newEvent.project_id}
                onValueChange={(value) =>
                  setNewEvent({
                    ...newEvent,
                    project_id: value === "__no_project__" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin proyecto asociado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__no_project__">Sin proyecto</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="text-sm font-medium mb-1">Fecha seleccionada</p>
              <p className="text-lg text-primary font-semibold">
                {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora inicio
                </Label>
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora fin
                </Label>
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateEvent} 
                className="flex-1 gap-2" 
                disabled={createEvent.isPending}
              >
                {createEvent.isPending ? (
                  <>Creando...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Evento
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
      />
    </div>
  );
}

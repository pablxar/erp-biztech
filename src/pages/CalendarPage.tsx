import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Video,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, useTodayEvents, useCreateEvent } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const typeConfig = {
  meeting: { icon: Users, label: "Reunión" },
  call: { icon: Video, label: "Llamada" },
  presentation: { icon: Users, label: "Presentación" },
  deadline: { icon: Clock, label: "Fecha límite" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
  });
  
  const { data: events, isLoading } = useEvents();
  const { data: todayEvents } = useTodayEvents();
  const createEvent = useCreateEvent();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding for first week
    const firstDayOfWeek = getDay(start);
    const padding = Array(firstDayOfWeek).fill(null);
    
    return [...padding, ...days];
  }, [currentDate]);

  const getEventsForDay = (day: Date | null) => {
    if (!day || !events) return [];
    return events.filter(e => isSameDay(new Date(e.start_time), day));
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

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
      });
      
      setIsDialogOpen(false);
      setNewEvent({ title: "", description: "", startTime: "09:00", endTime: "10:00" });
      toast.success("Evento creado");
    } catch (error) {
      toast.error("Error al crear evento");
    }
  };

  // Get selected day's events
  const selectedDayEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(e => isSameDay(new Date(e.start_time), selectedDate));
  }, [events, selectedDate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendario</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus eventos y reuniones</p>
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus eventos y reuniones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nombre del evento"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora inicio</Label>
                  <Input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hora fin</Label>
                  <Input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Fecha: {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
              <Button onClick={handleCreateEvent} className="w-full" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Creando..." : "Crear Evento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-xl p-6 animate-fade-in">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

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
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg transition-all cursor-pointer",
                    "hover:bg-secondary/50",
                    isSelected && "bg-secondary",
                    isToday && "ring-2 ring-primary"
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
                        className="text-xs px-2 py-1 rounded truncate bg-primary text-primary-foreground"
                      >
                        {event.title}
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
        </div>

        {/* Sidebar - Selected Day's Events */}
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">
              Eventos del {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h3>
            <div className="text-center py-4 mb-4 rounded-lg bg-primary/10">
              <p className="text-4xl font-bold text-primary">{format(selectedDate, "d")}</p>
              <p className="text-sm text-muted-foreground">{format(selectedDate, "MMMM yyyy", { locale: es })}</p>
            </div>

            <div className="space-y-3">
              {selectedDayEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No hay eventos para este día</p>
              ) : (
                selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
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
                onClick={() => setSelectedDate(new Date())}
              >
                <Clock className="w-4 h-4" />
                Ir a Hoy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

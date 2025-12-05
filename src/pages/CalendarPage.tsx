import { useState } from "react";
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

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const events = [
  { id: 1, title: "Revisión de Sprint", date: 5, time: "10:00", duration: "1h", type: "meeting", attendees: 5, color: "bg-primary" },
  { id: 2, title: "Llamada con TechStore", date: 5, time: "14:00", duration: "30min", type: "call", attendees: 2, color: "bg-info" },
  { id: 3, title: "Presentación Q4", date: 5, time: "16:00", duration: "2h", type: "presentation", attendees: 8, color: "bg-warning" },
  { id: 4, title: "Entrega Rediseño Web", date: 8, time: "18:00", duration: "—", type: "deadline", color: "bg-destructive" },
  { id: 5, title: "Demo CRM Cliente", date: 10, time: "11:00", duration: "1h", type: "meeting", attendees: 4, color: "bg-primary" },
  { id: 6, title: "Planning Semanal", date: 12, time: "09:00", duration: "2h", type: "meeting", attendees: 6, color: "bg-primary" },
  { id: 7, title: "Cierre financiero", date: 15, time: "12:00", duration: "—", type: "deadline", color: "bg-destructive" },
  { id: 8, title: "Reunión Equipo", date: 18, time: "10:00", duration: "1h", type: "meeting", attendees: 8, color: "bg-primary" },
];

const upcomingEvents = [
  { id: 1, title: "Revisión de Sprint", time: "10:00 AM", duration: "1h", type: "meeting", attendees: 5, location: "Sala Virtual A" },
  { id: 2, title: "Llamada con TechStore", time: "2:00 PM", duration: "30min", type: "call", attendees: 2, location: "Zoom" },
  { id: 3, title: "Presentación Q4", time: "4:00 PM", duration: "2h", type: "presentation", attendees: 8, location: "Oficina Principal" },
];

const typeConfig = {
  meeting: { icon: Users, label: "Reunión" },
  call: { icon: Video, label: "Llamada" },
  presentation: { icon: Users, label: "Presentación" },
  deadline: { icon: Clock, label: "Fecha límite" },
};

export default function CalendarPage() {
  const [currentDate] = useState(new Date(2025, 11, 5)); // December 5, 2025
  const [selectedDate, setSelectedDate] = useState(5);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => events.filter((e) => e.date === day);

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
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-xl p-6 animate-fade-in">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {months[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
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
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = day === 5;
              const isSelected = day === selectedDate;

              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg transition-all cursor-pointer",
                    day ? "hover:bg-secondary/50" : "",
                    isSelected && "bg-secondary",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  {day && (
                    <>
                      <span className={cn(
                        "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {day}
                      </span>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-2 py-1 rounded truncate",
                              event.color,
                              event.color === "bg-primary" && "text-primary-foreground",
                              event.color === "bg-info" && "text-info-foreground",
                              event.color === "bg-warning" && "text-warning-foreground",
                              event.color === "bg-destructive" && "text-destructive-foreground"
                            )}
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
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Today's Events */}
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Eventos de Hoy</h3>
            <div className="text-center py-4 mb-4 rounded-lg bg-primary/10">
              <p className="text-4xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Diciembre 2025</p>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const config = typeConfig[event.type as keyof typeof typeConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time} • {event.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {event.attendees} participantes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Video className="w-4 h-4" />
                Nueva Videollamada
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="w-4 h-4" />
                Programar Reunión
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Clock className="w-4 h-4" />
                Añadir Recordatorio
              </Button>
            </div>
          </div>

          {/* Sync Status */}
          <div className="glass rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">Sincronización</h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Conectar para sincronizar</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Conectar
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

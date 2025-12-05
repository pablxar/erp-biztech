import { Calendar, Clock, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Revisión de Sprint",
    time: "10:00 AM",
    duration: "1h",
    type: "meeting",
    attendees: 5,
  },
  {
    id: 2,
    title: "Llamada con TechStore",
    time: "2:00 PM",
    duration: "30min",
    type: "call",
    attendees: 2,
  },
  {
    id: 3,
    title: "Presentación Q4",
    time: "4:00 PM",
    duration: "2h",
    type: "presentation",
    attendees: 8,
  },
];

const typeConfig = {
  meeting: { icon: Users, color: "text-primary", bg: "bg-primary/10" },
  call: { icon: Video, color: "text-info", bg: "bg-info/10" },
  presentation: { icon: Calendar, color: "text-warning", bg: "bg-warning/10" },
};

export function UpcomingEvents() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Eventos de Hoy</h3>
        <a href="/calendar" className="text-sm text-primary hover:underline">
          Ver calendario
        </a>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => {
          const config = typeConfig[event.type as keyof typeof typeConfig];
          const Icon = config.icon;

          return (
            <div
              key={event.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("p-3 rounded-lg", config.bg)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{event.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                  <span>{event.duration}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.attendees}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

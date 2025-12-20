import { Calendar, Clock, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodayEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const typeConfig = {
  meeting: { icon: Users, color: "text-primary", bg: "bg-primary/10" },
  call: { icon: Video, color: "text-info", bg: "bg-info/10" },
  presentation: { icon: Calendar, color: "text-warning", bg: "bg-warning/10" },
  default: { icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
};

export function UpcomingEvents() {
  const { data: events, isLoading } = useTodayEvents();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Eventos de Hoy</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Eventos de Hoy</h3>
        <a path="/calendar" className="text-sm text-primary hover:underline">
          Ver calendario
        </a>
      </div>

      <div className="space-y-4">
        {!events || events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay eventos para hoy</p>
        ) : (
          events.map((event, index) => {
            const config = typeConfig.default;
            const Icon = config.icon;
            const startTime = format(new Date(event.start_time), "h:mm a", { locale: es });
            const endTime = format(new Date(event.end_time), "h:mm a", { locale: es });

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
                      {startTime} - {endTime}
                    </span>
                    {event.project && <span>{event.project.name}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

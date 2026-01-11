import { Calendar, Clock, Users, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodayEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

const typeConfig = {
  meeting: { icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  call: { icon: Video, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  presentation: { icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  default: { icon: Calendar, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
};

export function UpcomingEvents() {
  const { data: events, isLoading } = useTodayEvents();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 h-full">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 h-full flex flex-col">
      {/* Background Decoration */}
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Eventos de Hoy</h3>
              <p className="text-xs text-muted-foreground">{events?.length || 0} eventos programados</p>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 space-y-3">
          {!events || events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">No hay eventos para hoy</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Disfruta tu día libre</p>
            </div>
          ) : (
            events.slice(0, 4).map((event, index) => {
              const config = typeConfig.default;
              const Icon = config.icon;
              const startTime = format(new Date(event.start_time), "HH:mm", { locale: es });
              const endTime = format(new Date(event.end_time), "HH:mm", { locale: es });

              return (
                <div
                  key={event.id}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-xl",
                    "bg-gradient-to-r from-secondary/50 to-secondary/30",
                    "border border-border/30 hover:border-primary/30",
                    "transition-all duration-300 cursor-pointer",
                    "hover:shadow-lg hover:shadow-primary/5"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Time Indicator */}
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-lg font-bold text-foreground">{startTime.split(':')[0]}</span>
                    <span className="text-xs text-muted-foreground">:{startTime.split(':')[1]}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {startTime} - {endTime}
                      </span>
                      {event.project && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {event.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className={cn(
                    "p-2.5 rounded-lg border transition-all",
                    config.bg, config.border,
                    "group-hover:scale-110"
                  )}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <Link 
          to="/calendar" 
          className="flex items-center justify-center gap-2 mt-4 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          Ver calendario completo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

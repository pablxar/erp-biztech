import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Trash2, Clock, Loader2, Video, ExternalLink, Mail, CheckCircle2, RefreshCw, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Event, useUpdateEvent, useDeleteEvent, useSendEventInvite, EventType } from "@/hooks/useEvents";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: string }> = {
  meeting: { label: "Reunión", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "🎥" },
  task: { label: "Tarea", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "✅" },
  deadline: { label: "Deadline", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "🚩" },
  reminder: { label: "Recordatorio", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "🔔" },
};

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const sendInvite = useSendEventInvite();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      const eventDate = new Date(event.start_time);
      setDate(eventDate);
      setStartTime(format(eventDate, "HH:mm"));
      setEndTime(format(new Date(event.end_time), "HH:mm"));
    }
  }, [event]);

  const handleSave = async () => {
    if (!event || !title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    const startDateTime = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(date);
    const [endHour, endMin] = endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMin, 0, 0);

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        title,
        description: description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      toast.success("Evento actualizado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al actualizar evento");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Evento eliminado");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al eliminar evento");
    }
  };

  const handleResendInvite = async () => {
    if (!event || !event.attendee_email) return;

    try {
      await sendInvite.mutateAsync({
        event_id: event.id,
        title: event.title,
        description: event.description || undefined,
        start_time: event.start_time,
        end_time: event.end_time,
        meeting_url: event.meeting_url || undefined,
        attendee_email: event.attendee_email,
      });
      toast.success("Invitación reenviada");
    } catch (error) {
      toast.error("Error al reenviar invitación");
    }
  };

  if (!event) return null;

  const typeConfig = eventTypeConfig[event.event_type as EventType] || eventTypeConfig.meeting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-xl">{typeConfig.icon}</span>
            Detalle del Evento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 mt-2">
          {/* Type & Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("border", typeConfig.color)}>
              {typeConfig.label}
            </Badge>
            {event.meeting_url && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                <Video className="w-3 h-3 mr-1" />
                Meet
              </Badge>
            )}
            {event.email_sent && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Invitación enviada
              </Badge>
            )}
          </div>

          {/* Meeting URL Button */}
          {event.meeting_url && (
            <div className="space-y-2">
              <a
                href={event.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/20">
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Unirse a la Reunión</p>
                  <p className="text-xs text-muted-foreground truncate">{event.meeting_url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
              </a>

              {/* WhatsApp Button */}
              <button
                onClick={() => {
                  const BIZTECH_WA_NUMBER = "56912345678"; // TODO: Reemplazar con número real del grupo
                  const eventDate = new Date(event.start_time);
                  const formattedDate = format(eventDate, "EEEE d 'de' MMMM", { locale: es });
                  const formattedTime = format(eventDate, "HH:mm");
                  const message = `🎥 *${event.title}*\n📅 ${formattedDate}\n🕐 ${formattedTime} hrs\n\n🔗 Link: ${event.meeting_url}`;
                  window.open(`https://wa.me/${BIZTECH_WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
                }}
                className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors group w-full text-left"
              >
                <div className="p-2.5 rounded-lg bg-green-500/20">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Enviar por WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Compartir link al grupo de Biztech</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-green-400 transition-colors" />
              </button>
            </div>
          )}

          {/* Attendee Info */}
          {event.attendee_email && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{event.attendee_email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendInvite}
                disabled={sendInvite.isPending}
                className="gap-1 text-xs"
              >
                {sendInvite.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Reenviar
              </Button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del evento"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora inicio
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora fin
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El evento será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateEvent.isPending}>
                {updateEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

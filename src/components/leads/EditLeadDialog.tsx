import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useUpdateLead, Lead, LeadStatus } from "@/hooks/useLeads";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Calificado" },
  { value: "discarded", label: "Descartado" },
  { value: "converted", label: "Convertido" },
];

export function EditLeadDialog({ lead, open, onOpenChange }: EditLeadDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const updateLead = useUpdateLead();
  const { data: teamMembers } = useTeamMembers();

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setCompany(lead.company || "");
      setSource(lead.source || "");
      setStatus(lead.status);
      setNotes(lead.notes || "");
      setAssignedTo(lead.assigned_to || "");
      
      if (lead.meeting_scheduled_at) {
        const date = new Date(lead.meeting_scheduled_at);
        setMeetingDate(format(date, "yyyy-MM-dd"));
        setMeetingTime(format(date, "HH:mm"));
      } else {
        setMeetingDate("");
        setMeetingTime("");
      }
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;
    
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    let meeting_scheduled_at: string | null = null;
    if (meetingDate && meetingTime) {
      meeting_scheduled_at = `${meetingDate}T${meetingTime}:00`;
    }

    updateLead.mutate(
      {
        id: lead.id,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        source: source.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        assigned_to: assignedTo || null,
        meeting_scheduled_at,
      },
      {
        onSuccess: () => {
          toast.success("Lead actualizado correctamente");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Error al actualizar el lead");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Lead
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del lead
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-company">Empresa</Label>
              <Input
                id="edit-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Empresa ABC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-source">Fuente</Label>
              <Input
                id="edit-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="landing_page, referido, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-assigned_to">Asignar a</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reunión</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
              <Input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre el lead..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

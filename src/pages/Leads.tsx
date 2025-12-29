import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  UserPlus,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLeads, useDeleteLead, useUpdateLead, Lead, LeadStatus } from "@/hooks/useLeads";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "Nuevo", color: "bg-info/20 text-info border-info/30" },
  contacted: { label: "Contactado", color: "bg-warning/20 text-warning border-warning/30" },
  qualified: { label: "Calificado", color: "bg-success/20 text-success border-success/30" },
  discarded: { label: "Descartado", color: "bg-muted text-muted-foreground border-muted" },
  converted: { label: "Convertido", color: "bg-primary/20 text-primary border-primary/30" },
};

const statusOrder: LeadStatus[] = ['new', 'contacted', 'qualified', 'discarded', 'converted'];

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const { data: teamMembers } = useTeamMembers();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Filter leads based on search and status
  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const selectedLead = selectedLeadId 
    ? leads?.find(l => l.id === selectedLeadId) 
    : filteredLeads[0];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead.mutate(leadToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setLeadToDelete(null);
          if (selectedLeadId === leadToDelete.id) {
            setSelectedLeadId(null);
          }
          toast.success("Lead eliminado correctamente");
        },
      });
    }
  };

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead.mutate(
      { id: lead.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Lead actualizado a "${statusConfig[newStatus].label}"`);
        },
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  // Group leads by status for Kanban view
  const leadsByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = filteredLeads.filter(l => l.status === status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground mt-1">Gestión de prospectos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de prospectos y oportunidades
          </p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusOrder.map(status => (
          <div 
            key={status}
            className={cn(
              "glass rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]",
              statusFilter === status && "ring-2 ring-primary"
            )}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
          >
            <Badge className={cn("text-xs border mb-2", statusConfig[status].color)}>
              {statusConfig[status].label}
            </Badge>
            <p className="text-2xl font-bold">{leadsByStatus[status]?.length || 0}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar leads..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {statusOrder.map(status => (
              <SelectItem key={status} value={status}>
                {statusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "No se encontraron leads con ese criterio" 
              : "Los leads aparecerán aquí cuando lleguen desde tu landing page"}
          </p>
          {!searchQuery && statusFilter === "all" && <CreateLeadDialog />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={cn(
                  "glass glass-hover rounded-xl p-4 cursor-pointer animate-fade-in group",
                  selectedLead?.id === lead.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge className={cn("text-xs border", statusConfig[lead.status].color)}>
                          {statusConfig[lead.status].label}
                        </Badge>
                      </div>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.meeting_scheduled_at && (
                          <span className="flex items-center gap-1 text-primary">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.meeting_scheduled_at), "d MMM, HH:mm", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {format(new Date(lead.created_at), "d MMM", { locale: es })}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar lead
                        </DropdownMenuItem>
                        {lead.email && (
                          <DropdownMenuItem onClick={() => openEmail(lead.email!)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar email
                          </DropdownMenuItem>
                        )}
                        {lead.phone && (
                          <DropdownMenuItem onClick={() => openPhone(lead.phone!)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Llamar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {lead.status !== 'converted' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(lead, 'converted')}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Convertir a cliente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(lead)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lead Detail */}
          {selectedLead && (
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                        {getInitials(selectedLead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedLead.name}</h3>
                      <Badge className={cn("text-xs border mt-1", statusConfig[selectedLead.status].color)}>
                        {statusConfig[selectedLead.status].label}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditLead(selectedLead)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar lead
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(selectedLead)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status change */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-2 block">Cambiar estado</label>
                  <Select 
                    value={selectedLead.status} 
                    onValueChange={(v) => handleStatusChange(selectedLead, v as LeadStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOrder.map(status => (
                        <SelectItem key={status} value={status}>
                          {statusConfig[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {selectedLead.email && (
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => openEmail(selectedLead.email!)}
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.email}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => openPhone(selectedLead.phone!)}
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLead.phone}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.company}</span>
                    </div>
                  )}
                  {selectedLead.meeting_scheduled_at && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Reunión agendada</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(selectedLead.meeting_scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedLead.source && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground">Fuente</p>
                    <p className="text-sm font-medium">{selectedLead.source}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => selectedLead.email && openEmail(selectedLead.email)}
                    disabled={!selectedLead.email}
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => selectedLead.phone && openPhone(selectedLead.phone)}
                    disabled={!selectedLead.phone}
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="glass rounded-xl p-6 animate-slide-up">
                  <h4 className="font-semibold mb-4">Notas</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedLead.notes}</p>
                </div>
              )}

              {/* Assigned to */}
              {selectedLead.profiles && (
                <div className="glass rounded-xl p-6 animate-slide-up">
                  <h4 className="font-semibold mb-4">Asignado a</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary">
                        {getInitials(selectedLead.profiles.full_name || selectedLead.profiles.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedLead.profiles.full_name || selectedLead.profiles.email}</p>
                      <p className="text-xs text-muted-foreground">{selectedLead.profiles.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Created info */}
              <div className="glass rounded-xl p-6 animate-slide-up">
                <h4 className="font-semibold mb-4">Información</h4>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm">
                      Creado el {format(new Date(selectedLead.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Actualizado {format(new Date(selectedLead.updated_at), "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <EditLeadDialog 
        lead={editingLead} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El lead "{leadToDelete?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  UserPlus,
  Clock,
  LayoutGrid,
  List,
  Filter,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  MapPin,
  Globe,
  Briefcase,
  MessageSquare,
  Star,
  Zap,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLeads, useDeleteLead, useUpdateLead, Lead, LeadStatus } from "@/hooks/useLeads";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
    gradient: string;
  }
> = {
  new: {
    label: "Nuevos",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: Sparkles,
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  contacted: {
    label: "Contactados",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: MessageSquare,
    gradient: "from-amber-500/20 to-amber-600/10",
  },
  qualified: {
    label: "Calificados",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: Star,
    gradient: "from-emerald-500/20 to-emerald-600/10",
  },
  discarded: {
    label: "Descartados",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10 border-slate-500/20",
    icon: Target,
    gradient: "from-slate-500/20 to-slate-600/10",
  },
  converted: {
    label: "Convertidos",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    icon: Zap,
    gradient: "from-violet-500/20 to-violet-600/10",
  },
};

const statusOrder: LeadStatus[] = ["new", "contacted", "qualified", "converted", "discarded"];

const priorityConfig = {
  high: { label: "Alta", color: "text-red-400 bg-red-500/10" },
  medium: { label: "Media", color: "text-amber-400 bg-amber-500/10" },
  low: { label: "Baja", color: "text-slate-400 bg-slate-500/10" },
};

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const { data: teamMembers } = useTeamMembers();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Filter leads
  const filteredLeads =
    leads?.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const selectedLead = selectedLeadId ? leads?.find((l) => l.id === selectedLeadId) : null;

  const leadsByStatus = statusOrder.reduce(
    (acc, status) => {
      acc[status] = filteredLeads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<LeadStatus, Lead[]>,
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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
          toast.success(`Lead movido a "${statusConfig[newStatus].label}"`);
        },
      },
    );
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  // Stats
  const totalLeads = leads?.length || 0;
  const newLeads = leadsByStatus.new?.length || 0;
  const convertedLeads = leadsByStatus.converted?.length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Pipeline de Leads
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona y convierte tus prospectos en clientes</p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newLeads}</p>
              <p className="text-xs text-muted-foreground">Nuevos</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-violet-500/10">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{convertedLeads}</p>
              <p className="text-xs text-muted-foreground">Convertidos</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversión</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              className="pl-10 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
            <SelectTrigger className="w-44 bg-background/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOrder.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusConfig[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-border/50">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay leads</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No se encontraron leads con ese criterio de búsqueda"
              : "Comienza a agregar leads manualmente o conéctalos desde tu landing page"}
          </p>
          {!searchQuery && statusFilter === "all" && <CreateLeadDialog />}
        </div>
      ) : viewMode === "kanban" ? (
        // Kanban View
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {statusOrder.map((status) => {
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              const columnLeads = leadsByStatus[status] || [];

              return (
                <div key={status} className="w-80 flex-shrink-0">
                  {/* Column Header */}
                  <div
                    className={cn(
                      "rounded-t-xl p-4 border border-b-0 border-border/50",
                      "bg-gradient-to-b",
                      config.gradient,
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("w-4 h-4", config.color)} />
                        <span className="font-semibold">{config.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {columnLeads.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="glass rounded-b-xl border border-t-0 border-border/50 p-3 min-h-[400px] space-y-3">
                    {columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        isSelected={selectedLeadId === lead.id}
                        onSelect={() => setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)}
                        onEdit={() => handleEditLead(lead)}
                        onDelete={() => handleDeleteClick(lead)}
                        onStatusChange={(newStatus) => handleStatusChange(lead, newStatus)}
                        onEmail={openEmail}
                        onPhone={openPhone}
                      />
                    ))}
                    {columnLeads.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">Sin leads</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        // List View
        <div className="glass rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border/50">
            <div className="col-span-4">Lead</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Empresa</div>
            <div className="col-span-2">Fuente</div>
            <div className="col-span-1">Fecha</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-border/50">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 hover:bg-muted/20 transition-colors cursor-pointer group",
                  selectedLeadId === lead.id && "bg-primary/5",
                )}
                onClick={() => setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge
                    className={cn("text-xs border", statusConfig[lead.status].bgColor, statusConfig[lead.status].color)}
                  >
                    {statusConfig[lead.status].label}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center text-sm text-muted-foreground">{lead.company || "-"}</div>
                <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                  {lead.source || "manual"}
                </div>
                <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                  {format(new Date(lead.created_at), "d MMM", { locale: es })}
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
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
                      <DropdownMenuItem onClick={() => handleDeleteClick(lead)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onEdit={() => handleEditLead(selectedLead)}
          onDelete={() => handleDeleteClick(selectedLead)}
          onStatusChange={(status) => handleStatusChange(selectedLead, status)}
          onEmail={openEmail}
          onPhone={openPhone}
        />
      )}

      {/* Edit Dialog */}
      <EditLeadDialog lead={editingLead} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el lead
              <span className="font-semibold"> {leadToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Lead Card Component
interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
}

function LeadCard({ lead, isSelected, onSelect, onEdit, onDelete, onStatusChange, onEmail, onPhone }: LeadCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 bg-background/50 border border-border/50 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 group",
        isSelected && "ring-2 ring-primary border-primary/50",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm leading-tight">{lead.name}</p>
            {lead.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            {lead.email && (
              <DropdownMenuItem onClick={() => onEmail(lead.email!)}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            {lead.phone && (
              <DropdownMenuItem onClick={() => onPhone(lead.phone!)}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {statusOrder
              .filter((s) => s !== lead.status)
              .map((status) => (
                <DropdownMenuItem key={status} onClick={() => onStatusChange(status)}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Mover a {statusConfig[status].label}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {lead.email && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Mail className="w-3 h-3" />
          <span className="truncate">{lead.email}</span>
        </div>
      )}

      {lead.meeting_scheduled_at && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md w-fit mb-2">
          <Calendar className="w-3 h-3" />
          {format(new Date(lead.meeting_scheduled_at), "d MMM, HH:mm", { locale: es })}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
        </span>
        {lead.source && (
          <Badge variant="outline" className="text-xs">
            {lead.source}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Lead Detail Panel
interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onEmail: (email: string) => void;
  onPhone: (phone: string) => void;
}

function LeadDetailPanel({ lead, onClose, onEdit, onDelete, onStatusChange, onEmail, onPhone }: LeadDetailPanelProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const config = statusConfig[lead.status];
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn("p-6 bg-gradient-to-br", config.gradient)}>
          <div className="flex items-start justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              ← Cerrar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-background">
              <AvatarFallback className="bg-background text-foreground text-xl font-semibold">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{lead.name}</h2>
              <div className={cn("flex items-center gap-2 mt-1", config.color)}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div className="p-4 border-b border-border">
          <label className="text-xs text-muted-foreground mb-2 block">Cambiar estado</label>
          <Select value={lead.status} onValueChange={(v) => onStatusChange(v as LeadStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOrder.map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = statusConfig[status].icon;
                      return <Icon className={cn("w-4 h-4", statusConfig[status].color)} />;
                    })()}
                    {statusConfig[status].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact Actions */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-2 gap-3">
            {lead.email && (
              <Button variant="outline" className="gap-2" onClick={() => onEmail(lead.email!)}>
                <Mail className="w-4 h-4" />
                Email
              </Button>
            )}
            {lead.phone && (
              <Button variant="outline" className="gap-2" onClick={() => onPhone(lead.phone!)}>
                <Phone className="w-4 h-4" />
                Llamar
              </Button>
            )}
          </div>
        </div>

        {/* Details */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {lead.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{lead.email}</p>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{lead.phone}</p>
                </div>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-sm">{lead.company}</p>
                </div>
              </div>
            )}

            {lead.source && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fuente</p>
                  <p className="text-sm">{lead.source}</p>
                </div>
              </div>
            )}

            {lead.meeting_scheduled_at && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Reunión programada</p>
                  <p className="text-sm text-primary font-medium">
                    {format(new Date(lead.meeting_scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            )}

            {lead.notes && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Creado</p>
                <p className="text-sm">{format(new Date(lead.created_at), "d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
            </div>

            {lead.profiles && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Asignado a</p>
                  <p className="text-sm">{lead.profiles.full_name || lead.profiles.email}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

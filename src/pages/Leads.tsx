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
import { ConvertLeadDialog } from "@/components/leads/ConvertLeadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Kanban components
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";

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
    color: "text-success",
    bgColor: "bg-success/10 border-success/20",
    icon: Star,
    gradient: "from-success/20 to-success/10",
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
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

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
    if (newStatus === "converted") {
      setConvertingLead(lead);
      setIsConvertDialogOpen(true);
      return;
    }
    updateLead.mutate(
      { id: lead.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Lead movido a "${statusConfig[newStatus].label}"`);
        },
      },
    );
  };

  const handleDragEnd = (itemId: string, newStatus: string) => {
    if (statusOrder.includes(newStatus as LeadStatus)) {
      const lead = leads?.find(l => l.id === itemId);
      if (lead && lead.status !== newStatus) {
        handleStatusChange(lead, newStatus as LeadStatus);
      }
    }
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  const totalLeads = leads?.length || 0;
  const newLeads = leadsByStatus.new?.length || 0;
  const convertedLeads = leadsByStatus.converted?.length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Lead Card Component
  const LeadCardContent = ({ lead }: { lead: Lead }) => {
    const config = statusConfig[lead.status];
    
    return (
      <div
        className={cn(
          "group bg-card border border-border/50 rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30",
          selectedLeadId === lead.id && "ring-2 ring-primary border-primary/50"
        )}
        onClick={() => setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className={cn("font-medium text-sm", config.bgColor, config.color)}>
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{lead.name}</p>
              {lead.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Building className="w-3 h-3 flex-shrink-0" />
                  {lead.company}
                </p>
              )}
            </div>
          </div>
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
              {statusOrder.map((status) => {
                const StatusIcon = statusConfig[status].icon;
                return (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(lead, status)}
                    disabled={lead.status === status}
                  >
                    <StatusIcon className={cn("w-4 h-4 mr-2", statusConfig[status].color)} />
                    {statusConfig[status].label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteClick(lead)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {lead.source && (
            <Badge variant="outline" className="text-xs">
              {lead.source}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}</span>
        </div>
      </div>
    );
  };

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
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Pipeline de Leads
          </h1>
          <p className="text-muted-foreground mt-1 text-xs lg:text-sm hidden sm:block">Arrastra leads entre columnas para cambiar estado</p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg lg:text-2xl font-bold">{totalLeads}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Total Leads</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-blue-500/10">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg lg:text-2xl font-bold">{newLeads}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Nuevos</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-violet-500/10">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg lg:text-2xl font-bold">{convertedLeads}</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Convertidos</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 lg:p-4 border border-border/50">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2.5 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg lg:text-2xl font-bold">{conversionRate}%</p>
              <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Conversión</p>
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
        <KanbanBoard
          items={filteredLeads}
          onDragEnd={handleDragEnd}
          renderOverlay={(lead) => <LeadCardContent lead={lead} />}
        >
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
              {statusOrder.map((status) => {
                const config = statusConfig[status];
                const StatusIcon = config.icon;
                const columnLeads = leadsByStatus[status] || [];

                return (
                  <KanbanColumn
                    key={status}
                    id={status}
                    title={config.label}
                    count={columnLeads.length}
                    icon={<StatusIcon className="w-4 h-4" />}
                    iconColor={config.color}
                    gradient={config.gradient}
                    emptyMessage="Arrastra leads aquí"
                  >
                    {columnLeads.map((lead) => (
                      <KanbanCard key={lead.id} id={lead.id}>
                        <LeadCardContent lead={lead} />
                      </KanbanCard>
                    ))}
                  </KanbanColumn>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </KanbanBoard>
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

      {/* Edit Dialog */}
      {editingLead && (
        <EditLeadDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={editingLead}
        />
      )}

      {/* Delete Confirmation */}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConvertLeadDialog
        lead={convertingLead}
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
      />
    </div>
  );
}

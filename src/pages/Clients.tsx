import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  MapPin,
  DollarSign,
  FolderKanban,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Users,
  TrendingUp,
  LayoutGrid,
  List,
  X,
  Briefcase,
  Globe,
  FileText,
  ChevronRight,
  Sparkles,
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
import { cn } from "@/lib/utils";
import { useClients, useDeleteClient, Client } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useTransactions } from "@/hooks/useTransactions";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewMode = "grid" | "list";

export default function Clients() {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();
  const { data: projects } = useProjects();
  const { data: transactions } = useTransactions();
  const deleteClient = useDeleteClient();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    return (
      clients?.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company?.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || []
    );
  }, [clients, searchQuery]);

  const selectedClient = selectedClientId ? clients?.find((c) => c.id === selectedClientId) : null;

  // Calculate client stats
  const getClientStats = (clientId: string) => {
    const clientProjects = projects?.filter((p) => p.client_id === clientId) || [];
    const clientTransactions = transactions?.filter((t) => t.client_id === clientId && t.type === "income") || [];
    const totalRevenue = clientTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const activeProjects = clientProjects.filter((p) => p.status === "active").length;
    const completedProjects = clientProjects.filter((p) => p.status === "completed").length;

    return { totalRevenue, activeProjects, completedProjects, totalProjects: clientProjects.length };
  };

  // Global stats
  const globalStats = useMemo(() => {
    if (!clients) return { total: 0, totalRevenue: 0, avgRevenue: 0, withProjects: 0 };

    let totalRevenue = 0;
    let withProjects = 0;

    clients.forEach((client) => {
      const stats = getClientStats(client.id);
      totalRevenue += stats.totalRevenue;
      if (stats.totalProjects > 0) withProjects++;
    });

    return {
      total: clients.length,
      totalRevenue,
      avgRevenue: clients.length > 0 ? totalRevenue / clients.length : 0,
      withProjects,
    };
  }, [clients, projects, transactions]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient.mutate(clientToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setClientToDelete(null);
          if (selectedClientId === clientToDelete.id) {
            setSelectedClientId(null);
          }
        },
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const openEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  // Stats Card Component
  const StatsCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    color: string;
  }) => (
    <div className="glass rounded-xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2",
          color,
        )}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg", color.replace("bg-", "bg-").replace("/20", "/15"))}>
          <Icon className={cn("w-5 h-5", color.replace("bg-", "text-").replace("/20", ""))} />
        </div>
      </div>
    </div>
  );

  // Client Card Component for Grid View
  const ClientCard = ({ client }: { client: Client }) => {
    const stats = getClientStats(client.id);
    const isSelected = selectedClientId === client.id;

    return (
      <div
        onClick={() => setSelectedClientId(client.id)}
        className={cn(
          "glass rounded-xl p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] animate-fade-in relative overflow-hidden",
          isSelected && "ring-2 ring-primary shadow-lg shadow-primary/10",
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-14 h-14 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{client.name}</h3>
              {client.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{client.company}</span>
                </p>
              )}
            </div>
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
              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {client.email && (
                <DropdownMenuItem onClick={() => openEmail(client.email!)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </DropdownMenuItem>
              )}
              {client.phone && (
                <DropdownMenuItem onClick={() => openPhone(client.phone!)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p className="text-sm font-semibold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-info/10">
              <FolderKanban className="w-3.5 h-3.5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proyectos</p>
              <p className="text-sm font-semibold">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        {client.email && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>
    );
  };

  // Client Row Component for List View
  const ClientRow = ({ client }: { client: Client }) => {
    const stats = getClientStats(client.id);
    const isSelected = selectedClientId === client.id;

    return (
      <div
        onClick={() => setSelectedClientId(client.id)}
        className={cn(
          "glass rounded-xl p-4 cursor-pointer group transition-all duration-200 hover:bg-secondary/30 animate-fade-in flex items-center gap-4",
          isSelected && "ring-2 ring-primary bg-primary/5",
        )}
      >
        <Avatar className="w-11 h-11 border-2 border-primary/20 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{client.name}</h3>
            {client.company && <p className="text-xs text-muted-foreground truncate">{client.company}</p>}
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            {client.email && (
              <>
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="text-primary font-medium">${stats.totalRevenue.toLocaleString()}</span>
            <span className="text-muted-foreground">{stats.totalProjects} proyectos</span>
          </div>

          <div className="hidden md:flex items-center justify-end gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
              Activo
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
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
              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {client.email && (
                <DropdownMenuItem onClick={() => openEmail(client.email!)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </DropdownMenuItem>
              )}
              {client.phone && (
                <DropdownMenuItem onClick={() => openPhone(client.phone!)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  // Detail Panel Component
  const DetailPanel = () => {
    if (!selectedClient) return null;
    const stats = getClientStats(selectedClient.id);

    return (
      <div className="glass rounded-2xl overflow-hidden animate-slide-up h-fit sticky top-6">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={() => setSelectedClientId(null)}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="relative flex items-center gap-4">
            <Avatar className="w-16 h-16 border-3 border-primary/30 shadow-lg shadow-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold">
                {getInitials(selectedClient.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{selectedClient.name}</h2>
              {selectedClient.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Building className="w-4 h-4" />
                  {selectedClient.company}
                </p>
              )}
              <Badge className="mt-2 bg-success/20 text-success border-success/30">Cliente Activo</Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-2 gap-3 border-b border-border/50">
          <div className="text-center p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors">
            <DollarSign className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Ingresos Totales</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-info/10 hover:bg-info/15 transition-colors">
            <FolderKanban className="w-5 h-5 mx-auto text-info mb-1" />
            <p className="text-lg font-bold">{stats.totalProjects}</p>
            <p className="text-xs text-muted-foreground">Proyectos</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Contacto</h4>

          {selectedClient.email && (
            <button
              onClick={() => openEmail(selectedClient.email!)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedClient.email}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {selectedClient.phone && (
            <button
              onClick={() => openPhone(selectedClient.phone!)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Phone className="w-4 h-4 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{selectedClient.phone}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {selectedClient.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="p-2 rounded-lg bg-warning/10">
                <MapPin className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm font-medium">{selectedClient.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {selectedClient.notes && (
          <div className="p-4 border-t border-border/50">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Notas
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/20 rounded-lg p-3">
              {selectedClient.notes}
            </p>
          </div>
        )}

        {/* Meta Info */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Creado el {format(new Date(selectedClient.created_at), "d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border/50 flex gap-2">
          <Button
            className="flex-1 gap-2"
            onClick={() => selectedClient.email && openEmail(selectedClient.email)}
            disabled={!selectedClient.email}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => selectedClient.phone && openPhone(selectedClient.phone)}
            disabled={!selectedClient.phone}
          >
            <Phone className="w-4 h-4" />
            Llamar
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditClient(selectedClient)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">Gestiona y administra las relaciones con tus clientes</p>
        </div>
        <CreateClientDialog
          trigger={
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </Button>
          }
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Total Clientes"
          value={globalStats.total}
          subValue={`${globalStats.withProjects} con proyectos`}
          color="bg-primary/20"
        />
        <StatsCard
          icon={DollarSign}
          label="Ingresos Totales"
          value={`$${globalStats.totalRevenue.toLocaleString()}`}
          color="bg-success/20"
        />
        <StatsCard
          icon={TrendingUp}
          label="Promedio por Cliente"
          value={`$${Math.round(globalStats.avgRevenue).toLocaleString()}`}
          color="bg-info/20"
        />
        <StatsCard
          icon={Briefcase}
          label="Clientes con Proyectos"
          value={globalStats.withProjects}
          subValue={`${globalStats.total > 0 ? Math.round((globalStats.withProjects / globalStats.total) * 100) : 0}% del total`}
          color="bg-warning/20"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            className="pl-10 bg-secondary/30 border-border/50 focus:bg-background transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="h-9">
            <TabsList className="h-9 p-1 bg-secondary/50">
              <TabsTrigger value="grid" className="h-7 px-3 gap-1.5 data-[state=active]:bg-background">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="h-7 px-3 gap-1.5 data-[state=active]:bg-background">
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {filteredClients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery
              ? "No se encontraron clientes con ese criterio de búsqueda"
              : "Comienza agregando tu primer cliente para gestionar tus relaciones comerciales"}
          </p>
          {!searchQuery && (
            <CreateClientDialog
              trigger={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Primer Cliente
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List/Grid */}
          <div className={cn("space-y-4", selectedClient ? "lg:col-span-2" : "lg:col-span-3")}>
            {viewMode === "grid" ? (
              <div
                className={cn(
                  "grid gap-4",
                  selectedClient ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {filteredClients.map((client) => (
                  <ClientCard key={client.id} client={client} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedClient && (
            <div className="lg:col-span-1">
              <DetailPanel />
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <EditClientDialog client={editingClient} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
              <span className="font-semibold"> {clientToDelete?.name}</span> y todos sus datos asociados.
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

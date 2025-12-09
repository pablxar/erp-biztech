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
  MapPin,
  DollarSign,
  FolderKanban,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
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

const statusConfig = {
  active: { label: "Activo", color: "bg-success/20 text-success border-success/30" },
  prospect: { label: "Prospecto", color: "bg-warning/20 text-warning border-warning/30" },
  inactive: { label: "Inactivo", color: "bg-muted text-muted-foreground border-muted" },
};

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const { data: projects } = useProjects();
  const { data: transactions } = useTransactions();
  const deleteClient = useDeleteClient();
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filter clients based on search
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedClient = selectedClientId 
    ? clients?.find(c => c.id === selectedClientId) 
    : filteredClients[0];

  // Calculate client stats
  const getClientStats = (clientId: string) => {
    const clientProjects = projects?.filter(p => p.client_id === clientId) || [];
    const clientTransactions = transactions?.filter(t => t.client_id === clientId && t.type === 'income') || [];
    const totalRevenue = clientTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const activeProjects = clientProjects.filter(p => p.status === 'active').length;
    const completedProjects = clientProjects.filter(p => p.status === 'completed').length;
    
    return { totalRevenue, activeProjects, completedProjects, totalProjects: clientProjects.length };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
    window.open(`mailto:${email}`, '_blank');
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">Gestión de relaciones con clientes</p>
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de relaciones con clientes
          </p>
        </div>
        <CreateClientDialog />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar clientes..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No se encontraron clientes con ese criterio" : "Comienza agregando tu primer cliente"}
          </p>
          {!searchQuery && <CreateClientDialog />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredClients.map((client) => {
              const stats = getClientStats(client.id);
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={cn(
                    "glass glass-hover rounded-xl p-4 cursor-pointer animate-fade-in group",
                    selectedClient?.id === client.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{client.name}</h3>
                          <Badge className={cn("text-xs border", statusConfig.active.color)}>
                            {statusConfig.active.label}
                          </Badge>
                        </div>
                        {client.company && (
                          <p className="text-sm text-muted-foreground">{client.company}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-primary">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.activeProjects} activos • {stats.completedProjects} completados
                        </p>
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
                            Editar cliente
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
                          {client.email && (
                            <DropdownMenuItem onClick={() => copyToClipboard(client.email!, "Email")}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(client)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Client Detail */}
          {selectedClient && (
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                        {getInitials(selectedClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                      <Badge className={cn("text-xs border mt-1", statusConfig.active.color)}>
                        {statusConfig.active.label}
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
                      <DropdownMenuItem onClick={() => handleEditClient(selectedClient)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar cliente
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(selectedClient)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  {selectedClient.email && (
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => openEmail(selectedClient.email!)}
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedClient.email}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => openPhone(selectedClient.phone!)}
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedClient.phone}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  {selectedClient.company && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedClient.company}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedClient.address}</span>
                    </div>
                  )}
                </div>

                {(() => {
                  const stats = getClientStats(selectedClient.id);
                  return (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 rounded-lg bg-primary/10">
                        <DollarSign className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-info/10">
                        <FolderKanban className="w-5 h-5 mx-auto text-info mb-1" />
                        <p className="text-lg font-bold">{stats.totalProjects}</p>
                        <p className="text-xs text-muted-foreground">Proyectos</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-2 mt-6">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => selectedClient.email && openEmail(selectedClient.email)}
                    disabled={!selectedClient.email}
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Email
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
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="glass rounded-xl p-6 animate-slide-up">
                  <h4 className="font-semibold mb-4">Notas</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedClient.notes}</p>
                </div>
              )}

              {/* Created info */}
              <div className="glass rounded-xl p-6 animate-slide-up">
                <h4 className="font-semibold mb-4">Información</h4>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">Cliente desde</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(selectedClient.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Edit Button */}
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => handleEditClient(selectedClient)}
              >
                <Edit className="w-4 h-4" />
                Editar información del cliente
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Client Dialog */}
      <EditClientDialog
        client={editingClient}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{clientToDelete?.name}</strong> y no se puede deshacer.
              Los proyectos y transacciones asociados no serán eliminados.
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
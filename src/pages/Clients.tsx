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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useTransactions } from "@/hooks/useTransactions";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  active: { label: "Activo", color: "bg-success/20 text-success border-success/30" },
  prospect: { label: "Prospecto", color: "bg-warning/20 text-warning border-warning/30" },
  inactive: { label: "Inactivo", color: "bg-muted text-muted-foreground border-muted" },
};

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const { data: projects } = useProjects();
  const { data: transactions } = useTransactions();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
                    "glass glass-hover rounded-xl p-4 cursor-pointer animate-fade-in",
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
                    <div className="text-right">
                      <p className="font-semibold text-primary">${stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.activeProjects} activos • {stats.completedProjects} completados
                      </p>
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
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedClient.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedClient.phone}</span>
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
                  <Button className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Phone className="w-4 h-4" />
                    Llamar
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="glass rounded-xl p-6 animate-slide-up">
                  <h4 className="font-semibold mb-4">Notas</h4>
                  <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

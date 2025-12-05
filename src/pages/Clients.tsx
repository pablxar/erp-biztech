import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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

const clients = [
  {
    id: 1,
    name: "BizTech Inc.",
    contact: "Carlos Rodríguez",
    email: "carlos@biztech.com",
    phone: "+52 55 1234 5678",
    industry: "Tecnología",
    location: "Ciudad de México",
    status: "active",
    totalRevenue: 125000,
    activeProjects: 2,
    completedProjects: 5,
    lastContact: "5 Dic 2025",
    avatar: "BT",
    pipelineStage: "cliente",
  },
  {
    id: 2,
    name: "TechStore",
    contact: "María García",
    email: "maria@techstore.com",
    phone: "+52 33 9876 5432",
    industry: "E-commerce",
    location: "Guadalajara",
    status: "active",
    totalRevenue: 85000,
    activeProjects: 1,
    completedProjects: 3,
    lastContact: "3 Dic 2025",
    avatar: "TS",
    pipelineStage: "cliente",
  },
  {
    id: 3,
    name: "Consulting Pro",
    contact: "Roberto Méndez",
    email: "roberto@consultingpro.mx",
    phone: "+52 81 5555 1234",
    industry: "Consultoría",
    location: "Monterrey",
    status: "active",
    totalRevenue: 95000,
    activeProjects: 1,
    completedProjects: 4,
    lastContact: "1 Dic 2025",
    avatar: "CP",
    pipelineStage: "cliente",
  },
  {
    id: 4,
    name: "DataViz Corp",
    contact: "Ana López",
    email: "ana@dataviz.com",
    phone: "+52 55 8888 9999",
    industry: "Analytics",
    location: "Ciudad de México",
    status: "prospect",
    totalRevenue: 15000,
    activeProjects: 1,
    completedProjects: 0,
    lastContact: "28 Nov 2025",
    avatar: "DV",
    pipelineStage: "propuesta",
  },
  {
    id: 5,
    name: "Innovate Labs",
    contact: "Pedro Sánchez",
    email: "pedro@innovatelabs.io",
    phone: "+52 33 7777 8888",
    industry: "Startups",
    location: "Guadalajara",
    status: "prospect",
    totalRevenue: 0,
    activeProjects: 0,
    completedProjects: 0,
    lastContact: "25 Nov 2025",
    avatar: "IL",
    pipelineStage: "contacto",
  },
];

const pipelineStages = [
  { id: "contacto", title: "Contacto Inicial", count: 1, color: "bg-muted" },
  { id: "calificacion", title: "Calificación", count: 0, color: "bg-info/20" },
  { id: "propuesta", title: "Propuesta", count: 1, color: "bg-warning/20" },
  { id: "negociacion", title: "Negociación", count: 0, color: "bg-primary/20" },
  { id: "cliente", title: "Cliente", count: 3, color: "bg-success/20" },
];

const statusConfig = {
  active: { label: "Activo", color: "bg-success/20 text-success border-success/30" },
  prospect: { label: "Prospecto", color: "bg-warning/20 text-warning border-warning/30" },
  inactive: { label: "Inactivo", color: "bg-muted text-muted-foreground border-muted" },
};

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [view, setView] = useState<"list" | "pipeline">("list");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de relaciones con clientes (CRM)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className={view === "list" ? "" : "text-muted-foreground"}
          >
            Lista
          </Button>
          <Button
            variant={view === "pipeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("pipeline")}
            className={view === "pipeline" ? "" : "text-muted-foreground"}
          >
            Pipeline
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {view === "pipeline" && (
        <div className="grid grid-cols-5 gap-4 animate-fade-in">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="space-y-3">
              <div className={cn("rounded-lg p-3", stage.color)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{stage.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {clients.filter((c) => c.pipelineStage === stage.id).length}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                {clients
                  .filter((c) => c.pipelineStage === stage.id)
                  .map((client) => (
                    <div
                      key={client.id}
                      className="glass glass-hover rounded-lg p-4 cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                            {client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-sm">{client.name}</h4>
                          <p className="text-xs text-muted-foreground">{client.contact}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>${client.totalRevenue.toLocaleString()}</span>
                        <span>{client.activeProjects} proyectos</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-2 space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={cn(
                  "glass glass-hover rounded-xl p-4 cursor-pointer animate-fade-in",
                  selectedClient.id === client.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {client.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge className={cn("text-xs border", statusConfig[client.status as keyof typeof statusConfig].color)}>
                          {statusConfig[client.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{client.contact}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {client.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${client.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {client.activeProjects} activos • {client.completedProjects} completados
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Client Detail */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                      {selectedClient.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                    <Badge className={cn("text-xs border mt-1", statusConfig[selectedClient.status as keyof typeof statusConfig].color)}>
                      {statusConfig[selectedClient.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.industry}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedClient.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">${selectedClient.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-info/10">
                  <FolderKanban className="w-5 h-5 mx-auto text-info mb-1" />
                  <p className="text-lg font-bold">{selectedClient.activeProjects + selectedClient.completedProjects}</p>
                  <p className="text-xs text-muted-foreground">Proyectos</p>
                </div>
              </div>

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

            {/* Recent Activity */}
            <div className="glass rounded-xl p-6 animate-slide-up">
              <h4 className="font-semibold mb-4">Actividad Reciente</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm">Email enviado</p>
                    <p className="text-xs text-muted-foreground">Propuesta de nuevo proyecto</p>
                    <p className="text-xs text-muted-foreground mt-1">Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm">Pago recibido</p>
                    <p className="text-xs text-muted-foreground">$15,000 - Factura INV-001</p>
                    <p className="text-xs text-muted-foreground mt-1">Hace 5 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <p className="text-sm">Reunión completada</p>
                    <p className="text-xs text-muted-foreground">Revisión de avances Q4</p>
                    <p className="text-xs text-muted-foreground mt-1">Hace 1 semana</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary">
                Ver todo el historial
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

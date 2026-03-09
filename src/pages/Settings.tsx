import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  User,
  Bell,
  Shield,
  Link,
  Building,
  Globe,
  Camera,
} from "lucide-react";

const integrations = [
  { name: "Google Calendar", status: "disconnected", icon: "📅", description: "Sincronizar eventos" },
  { name: "Slack", status: "disconnected", icon: "💬", description: "Notificaciones" },
  { name: "QuickBooks", status: "disconnected", icon: "📊", description: "Contabilidad" },
  { name: "Mailchimp", status: "disconnected", icon: "📧", description: "Marketing" },
];

export default function Settings() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 lg:space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="bg-secondary/50 p-1 inline-flex w-auto">
            <TabsTrigger value="profile" className="gap-1.5 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-1.5 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Link className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">APIs</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 lg:space-y-6">
          <div className="glass rounded-xl p-4 lg:p-6 animate-fade-in">
            <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Información Personal</h3>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-16 h-16 lg:w-24 lg:h-24">
                  <AvatarFallback className="bg-primary/20 text-primary text-lg lg:text-2xl font-semibold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full">
                  <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-base lg:text-lg">Admin Usuario</h4>
                <p className="text-muted-foreground text-sm">Administrador</p>
                <Badge className="bg-primary/20 text-primary border-primary/30 mt-2 text-xs">
                  Plan Pro
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">Nombre</Label>
                <Input id="firstName" defaultValue="Admin" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Apellido</Label>
                <Input id="lastName" defaultValue="Usuario" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue="admin@biztech.com" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                <Input id="phone" defaultValue="+52 55 1234 5678" className="h-9 lg:h-10" />
              </div>
            </div>

            <Button className="mt-6 w-full sm:w-auto" size="sm">Guardar Cambios</Button>
          </div>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-4 lg:space-y-6">
          <div className="glass rounded-xl p-4 lg:p-6 animate-fade-in">
            <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Información de la Empresa</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm">Nombre</Label>
                <Input id="companyName" defaultValue="BizTech Solutions" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc" className="text-sm">RFC</Label>
                <Input id="rfc" defaultValue="BTS123456ABC" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-sm">Dirección</Label>
                <Input id="address" defaultValue="Av. Reforma 123, Col. Centro, CDMX" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail" className="text-sm">Correo Facturación</Label>
                <Input id="companyEmail" type="email" defaultValue="facturacion@biztech.com" className="h-9 lg:h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone" className="text-sm">Teléfono</Label>
                <Input id="companyPhone" defaultValue="+52 55 9876 5432" className="h-9 lg:h-10" />
              </div>
            </div>

            <Button className="mt-6 w-full sm:w-auto" size="sm">Guardar Cambios</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 lg:space-y-6">
          <div className="glass rounded-xl p-4 lg:p-6 animate-fade-in">
            <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Preferencias de Notificaciones</h3>
            
            <div className="space-y-4 lg:space-y-6">
              {[
                { label: "Notificaciones por Email", desc: "Recibir actualizaciones por correo", checked: true },
                { label: "Notificaciones Push", desc: "Notificaciones en el navegador", checked: true },
                { label: "Recordatorios de Tareas", desc: "Alertas de tareas próximas", checked: true },
                { label: "Alertas de Pagos", desc: "Notificaciones de facturas", checked: true },
                { label: "Resumen Semanal", desc: "Resumen de actividad semanal", checked: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
              ))}
            </div>

            <Button className="mt-6 w-full sm:w-auto" size="sm">Guardar Preferencias</Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 lg:space-y-6">
          <div className="glass rounded-xl p-4 lg:p-6 animate-fade-in">
            <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Integraciones</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="p-3 lg:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                      <span className="text-xl lg:text-2xl flex-shrink-0">{integration.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={integration.status === "connected" ? "outline" : "default"}
                      size="sm"
                      className="flex-shrink-0 text-xs h-7 lg:h-8"
                    >
                      {integration.status === "connected" ? "OK" : "Conectar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 lg:space-y-6">
          <div className="glass rounded-xl p-4 lg:p-6 animate-fade-in">
            <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Seguridad de la Cuenta</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Cambiar Contraseña</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm">Actual</Label>
                    <Input id="currentPassword" type="password" className="h-9 lg:h-10" />
                  </div>
                  <div className="hidden sm:block" />
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm">Nueva</Label>
                    <Input id="newPassword" type="password" className="h-9 lg:h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirmar</Label>
                    <Input id="confirmPassword" type="password" className="h-9 lg:h-10" />
                  </div>
                </div>
                <Button size="sm">Actualizar</Button>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Label className="text-sm">Autenticación de Dos Factores</Label>
                    <p className="text-xs text-muted-foreground">Añade seguridad extra</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium text-sm mb-4">Sesiones Activas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-xs lg:text-sm truncate">Chrome - MacOS</p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground truncate">Sesión actual</p>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30 text-[10px] lg:text-xs flex-shrink-0">Activa</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

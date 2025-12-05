import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Palette,
  Link,
  CreditCard,
  Users,
  Building,
  Mail,
  Phone,
  Globe,
  Camera,
} from "lucide-react";

const integrations = [
  { name: "Google Calendar", status: "disconnected", icon: "📅", description: "Sincronizar eventos y reuniones" },
  { name: "Slack", status: "disconnected", icon: "💬", description: "Notificaciones en tiempo real" },
  { name: "QuickBooks", status: "disconnected", icon: "📊", description: "Contabilidad y facturación" },
  { name: "Mailchimp", status: "disconnected", icon: "📧", description: "Marketing y campañas" },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu cuenta y preferencias del sistema
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link className="w-4 h-4" />
            Integraciones
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Información Personal</h3>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-semibold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 w-8 h-8 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-lg">Admin Usuario</h4>
                <p className="text-muted-foreground">Administrador</p>
                <Badge className="bg-primary/20 text-primary border-primary/30 mt-2">
                  Plan Pro
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" defaultValue="Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" defaultValue="Usuario" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue="admin@biztech.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" defaultValue="+52 55 1234 5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Input id="role" defaultValue="Administrador" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Input id="timezone" defaultValue="America/Mexico_City" />
              </div>
            </div>

            <Button className="mt-6">Guardar Cambios</Button>
          </div>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Información de la Empresa</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input id="companyName" defaultValue="BizTech Solutions" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input id="rfc" defaultValue="BTS123456ABC" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" defaultValue="Av. Reforma 123, Col. Centro, CDMX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Correo de Facturación</Label>
                <Input id="companyEmail" type="email" defaultValue="facturacion@biztech.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Teléfono</Label>
                <Input id="companyPhone" defaultValue="+52 55 9876 5432" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" defaultValue="https://biztech.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" defaultValue="MXN (Peso Mexicano)" />
              </div>
            </div>

            <Button className="mt-6">Guardar Cambios</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Preferencias de Notificaciones</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">Recibir actualizaciones por correo electrónico</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones en el navegador</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de Tareas</Label>
                  <p className="text-sm text-muted-foreground">Alertas cuando una tarea está próxima a vencer</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Pagos</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones de facturas y pagos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumen Semanal</Label>
                  <p className="text-sm text-muted-foreground">Recibir un resumen de actividad cada semana</p>
                </div>
                <Switch />
              </div>
            </div>

            <Button className="mt-6">Guardar Preferencias</Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Integraciones Disponibles</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={integration.status === "connected" ? "outline" : "default"}
                      size="sm"
                    >
                      {integration.status === "connected" ? "Conectado" : "Conectar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-6">Seguridad de la Cuenta</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Cambiar Contraseña</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div></div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <Button>Actualizar Contraseña</Button>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">Sesiones Activas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Chrome - MacOS</p>
                        <p className="text-xs text-muted-foreground">Ciudad de México • Sesión actual</p>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30">Activa</Badge>
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

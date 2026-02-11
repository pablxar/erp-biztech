import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldX, Mail } from 'lucide-react';
import bizTechLogo from '@/assets/biztech_logo.png';

export default function AccessDenied() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={bizTechLogo} alt="BizTech" className="h-12" />
          </div>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-muted-foreground mb-6">
            Hola {profile?.full_name || profile?.email}. Tu cuenta no tiene acceso al ERP.
            Contacta a un administrador para ser añadido al equipo.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2">
              <Mail className="w-4 h-4" />
              Contactar Administrador
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

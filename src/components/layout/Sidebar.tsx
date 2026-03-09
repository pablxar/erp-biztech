import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import bizTechLogo from "@/assets/biztech_logo.png";
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Calendar,
  Users,
  Settings,
  Sparkles,
  UserPlus,
  ListTodo,
  Target,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNewLeadsCount } from "@/hooks/useLeads";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useEffect } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: UserPlus, label: "Leads", path: "/leads", showBadge: true },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: FolderKanban, label: "Proyectos", path: "/projects" },
  { icon: ListTodo, label: "Tareas Internas", path: "/team-tasks" },
  { icon: Calendar, label: "Calendario", path: "/calendar" },
  { icon: DollarSign, label: "Finanzas", path: "/finance" },
  { icon: Sparkles, label: "IA Asistente", path: "/ai-assistant" },
  { icon: Target, label: "Metas & Ideas", path: "/goals" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { data: newLeadsCount } = useNewLeadsCount();

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => {
    const showBadge = item.showBadge && newLeadsCount && newLeadsCount > 0;

    return (
      <NavLink
        to={item.path}
        onClick={onNavClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "text-sidebar-foreground/70 hover:bg-secondary hover:text-sidebar-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 opacity-50" />}
            <item.icon className="w-5 h-5 flex-shrink-0 transition-all duration-300 relative z-10 group-hover:scale-110" />
            <span className="font-medium text-sm flex-1 relative z-10">{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-bold relative z-10">
                {newLeadsCount}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar to-background">
      {/* Subtle glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="relative flex items-center justify-center h-16 px-5 border-b border-sidebar-border/50">
        <img src={bizTechLogo} alt="BizTech" className="h-7 w-auto max-w-[140px] object-contain drop-shadow-lg" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-none relative">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Settings */}
      <div className="py-5 px-4 border-t border-sidebar-border/50 relative">
        <NavLink
          to="/settings"
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "text-sidebar-foreground/70 hover:bg-secondary hover:text-sidebar-foreground",
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">Configuración</span>
        </NavLink>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isMobile, mobileOpen, setMobileOpen } = useSidebarContext();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  // Mobile: Sheet sidebar
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-sidebar-border flex flex-col">
      <SidebarContent />
    </aside>
  );
}

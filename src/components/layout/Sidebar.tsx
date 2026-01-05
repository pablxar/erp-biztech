import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/contexts/SidebarContext";
import bizTechLogo from "@/assets/biztech-logo.png";
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useNewLeadsCount } from "@/hooks/useLeads";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderKanban, label: "Proyectos", path: "/projects" },
  { icon: UserPlus, label: "Leads", path: "/leads", showBadge: true },
  { icon: DollarSign, label: "Finanzas", path: "/finance" },
  { icon: Calendar, label: "Calendario", path: "/calendar" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: BarChart3, label: "Reportes", path: "/reports" },
  { icon: Sparkles, label: "IA Asistente", path: "/ai-assistant" },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarContext();
  const { data: newLeadsCount } = useNewLeadsCount();

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => {
    const showBadge = item.showBadge && newLeadsCount && newLeadsCount > 0;
    
    const link = (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            collapsed ? "p-3.5 justify-center mx-auto w-12 h-12" : "px-4 py-3.5",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Glow effect for active state */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 opacity-50" />
            )}
            <item.icon className={cn(
              "flex-shrink-0 transition-all duration-300 relative z-10",
              collapsed ? "w-5 h-5" : "w-5 h-5",
              "group-hover:scale-110"
            )} />
            {!collapsed && (
              <>
                <span className="font-medium text-sm flex-1 relative z-10">{item.label}</span>
                {showBadge && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-bold relative z-10">
                    {newLeadsCount}
                  </Badge>
                )}
              </>
            )}
            {collapsed && showBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold shadow-lg animate-pulse z-20">
                {newLeadsCount > 9 ? '9+' : newLeadsCount}
              </span>
            )}
          </>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={16}
            className="bg-card text-card-foreground border border-border shadow-2xl px-4 py-2.5 text-sm font-medium rounded-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              {item.label}
              {showBadge && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                  {newLeadsCount}
                </Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border transition-all duration-300 ease-out flex flex-col",
        "bg-gradient-to-b from-sidebar to-background",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Subtle glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Logo Section */}
      <div
        className={cn(
          "relative flex items-center h-16 border-b border-sidebar-border/50 transition-all duration-300",
          collapsed ? "px-4 justify-center" : "px-5",
        )}
      >
        <div className={cn(
          "transition-all duration-300 flex items-center justify-center",
          collapsed ? "w-10" : "w-full"
        )}>
          <img
            src={bizTechLogo}
            alt="BizTech"
            className={cn(
              "transition-all duration-300 object-contain drop-shadow-lg",
              collapsed ? "w-10 h-10" : "h-9 w-auto max-w-[140px]"
            )}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-5 overflow-y-auto scrollbar-none relative",
        collapsed ? "px-4 space-y-2" : "px-4 space-y-1.5"
      )}>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Settings & Collapse Section */}
      <div className={cn(
        "py-4 border-t border-sidebar-border/50 space-y-2 relative",
        collapsed ? "px-4" : "px-4"
      )}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-card text-card-foreground border border-border shadow-2xl px-4 py-2.5 text-sm font-medium rounded-xl backdrop-blur-xl"
            >
              Configuración
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">Configuración</span>
          </NavLink>
        )}

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={toggle}
              className={cn(
                "flex items-center gap-3 rounded-xl w-full text-muted-foreground transition-all duration-300",
                "hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20",
                collapsed ? "p-3.5 justify-center w-12 h-12 mx-auto" : "px-4 py-3.5",
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">Colapsar</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent
              side="right"
              sideOffset={16}
              className="bg-card text-card-foreground border border-border shadow-2xl px-4 py-2.5 text-sm font-medium rounded-xl backdrop-blur-xl"
            >
              Expandir
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}

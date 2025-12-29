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
            "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
            collapsed ? "p-3 justify-center" : "px-4 py-3",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )
        }
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110")} />
        {!collapsed && (
          <>
            <span className="font-medium text-sm flex-1">{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                {newLeadsCount}
              </Badge>
            )}
          </>
        )}
        {collapsed && showBadge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
            {newLeadsCount > 9 ? '9+' : newLeadsCount}
          </span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-popover text-popover-foreground border border-border shadow-xl px-3 py-2 text-sm font-medium rounded-lg"
          >
            {item.label}
            {showBadge && ` (${newLeadsCount} nuevos)`}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border transition-all duration-300",
          collapsed ? "px-3 justify-center" : "px-4",
        )}
      >
        <img
          src={bizTechLogo}
          alt="BizTech"
          className={cn("transition-all duration-300 object-contain", collapsed ? "w-10 h-10" : "w-36")}
        />
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 space-y-1 overflow-y-auto scrollbar-none", collapsed ? "px-2" : "px-3")}>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Settings & Collapse */}
      <div className={cn("py-3 border-t border-sidebar-border space-y-1", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center p-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={12}
              className="bg-popover text-popover-foreground border border-border shadow-xl px-3 py-2 text-sm font-medium rounded-lg"
            >
              Configuración
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
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
                "flex items-center gap-3 rounded-xl w-full text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200",
                collapsed ? "p-3 justify-center" : "px-4 py-3",
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 flex-shrink-0" />
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
              sideOffset={12}
              className="bg-popover text-popover-foreground border border-border shadow-xl px-3 py-2 text-sm font-medium rounded-lg"
            >
              Expandir
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}

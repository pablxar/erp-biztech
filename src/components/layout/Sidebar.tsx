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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderKanban, label: "Proyectos", path: "/projects" },
  { icon: DollarSign, label: "Finanzas", path: "/finance" },
  { icon: Calendar, label: "Calendario", path: "/calendar" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: BarChart3, label: "Reportes", path: "/reports" },
  { icon: Sparkles, label: "IA Asistente", path: "/ai-assistant" },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarContext();

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const link = (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center"
          )
        }
      >
        <item.icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          )}
        />
        {!collapsed && (
          <span className="font-medium text-sm">{item.label}</span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.label}
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
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-sidebar-border transition-all duration-300",
        collapsed ? "px-2 justify-center" : "px-4"
      )}>
        <img
          src={bizTechLogo}
          alt="BizTech"
          className={cn("transition-all duration-300", collapsed ? "w-12" : "w-36")}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center px-3 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Configuración
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
                "flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200",
                collapsed && "justify-center"
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
            <TooltipContent side="right" sideOffset={10}>
              Expandir
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}

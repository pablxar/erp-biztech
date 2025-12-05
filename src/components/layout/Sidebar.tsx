import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <img
          src={bizTechLogo}
          alt="BizTech"
          className={cn("transition-all duration-300", collapsed ? "w-12" : "w-36")}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
        ))}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
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
          {!collapsed && <span className="font-medium text-sm">Configuración</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
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
      </div>
    </aside>
  );
}

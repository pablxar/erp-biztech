import { Plus, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Nuevo Proyecto",
      shortLabel: "Proyecto",
      icon: Plus,
      onClick: () => navigate("/projects"),
      variant: "default" as const,
    },
    {
      label: "Ver Reportes",
      shortLabel: "Reportes",
      icon: FileText,
      onClick: () => navigate("/reports"),
      variant: "outline" as const,
    },
    {
      label: "Calendario",
      shortLabel: "Calendario",
      icon: Calendar,
      onClick: () => navigate("/calendar"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
          className={
            action.variant === "default"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-1.5 lg:gap-2 text-xs lg:text-sm h-8 lg:h-9 px-3 lg:px-4"
              : "border-border/50 hover:border-primary/50 hover:bg-primary/5 gap-1.5 lg:gap-2 text-xs lg:text-sm h-8 lg:h-9 px-3 lg:px-4"
          }
        >
          <action.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span className="hidden sm:inline">{action.label}</span>
          <span className="sm:hidden">{action.shortLabel}</span>
        </Button>
      ))}
    </div>
  );
}

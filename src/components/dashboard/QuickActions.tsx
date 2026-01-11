import { Plus, FileText, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Nuevo Proyecto",
      icon: Plus,
      onClick: () => navigate("/projects"),
      variant: "default" as const,
    },
    {
      label: "Ver Reportes",
      icon: FileText,
      onClick: () => navigate("/reports"),
      variant: "outline" as const,
    },
    {
      label: "Calendario",
      icon: Calendar,
      onClick: () => navigate("/calendar"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          onClick={action.onClick}
          className={
            action.variant === "default"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2"
              : "border-border/50 hover:border-primary/50 hover:bg-primary/5 gap-2"
          }
        >
          <action.icon className="w-4 h-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}

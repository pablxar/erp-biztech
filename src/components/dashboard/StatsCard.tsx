import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: string;
  iconGradient?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "from-primary/20 to-primary/5",
  iconGradient = "from-primary to-primary",
}: StatsCardProps) {
  const ChangeIcon = changeType === "positive" ? ArrowUpRight : changeType === "negative" ? ArrowDownRight : Minus;
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-border/50 p-6 transition-all duration-300",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      "bg-gradient-to-br",
      gradient
    )}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              <ChangeIcon className="w-4 h-4" />
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {/* Icon Container */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          "bg-gradient-to-br shadow-lg",
          iconGradient
        )}>
          <Icon className="w-6 h-6 text-background" />
        </div>
      </div>
      
      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

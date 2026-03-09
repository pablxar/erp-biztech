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
      "group relative overflow-hidden rounded-xl lg:rounded-2xl border border-border/50 p-3 sm:p-4 lg:p-6 transition-all duration-300",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      "bg-gradient-to-br",
      gradient
    )}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="space-y-1.5 lg:space-y-3 min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] sm:text-xs lg:text-sm font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              <ChangeIcon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate">{change}</span>
            </div>
          )}
        </div>
        
        {/* Icon Container */}
        <div className={cn(
          "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex-shrink-0",
          "bg-gradient-to-br shadow-lg",
          iconGradient
        )}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-background" />
        </div>
      </div>
      
      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

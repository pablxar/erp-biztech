import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  icon?: React.ReactNode;
  iconColor?: string;
  bgColor?: string;
  gradient?: string;
  children: React.ReactNode;
  emptyMessage?: string;
}

export function KanbanColumn({
  id,
  title,
  count,
  icon,
  iconColor,
  bgColor,
  gradient,
  children,
  emptyMessage = 'No hay elementos',
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex-1 min-w-[300px] max-w-[400px]">
      {/* Column Header */}
      <div
        className={cn(
          "rounded-t-xl p-4 border border-b-0 border-border/50",
          gradient ? `bg-gradient-to-b ${gradient}` : bgColor
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className={iconColor}>{icon}</span>}
            <span className="font-semibold">{title}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>

      {/* Column Content - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "glass rounded-b-xl border border-t-0 border-border/50 p-3 min-h-[400px] space-y-3 transition-all duration-200",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
        )}
      >
        {React.Children.count(children) > 0 ? (
          children
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

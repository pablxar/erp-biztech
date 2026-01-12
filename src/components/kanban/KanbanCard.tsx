import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface KanbanCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

export function KanbanCard({ id, children, className, showHandle = true }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group touch-none",
        isDragging && "opacity-50 z-50",
        className
      )}
      {...attributes}
    >
      {showHandle && (
        <div
          {...listeners}
          className={cn(
            "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center",
            "cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-muted/50 rounded-l-lg"
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        {children}
      </div>
    </div>
  );
}

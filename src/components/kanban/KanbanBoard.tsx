import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface KanbanBoardProps<T extends { id: string }> {
  children: React.ReactNode;
  items: T[];
  onDragEnd: (itemId: string, newStatus: string) => void;
  renderOverlay?: (item: T) => React.ReactNode;
}

export function KanbanBoard<T extends { id: string }>({
  children,
  items,
  onDragEnd,
  renderOverlay,
}: KanbanBoardProps<T>) {
  const [activeItem, setActiveItem] = React.useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const overId = over.id as string;
      // Check if dropped over a column (status)
      onDragEnd(active.id as string, overId);
    }
    
    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeItem && renderOverlay ? (
          <div className="rotate-3 scale-105 opacity-90">
            {renderOverlay(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

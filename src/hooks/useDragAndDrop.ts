import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export { DndContext, DragOverlay, closestCenter };
export type { DragEndEvent, DragOverEvent, DragStartEvent };

export function useDragAndDrop<T extends { id: string }>() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent, items: T[]) => {
    const { active } = event;
    setActiveId(active.id as string);
    const item = items.find((i) => i.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = () => {
    setActiveId(null);
    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveItem(null);
  };

  return {
    activeId,
    activeItem,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}

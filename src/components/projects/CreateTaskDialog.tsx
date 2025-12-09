import { useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { useBulkAssignTask } from '@/hooks/useTaskAssignments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskAssigneeSelector } from './TaskAssigneeSelector';
import { Plus, Loader2 } from 'lucide-react';

interface Props {
  projectId: string;
  trigger?: React.ReactNode;
}

export function CreateTaskDialog({ projectId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    due_date: '',
  });

  const { mutateAsync: createTask, isPending } = useCreateTask();
  const { mutateAsync: bulkAssign } = useBulkAssignTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const task = await createTask({
        title: formData.title,
        description: formData.description || undefined,
        project_id: projectId,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
      });

      if (selectedAssignees.length > 0) {
        await bulkAssign({ taskId: task.id, userIds: selectedAssignees });
      }

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
      });
      setSelectedAssignees([]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-full border border-dashed border-border text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Diseñar wireframes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Por Hacer</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TaskAssigneeSelector
            selectedUserIds={selectedAssignees}
            onSelectionChange={setSelectedAssignees}
          />

          <div className="space-y-2">
            <Label htmlFor="due_date">Fecha de Vencimiento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.title}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

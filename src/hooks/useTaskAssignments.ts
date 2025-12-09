import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  assigned_by: string | null;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useTaskAssignments(taskId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['task-assignments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          user:profiles!task_assignments_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data as TaskAssignment[];
    },
    enabled: !!user && !!taskId,
  });
}

export function useAddTaskAssignment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          user_id: userId,
          assigned_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Miembro asignado');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este miembro ya está asignado');
      } else {
        toast.error('Error al asignar: ' + error.message);
      }
    },
  });
}

export function useRemoveTaskAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Miembro removido');
    },
    onError: (error) => {
      toast.error('Error al remover: ' + error.message);
    },
  });
}

export function useAssignMyself() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('No autenticado');
      
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          assigned_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Te has asignado a la tarea');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ya estás asignado a esta tarea');
      } else {
        toast.error('Error: ' + error.message);
      }
    },
  });
}

export function useBulkAssignTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ taskId, userIds }: { taskId: string; userIds: string[] }) => {
      // First, delete all existing assignments
      const { error: deleteError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId);
      
      if (deleteError) throw deleteError;
      
      // Then, insert new assignments
      if (userIds.length > 0) {
        const assignments = userIds.map(userId => ({
          task_id: taskId,
          user_id: userId,
          assigned_by: user?.id,
        }));
        
        const { error: insertError } = await supabase
          .from('task_assignments')
          .insert(assignments);
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error('Error al actualizar asignaciones: ' + error.message);
    },
  });
}

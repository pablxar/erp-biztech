import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean | null;
  project_id: string | null;
  created_by: string | null;
  created_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

export function useEvents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          project:projects(id, name)
        `)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
}

export function useTodayEvents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['events', 'today'],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          project:projects(id, name)
        `)
        .gte('start_time', startOfDay)
        .lt('start_time', endOfDay)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (event: {
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      all_day?: boolean;
      project_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...event,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

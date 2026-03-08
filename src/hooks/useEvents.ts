import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type EventType = 'meeting' | 'task' | 'deadline' | 'reminder';

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
  event_type: EventType;
  meeting_url: string | null;
  attendee_email: string | null;
  client_id: string | null;
  email_sent: boolean;
  google_event_id: string | null;
  lead_id: string | null;
  project?: {
    id: string;
    name: string;
  } | null;
  client?: {
    id: string;
    name: string;
    email: string | null;
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
          project:projects(id, name),
          client:clients(id, name, email)
        `)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as unknown as Event[];
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
          project:projects(id, name),
          client:clients(id, name, email)
        `)
        .gte('start_time', startOfDay)
        .lt('start_time', endOfDay)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as unknown as Event[];
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
      event_type?: EventType;
      meeting_url?: string;
      attendee_email?: string;
      client_id?: string;
      email_sent?: boolean;
      google_event_id?: string;
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

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      title?: string;
      description?: string | null;
      start_time?: string;
      end_time?: string;
      all_day?: boolean;
      project_id?: string | null;
      event_type?: EventType;
      meeting_url?: string | null;
      attendee_email?: string | null;
      client_id?: string | null;
      email_sent?: boolean;
      google_event_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
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

export function useCreateMeetEvent() {
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      attendee_email?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-meet-event', {
        body: params,
      });
      
      if (error) throw error;
      return data as { meeting_url: string; google_event_id: string };
    },
  });
}

export function useSendEventInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      event_id: string;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      meeting_url?: string;
      attendee_email: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-event-invite', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

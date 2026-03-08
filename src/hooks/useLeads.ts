import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'discarded' | 'converted';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  assigned_to: string | null;
  meeting_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function useLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          profiles:assigned_to (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useLeadsByStatus(status: LeadStatus) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          profiles:assigned_to (
            full_name,
            email
          )
        `)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useNewLeadsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", "new", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      notes?: string;
      assigned_to?: string;
      meeting_scheduled_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      status?: LeadStatus;
      notes?: string;
      assigned_to?: string | null;
      meeting_scheduled_at?: string | null;
      converted_at?: string | null;
      contacted_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

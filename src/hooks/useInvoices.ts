import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  project_id: string | null;
  amount: number;
  tax_amount: number | null;
  status: string;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  client?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

export function useInvoices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(id, name),
          project:projects(id, name)
        `)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (invoice: {
      invoice_number: string;
      client_id?: string;
      project_id?: string;
      amount: number;
      tax_amount?: number;
      status?: string;
      due_date?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, paid_date }: { id: string; status: string; paid_date?: string }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status, paid_date })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string | null;
  project_id: string | null;
  client_id: string | null;
  date: string;
  created_by: string | null;
  created_at: string;
  projects?: {
    id: string;
    name: string;
  } | null;
  clients?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  project_id?: string;
  client_id?: string;
  date?: string;
}

export function useTransactions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          projects (
            id,
            name
          ),
          clients (
            id,
            name
          )
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useFinancialStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, date');
      
      if (error) throw error;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const monthlyIncome = data
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const monthlyExpenses = data
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        totalIncome: income,
        totalExpenses: expenses,
        monthlyIncome,
        monthlyExpenses,
        netMargin: income - expenses,
        marginPercentage: income > 0 ? ((income - expenses) / income * 100) : 0,
      };
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      toast.success('Transacción registrada');
    },
    onError: (error) => {
      toast.error('Error al registrar: ' + error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      toast.success('Transacción eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}

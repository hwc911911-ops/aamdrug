import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/lib/types';

export function useTransactions(date?: string, drugId?: string) {
  return useQuery({
    queryKey: ['transactions', date, drugId],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*, drug:drugs(*), batch:drug_batches(*)')
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('transaction_date', date);
      }
      
      if (drugId) {
        query = query.eq('drug_id', drugId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: {
      drug_id: string;
      batch_id?: string;
      transaction_date: string;
      opening_stock: number;
      received: number;
      used: number;
      closing_stock: number;
      remarks?: string;
    }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update batch quantity if batch specified
      if (transaction.batch_id) {
        const netChange = transaction.received - transaction.used;
        const { data: batch } = await supabase
          .from('drug_batches')
          .select('current_quantity')
          .eq('id', transaction.batch_id)
          .single();
        
        if (batch) {
          await supabase
            .from('drug_batches')
            .update({ current_quantity: batch.current_quantity + netChange })
            .eq('id', transaction.batch_id);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useTodayTransactionCount() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-transactions-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_date', today);
      
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useLastTransaction(drugId: string) {
  return useQuery({
    queryKey: ['last-transaction', drugId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('drug_id', drugId)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Transaction | null;
    },
    enabled: !!drugId,
  });
}

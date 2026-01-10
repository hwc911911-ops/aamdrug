import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DrugBatch } from '@/lib/types';

export function useBatches(drugId?: string) {
  return useQuery({
    queryKey: ['batches', drugId],
    queryFn: async () => {
      let query = supabase
        .from('drug_batches')
        .select('*, drug:drugs(*)')
        .eq('is_active', true)
        .order('exp_date', { ascending: true });
      
      if (drugId) {
        query = query.eq('drug_id', drugId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DrugBatch[];
    },
  });
}

export function useAddBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (batch: {
      drug_id: string;
      batch_number: string;
      mfg_date: string;
      exp_date: string;
      initial_quantity: number;
      current_quantity: number;
    }) => {
      const { data, error } = await supabase
        .from('drug_batches')
        .insert(batch)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DrugBatch> & { id: string }) => {
      const { data, error } = await supabase
        .from('drug_batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
    },
  });
}

export function useExpiringBatches(days: number = 90) {
  return useQuery({
    queryKey: ['expiring-batches', days],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const { data, error } = await supabase
        .from('drug_batches')
        .select('*, drug:drugs(*)')
        .eq('is_active', true)
        .gt('current_quantity', 0)
        .lte('exp_date', futureDate.toISOString().split('T')[0])
        .order('exp_date', { ascending: true });
      
      if (error) throw error;
      return data as DrugBatch[];
    },
  });
}

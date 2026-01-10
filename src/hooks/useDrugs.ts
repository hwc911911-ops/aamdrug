import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Drug, DrugCategory, DrugUnit } from '@/lib/types';

export function useDrugs() {
  return useQuery({
    queryKey: ['drugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Drug[];
    },
  });
}

export function useDrug(id: string) {
  return useQuery({
    queryKey: ['drugs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Drug | null;
    },
    enabled: !!id,
  });
}

export function useAddDrug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (drug: {
      name: string;
      category: DrugCategory;
      unit: DrugUnit;
      min_stock_threshold: number;
    }) => {
      const { data, error } = await supabase
        .from('drugs')
        .insert(drug)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
}

export function useUpdateDrug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Drug> & { id: string }) => {
      const { data, error } = await supabase
        .from('drugs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });
}

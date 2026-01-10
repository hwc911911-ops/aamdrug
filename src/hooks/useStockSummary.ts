import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Drug, DrugBatch, StockSummary } from '@/lib/types';

export function useStockSummary() {
  return useQuery({
    queryKey: ['stock-summary'],
    queryFn: async () => {
      // Get all active drugs
      const { data: drugs, error: drugsError } = await supabase
        .from('drugs')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (drugsError) throw drugsError;
      
      // Get all active batches
      const { data: batches, error: batchesError } = await supabase
        .from('drug_batches')
        .select('*')
        .eq('is_active', true);
      
      if (batchesError) throw batchesError;
      
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiryThreshold = thirtyDaysFromNow.toISOString().split('T')[0];
      
      // Calculate stock summary for each drug
      const summaries: StockSummary[] = (drugs as Drug[]).map((drug) => {
        const drugBatches = (batches as DrugBatch[]).filter(b => b.drug_id === drug.id);
        const activeBatches = drugBatches.filter(b => b.exp_date >= today);
        const currentStock = activeBatches.reduce((sum, b) => sum + b.current_quantity, 0);
        
        // Check for expiring batches (within 30 days)
        const expiringBatches = activeBatches.filter(
          b => b.exp_date <= expiryThreshold && b.current_quantity > 0
        );
        
        // Check for expired batches with stock
        const expiredBatches = drugBatches.filter(
          b => b.exp_date < today && b.current_quantity > 0
        );
        
        let status: 'good' | 'low' | 'critical' | 'expired' = 'good';
        
        if (expiredBatches.length > 0) {
          status = 'expired';
        } else if (currentStock === 0) {
          status = 'critical';
        } else if (currentStock <= drug.min_stock_threshold) {
          status = 'low';
        }
        
        return {
          drug,
          current_stock: currentStock,
          batches: drugBatches,
          status,
          expiring_soon: expiringBatches.length > 0,
        };
      });
      
      return summaries;
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiryThreshold = thirtyDaysFromNow.toISOString().split('T')[0];
      
      // Get total drugs
      const { count: totalDrugs } = await supabase
        .from('drugs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Get today's transactions
      const { count: todayTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_date', today);
      
      // Get active batches for stock analysis
      const { data: batches } = await supabase
        .from('drug_batches')
        .select('*, drug:drugs(*)')
        .eq('is_active', true);
      
      // Get all drugs with thresholds
      const { data: drugs } = await supabase
        .from('drugs')
        .select('*')
        .eq('is_active', true);
      
      // Calculate low stock count
      const drugStocks = new Map<string, number>();
      const drugThresholds = new Map<string, number>();
      
      (drugs || []).forEach((drug: Drug) => {
        drugStocks.set(drug.id, 0);
        drugThresholds.set(drug.id, drug.min_stock_threshold);
      });
      
      (batches || []).forEach((batch: DrugBatch) => {
        if (batch.exp_date >= today) {
          const current = drugStocks.get(batch.drug_id) || 0;
          drugStocks.set(batch.drug_id, current + batch.current_quantity);
        }
      });
      
      let lowStockCount = 0;
      drugStocks.forEach((stock, drugId) => {
        const threshold = drugThresholds.get(drugId) || 0;
        if (stock <= threshold && stock > 0) {
          lowStockCount++;
        }
      });
      
      // Count expiring soon (within 30 days)
      const expiringBatches = (batches || []).filter(
        (b: DrugBatch) => 
          b.exp_date >= today && 
          b.exp_date <= expiryThreshold && 
          b.current_quantity > 0
      );
      
      return {
        totalDrugs: totalDrugs || 0,
        lowStockCount,
        expiringSoon: expiringBatches.length,
        todayTransactions: todayTransactions || 0,
      };
    },
  });
}

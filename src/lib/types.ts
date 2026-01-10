export type DrugCategory = 
  | 'tablet'
  | 'capsule'
  | 'liquid'
  | 'injectable'
  | 'topical'
  | 'respiratory'
  | 'surgical'
  | 'diagnostic'
  | 'contraceptive'
  | 'vitamin'
  | 'other';

export type DrugUnit = 
  | 'tablets'
  | 'capsules'
  | 'ml'
  | 'vials'
  | 'ampoules'
  | 'bottles'
  | 'tubes'
  | 'strips'
  | 'packets'
  | 'units'
  | 'pieces';

export interface Drug {
  id: string;
  name: string;
  category: DrugCategory;
  unit: DrugUnit;
  min_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DrugBatch {
  id: string;
  drug_id: string;
  batch_number: string;
  mfg_date: string;
  exp_date: string;
  initial_quantity: number;
  current_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  drug?: Drug;
}

export interface Transaction {
  id: string;
  drug_id: string;
  batch_id: string | null;
  transaction_date: string;
  opening_stock: number;
  received: number;
  used: number;
  closing_stock: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  drug?: Drug;
  batch?: DrugBatch;
}

export interface ActivityLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface StockSummary {
  drug: Drug;
  current_stock: number;
  batches: DrugBatch[];
  status: 'good' | 'low' | 'critical' | 'expired';
  expiring_soon: boolean;
}

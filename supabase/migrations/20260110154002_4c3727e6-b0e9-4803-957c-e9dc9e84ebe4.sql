-- Create enum for drug categories
CREATE TYPE public.drug_category AS ENUM (
  'tablet',
  'capsule',
  'liquid',
  'injectable',
  'topical',
  'respiratory',
  'surgical',
  'diagnostic',
  'contraceptive',
  'vitamin',
  'other'
);

-- Create enum for unit types
CREATE TYPE public.drug_unit AS ENUM (
  'tablets',
  'capsules',
  'ml',
  'vials',
  'ampoules',
  'bottles',
  'tubes',
  'strips',
  'packets',
  'units',
  'pieces'
);

-- Create drugs master table (129 drugs from Excel)
CREATE TABLE public.drugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category drug_category NOT NULL DEFAULT 'other',
  unit drug_unit NOT NULL DEFAULT 'units',
  min_stock_threshold INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drug_batches table for batch tracking
CREATE TABLE public.drug_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  mfg_date DATE NOT NULL,
  exp_date DATE NOT NULL,
  initial_quantity INTEGER NOT NULL DEFAULT 0,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for daily entries
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.drug_batches(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_stock INTEGER NOT NULL DEFAULT 0,
  received INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  closing_stock INTEGER NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_log table for audit trail
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for now, allow all authenticated users)
-- Drugs table policies
CREATE POLICY "Anyone can view drugs" ON public.drugs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert drugs" ON public.drugs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drugs" ON public.drugs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drugs" ON public.drugs FOR DELETE USING (true);

-- Drug batches policies
CREATE POLICY "Anyone can view drug_batches" ON public.drug_batches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert drug_batches" ON public.drug_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drug_batches" ON public.drug_batches FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drug_batches" ON public.drug_batches FOR DELETE USING (true);

-- Transactions policies
CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Activity log policies
CREATE POLICY "Anyone can view activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_drugs_updated_at
  BEFORE UPDATE ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drug_batches_updated_at
  BEFORE UPDATE ON public.drug_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create validation trigger for expiry date
CREATE OR REPLACE FUNCTION public.validate_batch_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.exp_date <= NEW.mfg_date THEN
    RAISE EXCEPTION 'Expiry date must be after manufacturing date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_drug_batch_dates
  BEFORE INSERT OR UPDATE ON public.drug_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_batch_dates();

-- Create index for faster queries
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_drug_id ON public.transactions(drug_id);
CREATE INDEX idx_drug_batches_drug_id ON public.drug_batches(drug_id);
CREATE INDEX idx_drug_batches_exp_date ON public.drug_batches(exp_date);
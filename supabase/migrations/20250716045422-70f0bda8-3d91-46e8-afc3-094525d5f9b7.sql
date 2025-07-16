-- Create marketplace category mappings table
CREATE TABLE public.marketplace_category_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_name TEXT NOT NULL,
  marketplace_category_id TEXT NOT NULL,
  marketplace_category_name TEXT NOT NULL,
  xegai_category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_category_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage marketplace category mappings" 
ON public.marketplace_category_mappings 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can read marketplace category mappings" 
ON public.marketplace_category_mappings 
FOR SELECT 
USING (true);

-- Create marketplace sync logs table
CREATE TABLE public.marketplace_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  products_processed INTEGER DEFAULT 0,
  products_imported INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors TEXT[],
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running'
);

-- Enable RLS for sync logs
ALTER TABLE public.marketplace_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for sync logs
CREATE POLICY "Admins can manage marketplace sync logs" 
ON public.marketplace_sync_logs 
FOR ALL 
USING (is_admin());

-- Create trigger for updating updated_at column on marketplace_category_mappings
CREATE TRIGGER update_marketplace_category_mappings_updated_at
BEFORE UPDATE ON public.marketplace_category_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_marketplace_category_mappings_marketplace ON public.marketplace_category_mappings(marketplace_name, marketplace_category_id);
CREATE INDEX idx_marketplace_sync_logs_marketplace ON public.marketplace_sync_logs(marketplace_name, started_at);
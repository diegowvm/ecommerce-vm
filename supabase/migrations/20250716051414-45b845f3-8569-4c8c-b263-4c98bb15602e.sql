-- Add marketplace-related fields to orders table
ALTER TABLE public.orders ADD COLUMN marketplace_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN marketplace_status TEXT;
ALTER TABLE public.orders ADD COLUMN tracking_code TEXT;

-- Add marketplace_name field to products table
ALTER TABLE public.products ADD COLUMN marketplace_name TEXT;

-- Add return-related fields to orders table
ALTER TABLE public.orders ADD COLUMN return_status TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN return_reason TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN return_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for marketplace orders
CREATE INDEX idx_orders_marketplace_order_id ON public.orders(marketplace_order_id) WHERE marketplace_order_id IS NOT NULL;
CREATE INDEX idx_orders_status_tracking ON public.orders(status, marketplace_status) WHERE marketplace_status IS NOT NULL;

-- Create order_returns table for detailed return management
CREATE TABLE public.order_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  marketplace_return_id TEXT,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for order_returns
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

-- Create policies for order_returns
CREATE POLICY "Admins can manage order returns" 
ON public.order_returns 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own order returns" 
ON public.order_returns 
FOR SELECT 
USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- Create trigger for updating updated_at column on order_returns
CREATE TRIGGER update_order_returns_updated_at
BEFORE UPDATE ON public.order_returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for order returns
CREATE INDEX idx_order_returns_order_id ON public.order_returns(order_id);
CREATE INDEX idx_order_returns_status ON public.order_returns(status);
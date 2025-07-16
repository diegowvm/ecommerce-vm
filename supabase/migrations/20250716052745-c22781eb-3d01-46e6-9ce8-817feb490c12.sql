-- Create API metrics table for detailed performance monitoring
CREATE TABLE public.api_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_name TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  endpoint TEXT,
  response_time_ms INTEGER,
  status_code INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for api_metrics
CREATE POLICY "Admins can manage API metrics" 
ON public.api_metrics 
FOR ALL 
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_api_metrics_marketplace_created ON public.api_metrics(marketplace_name, created_at DESC);
CREATE INDEX idx_api_metrics_operation_created ON public.api_metrics(operation_type, created_at DESC);
CREATE INDEX idx_api_metrics_success_created ON public.api_metrics(success, created_at DESC);

-- Create API alerts table
CREATE TABLE public.api_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  marketplace_name TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for api_alerts
CREATE POLICY "Admins can manage API alerts" 
ON public.api_alerts 
FOR ALL 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_api_alerts_updated_at
BEFORE UPDATE ON public.api_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for alerts
CREATE INDEX idx_api_alerts_active_created ON public.api_alerts(is_active, created_at DESC);
CREATE INDEX idx_api_alerts_marketplace_active ON public.api_alerts(marketplace_name, is_active);
-- FASE 1: INFRAESTRUTURA DE DADOS PARA DROPSHIPPING REAL

-- Tabela para armazenar conexões reais de APIs
CREATE TABLE public.api_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  marketplace_name TEXT NOT NULL,
  connection_name TEXT NOT NULL,
  api_key_reference TEXT, -- Referência ao Supabase Secrets
  oauth_access_token TEXT, -- Para OAuth flows
  oauth_refresh_token TEXT,
  oauth_expires_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'disconnected',
  last_test_at TIMESTAMP WITH TIME ZONE,
  rate_limit_remaining INTEGER DEFAULT 0,
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para produtos importados dos marketplaces
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_connection_id UUID NOT NULL REFERENCES public.api_connections(id) ON DELETE CASCADE,
  marketplace_product_id TEXT NOT NULL,
  marketplace_name TEXT NOT NULL,
  local_product_id UUID REFERENCES public.products(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  available_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,
  condition TEXT,
  brand TEXT,
  model TEXT,
  sku TEXT,
  gtin TEXT,
  categories TEXT[],
  images TEXT[],
  attributes JSONB DEFAULT '{}',
  shipping_info JSONB DEFAULT '{}',
  seller_info JSONB DEFAULT '{}',
  marketplace_url TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'pending',
  sync_errors TEXT[],
  profit_margin DECIMAL(5,2) DEFAULT 20.00,
  markup_type TEXT DEFAULT 'percentage',
  markup_value DECIMAL(10,2) DEFAULT 1.20,
  auto_sync_enabled BOOLEAN DEFAULT true,
  is_imported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(api_connection_id, marketplace_product_id)
);

-- Tabela para agendamento de sincronizações
CREATE TABLE public.sync_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_connection_id UUID NOT NULL REFERENCES public.api_connections(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL, -- 'products', 'prices', 'inventory', 'orders'
  cron_expression TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de sincronizações detalhado
CREATE TABLE public.sync_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_schedule_id UUID REFERENCES public.sync_schedules(id) ON DELETE CASCADE,
  api_connection_id UUID NOT NULL REFERENCES public.api_connections(id) ON DELETE CASCADE,
  execution_type TEXT NOT NULL,
  status TEXT DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  products_found INTEGER DEFAULT 0,
  products_processed INTEGER DEFAULT 0,
  products_imported INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  errors TEXT[],
  summary JSONB DEFAULT '{}',
  execution_log TEXT
);

-- Tabela para mapeamento de categorias avançado
CREATE TABLE public.advanced_category_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_connection_id UUID NOT NULL REFERENCES public.api_connections(id) ON DELETE CASCADE,
  marketplace_category_path TEXT NOT NULL,
  local_category_id UUID REFERENCES public.categories(id),
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  auto_mapped BOOLEAN DEFAULT false,
  mapping_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(api_connection_id, marketplace_category_path)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_category_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para api_connections
CREATE POLICY "Admins can manage API connections" 
ON public.api_connections 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can manage their own API connections" 
ON public.api_connections 
FOR ALL 
USING (auth.uid() = user_id);

-- Políticas RLS para marketplace_products
CREATE POLICY "Admins can manage marketplace products" 
ON public.marketplace_products 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can manage products from their connections" 
ON public.marketplace_products 
FOR ALL 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
));

-- Políticas RLS para sync_schedules
CREATE POLICY "Admins can manage sync schedules" 
ON public.sync_schedules 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can manage schedules for their connections" 
ON public.sync_schedules 
FOR ALL 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
));

-- Políticas RLS para sync_executions
CREATE POLICY "Admins can view all sync executions" 
ON public.sync_executions 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view executions from their connections" 
ON public.sync_executions 
FOR SELECT 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
));

-- Políticas RLS para advanced_category_mappings
CREATE POLICY "Admins can manage category mappings" 
ON public.advanced_category_mappings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can manage mappings for their connections" 
ON public.advanced_category_mappings 
FOR ALL 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
));

-- Triggers para updated_at
CREATE TRIGGER update_api_connections_updated_at
BEFORE UPDATE ON public.api_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_schedules_updated_at
BEFORE UPDATE ON public.sync_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advanced_category_mappings_updated_at
BEFORE UPDATE ON public.advanced_category_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_api_connections_user_marketplace ON public.api_connections(user_id, marketplace_name);
CREATE INDEX idx_api_connections_status ON public.api_connections(connection_status, is_active);

CREATE INDEX idx_marketplace_products_connection ON public.marketplace_products(api_connection_id);
CREATE INDEX idx_marketplace_products_marketplace_id ON public.marketplace_products(marketplace_name, marketplace_product_id);
CREATE INDEX idx_marketplace_products_sync ON public.marketplace_products(last_sync_at, sync_status);
CREATE INDEX idx_marketplace_products_imported ON public.marketplace_products(is_imported, auto_sync_enabled);

CREATE INDEX idx_sync_schedules_connection ON public.sync_schedules(api_connection_id, is_active);
CREATE INDEX idx_sync_schedules_next_run ON public.sync_schedules(next_run_at, is_active);

CREATE INDEX idx_sync_executions_connection ON public.sync_executions(api_connection_id, started_at);
CREATE INDEX idx_sync_executions_schedule ON public.sync_executions(sync_schedule_id, started_at);
CREATE INDEX idx_sync_executions_status ON public.sync_executions(status, started_at);

CREATE INDEX idx_category_mappings_connection ON public.advanced_category_mappings(api_connection_id);
CREATE INDEX idx_category_mappings_path ON public.advanced_category_mappings(marketplace_category_path);
-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA

-- Criar função otimizada is_admin_cached para evitar recursão
CREATE OR REPLACE FUNCTION public.is_admin_cached(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin_cached.user_id 
    AND role = 'admin'::app_role
  );
$function$;

-- Atualizar função is_admin para usar cache
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_admin_cached(is_admin.user_id);
$function$;

-- FASE 2: OTIMIZAÇÕES DE PERFORMANCE DO BANCO

-- Criar índices compostos estratégicos para melhor performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id_status ON public.profiles(user_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_featured ON public.products(active, featured) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active ON public.products(category_id, active) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_status ON public.orders(created_at DESC, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_products_connection_sync ON public.marketplace_products(api_connection_id, sync_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_products_imported_active ON public.marketplace_products(is_imported, auto_sync_enabled) WHERE is_imported = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_executions_connection_status ON public.sync_executions(api_connection_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_executions_started_status ON public.sync_executions(started_at DESC, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_logs_user_created ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_status ON public.notifications(user_id, status) WHERE status = 'unread';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_metrics_marketplace_created ON public.api_metrics(marketplace_name, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_updated ON public.cart_items(user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlist_user_created ON public.wishlist(user_id, created_at DESC);

-- Otimizar função fetch_categories_with_subcategories
CREATE OR REPLACE FUNCTION public.fetch_categories_with_subcategories()
RETURNS TABLE(id uuid, name text, slug text, description text, image_url text, "order" integer, created_at timestamp with time zone, updated_at timestamp with time zone, subcategories jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use CTE para melhor performance
  RETURN QUERY
  WITH category_data AS (
    SELECT 
      c.id, c.name, c.slug, c.description, c.image_url, 
      c."order", c.created_at, c.updated_at
    FROM public.categories c
    ORDER BY c."order", c.name
  ),
  subcategory_data AS (
    SELECT 
      s.category_id,
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'slug', s.slug,
          'description', s.description,
          'image_url', s.image_url,
          'order', s."order",
          'created_at', s.created_at,
          'updated_at', s.updated_at
        ) ORDER BY s."order", s.name
      ) as subcategories_json
    FROM public.subcategories s
    GROUP BY s.category_id
  )
  SELECT 
    cd.id,
    cd.name,
    cd.slug,
    cd.description,
    cd.image_url,
    cd."order",
    cd.created_at,
    cd.updated_at,
    COALESCE(sd.subcategories_json, '[]'::jsonb) as subcategories
  FROM category_data cd
  LEFT JOIN subcategory_data sd ON cd.id = sd.category_id
  ORDER BY cd."order", cd.name;
END;
$function$;

-- Função de limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpar logs de atividade antigos (mais de 6 meses)
  DELETE FROM public.user_activity_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
  
  -- Limpar execuções de sync antigas (mais de 3 meses)
  DELETE FROM public.sync_executions 
  WHERE started_at < CURRENT_DATE - INTERVAL '3 months'
  AND status IN ('completed', 'failed');
  
  -- Limpar logs de sync antigos (mais de 3 meses)
  DELETE FROM public.marketplace_sync_logs 
  WHERE started_at < CURRENT_DATE - INTERVAL '3 months'
  AND status IN ('completed', 'failed');
  
  -- Limpar alertas resolvidos antigos (mais de 1 mês)
  DELETE FROM public.api_alerts 
  WHERE resolved_at IS NOT NULL 
  AND resolved_at < CURRENT_DATE - INTERVAL '1 month';
  
  -- Limpar métricas antigas (mais de 3 meses)
  DELETE FROM public.api_metrics 
  WHERE created_at < CURRENT_DATE - INTERVAL '3 months';
END;
$function$;

-- FASE 4: MONITORAMENTO E ALERTAS

-- Criar tabela para métricas de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_type text NOT NULL DEFAULT 'gauge',
  tags jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para alertas de sistema
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Admins can manage performance metrics" ON public.performance_metrics FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage system alerts" ON public.system_alerts FOR ALL USING (is_admin());

-- Criar índices para monitoramento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_name_created ON public.performance_metrics(metric_name, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_alerts_type_severity ON public.system_alerts(alert_type, severity) WHERE NOT is_resolved;

-- FASE 5: MANUTENÇÃO AUTOMATIZADA

-- Função para otimização automática de tabelas
CREATE OR REPLACE FUNCTION public.auto_optimize_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  table_record record;
BEGIN
  -- Executar ANALYZE em todas as tabelas principais
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ANALYZE public.%I', table_record.table_name);
  END LOOP;
  
  -- Log da otimização
  INSERT INTO public.performance_metrics (metric_name, metric_value, metric_type, tags)
  VALUES ('auto_optimize_completed', 1, 'counter', jsonb_build_object('timestamp', now()));
END;
$function$;

-- Função para monitoramento de saúde do sistema
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{}';
  table_stats record;
  total_size bigint := 0;
  slow_queries integer := 0;
BEGIN
  -- Verificar tamanho das tabelas
  SELECT 
    pg_size_pretty(pg_total_relation_size('public.user_activity_logs')) as activity_logs_size,
    pg_size_pretty(pg_total_relation_size('public.api_metrics')) as api_metrics_size,
    pg_size_pretty(pg_total_relation_size('public.marketplace_sync_logs')) as sync_logs_size
  INTO table_stats;
  
  -- Calcular estatísticas gerais
  SELECT COUNT(*) INTO slow_queries
  FROM public.api_metrics 
  WHERE response_time_ms > 5000 
  AND created_at > now() - interval '1 hour';
  
  -- Construir resultado
  result := jsonb_build_object(
    'timestamp', now(),
    'table_sizes', row_to_json(table_stats),
    'slow_queries_last_hour', slow_queries,
    'status', CASE 
      WHEN slow_queries > 100 THEN 'critical'
      WHEN slow_queries > 50 THEN 'warning'
      ELSE 'healthy'
    END
  );
  
  RETURN result;
END;
$function$;

-- Executar limpeza inicial e otimização
SELECT public.cleanup_old_logs();
SELECT public.auto_optimize_tables();
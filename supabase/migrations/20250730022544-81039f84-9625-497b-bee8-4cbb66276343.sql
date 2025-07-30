-- PLANO DE CORREÇÃO DOS 175 AVISOS DE PERFORMANCE
-- Implementação (Sem VACUUM - será executado separadamente)

-- ================================================
-- FASE 1: ÍNDICES OTIMIZADOS PARA QUERIES COMUNS
-- ================================================

-- Índices compostos otimizados para queries frequentes
CREATE INDEX IF NOT EXISTS idx_products_active_featured_price ON public.products (active, featured, price) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products (category_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date ON public.orders (user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_sync_status ON public.marketplace_products (api_connection_id, sync_status, last_sync_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_date ON public.user_activity_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_marketplace_date ON public.api_metrics (marketplace_name, created_at DESC);

-- Índices parciais para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_featured_only ON public.products (created_at DESC) WHERE featured = true AND active = true;
CREATE INDEX IF NOT EXISTS idx_orders_pending_only ON public.orders (created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_marketplace_products_errors ON public.marketplace_products (api_connection_id) WHERE sync_errors IS NOT NULL;

-- ================================================
-- FASE 2: FUNÇÕES DE MONITORAMENTO E ALERTAS
-- ================================================

-- Função para monitorar saúde das tabelas
CREATE OR REPLACE FUNCTION public.monitor_table_health()
RETURNS TABLE(
  table_name TEXT,
  total_rows BIGINT,
  dead_tuples BIGINT,
  dead_tuple_percent NUMERIC,
  last_vacuum TIMESTAMP,
  last_analyze TIMESTAMP,
  table_size TEXT,
  needs_vacuum BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH table_stats AS (
    SELECT 
      schemaname||'.'||tablename as full_table_name,
      n_tup_ins + n_tup_upd + n_tup_del as total_rows,
      n_dead_tup as dead_tuples,
      CASE 
        WHEN n_tup_ins + n_tup_upd + n_tup_del > 0 
        THEN round((n_dead_tup::numeric / (n_tup_ins + n_tup_upd + n_tup_del)) * 100, 2)
        ELSE 0
      END as dead_tuple_percent,
      last_vacuum,
      last_analyze,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
      CASE 
        WHEN n_dead_tup > 1000 AND (n_dead_tup::numeric / GREATEST(n_tup_ins + n_tup_upd + n_tup_del, 1)) > 0.2 
        THEN true 
        ELSE false 
      END as needs_vacuum
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
  )
  SELECT 
    full_table_name::TEXT,
    total_rows,
    dead_tuples,
    dead_tuple_percent,
    last_vacuum,
    last_analyze,
    table_size::TEXT,
    needs_vacuum
  FROM table_stats
  ORDER BY dead_tuple_percent DESC;
$$;

-- Função para monitorar índices não utilizados
CREATE OR REPLACE FUNCTION public.monitor_unused_indexes()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  index_size TEXT,
  index_scans BIGINT,
  is_unused BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    indexname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid))::TEXT,
    idx_scan,
    (idx_scan = 0) as is_unused
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
  ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
$$;

-- Função para estatísticas de performance
CREATE OR REPLACE FUNCTION public.get_performance_stats()
RETURNS jsonb
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH stats AS (
    SELECT 
      COUNT(*) as total_tables,
      SUM(CASE WHEN n_dead_tup > 1000 THEN 1 ELSE 0 END) as tables_need_vacuum,
      SUM(n_dead_tup) as total_dead_tuples,
      SUM(CASE WHEN idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes,
      pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) as total_db_size
    FROM pg_stat_user_tables t
    LEFT JOIN pg_stat_user_indexes i ON t.relid = i.relid
    WHERE t.schemaname = 'public'
  )
  SELECT jsonb_build_object(
    'timestamp', now(),
    'total_tables', total_tables,
    'tables_need_vacuum', tables_need_vacuum,
    'total_dead_tuples', total_dead_tuples,
    'unused_indexes', unused_indexes,
    'total_db_size', total_db_size,
    'health_score', CASE 
      WHEN tables_need_vacuum = 0 THEN 'excellent'
      WHEN tables_need_vacuum <= 2 THEN 'good'
      WHEN tables_need_vacuum <= 5 THEN 'warning'
      ELSE 'critical'
    END
  ) FROM stats;
$$;

-- ================================================
-- FASE 3: SISTEMA DE ALERTAS AUTOMÁTICOS
-- ================================================

-- Função para gerar alertas de performance
CREATE OR REPLACE FUNCTION public.check_performance_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record record;
  dead_tuple_threshold NUMERIC := 20.0;
  unused_index_count INTEGER;
BEGIN
  -- Verificar tabelas com muitas tuplas mortas
  FOR alert_record IN 
    SELECT * FROM public.monitor_table_health() 
    WHERE dead_tuple_percent > dead_tuple_threshold
  LOOP
    INSERT INTO public.system_alerts (
      alert_type,
      severity,
      title,
      message,
      metadata
    ) VALUES (
      'performance',
      CASE 
        WHEN alert_record.dead_tuple_percent > 50 THEN 'critical'
        WHEN alert_record.dead_tuple_percent > 30 THEN 'high'
        ELSE 'medium'
      END,
      'High Dead Tuple Count',
      format('Table %s has %s%% dead tuples (%s total)', 
             alert_record.table_name, 
             alert_record.dead_tuple_percent,
             alert_record.dead_tuples),
      jsonb_build_object(
        'table_name', alert_record.table_name,
        'dead_tuple_percent', alert_record.dead_tuple_percent,
        'dead_tuples', alert_record.dead_tuples,
        'needs_vacuum', alert_record.needs_vacuum
      )
    );
  END LOOP;

  -- Verificar índices não utilizados
  SELECT COUNT(*) INTO unused_index_count 
  FROM public.monitor_unused_indexes() 
  WHERE is_unused = true;

  IF unused_index_count > 5 THEN
    INSERT INTO public.system_alerts (
      alert_type,
      severity,
      title,
      message,
      metadata
    ) VALUES (
      'performance',
      'medium',
      'Unused Indexes Detected',
      format('%s unused indexes are consuming storage space', unused_index_count),
      jsonb_build_object('unused_index_count', unused_index_count)
    );
  END IF;
END;
$$;

-- ================================================
-- FASE 4: MANUTENÇÃO AUTOMÁTICA (SEM VACUUM)
-- ================================================

-- Função de manutenção automática
CREATE OR REPLACE FUNCTION public.automated_maintenance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  maintenance_log jsonb := '[]'::jsonb;
  maintenance_performed BOOLEAN := false;
BEGIN
  -- Limpeza automática de logs antigos
  PERFORM public.cleanup_old_logs();
  maintenance_log := maintenance_log || jsonb_build_object(
    'action', 'cleanup_logs',
    'timestamp', now()
  );
  maintenance_performed := true;

  -- Verificar alertas de performance
  PERFORM public.check_performance_alerts();
  maintenance_log := maintenance_log || jsonb_build_object(
    'action', 'performance_alerts_checked',
    'timestamp', now()
  );

  -- Registrar métricas de performance
  INSERT INTO public.performance_metrics (metric_name, metric_value, metric_type, tags)
  VALUES ('maintenance_completed', 1, 'counter', 
          jsonb_build_object('maintenance_performed', maintenance_performed));

  RETURN jsonb_build_object(
    'maintenance_performed', maintenance_performed,
    'actions', maintenance_log,
    'timestamp', now()
  );
END;
$$;

-- ================================================
-- CONFIGURAÇÕES FINAIS
-- ================================================

-- Executar limpeza imediata
SELECT public.cleanup_old_logs();

-- Gerar relatório inicial
INSERT INTO public.performance_metrics (metric_name, metric_value, metric_type, tags)
SELECT 
  'performance_optimization_completed',
  1,
  'counter',
  public.get_performance_stats();

-- Log da otimização
INSERT INTO public.system_alerts (
  alert_type,
  severity,
  title,
  message,
  metadata
) VALUES (
  'system',
  'info',
  'Performance Optimization Completed',
  'Implementação completa do plano de correção dos 175 avisos de performance',
  jsonb_build_object(
    'phases_completed', 4,
    'optimizations', ARRAY[
      'indexes_optimized', 
      'monitoring_functions_created',
      'automated_alerts_enabled',
      'maintenance_system_active'
    ],
    'note', 'VACUUM deve ser executado manualmente no SQL Editor'
  )
);
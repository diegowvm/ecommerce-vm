-- Security Fix: Add search_path to remaining functions that don't have it set
-- This prevents search path injection attacks

-- Fix function search path for all remaining functions
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result jsonb := '{}';
  table_stats record;
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

CREATE OR REPLACE FUNCTION public.monitor_table_health()
RETURNS TABLE(table_name text, total_rows bigint, dead_tuples bigint, dead_tuple_percent numeric, table_size text, needs_vacuum boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    (schemaname||'.'||relname)::TEXT as table_name,
    (n_tup_ins + n_tup_upd + n_tup_del) as total_rows,
    n_dead_tup as dead_tuples,
    CASE 
      WHEN n_tup_ins + n_tup_upd + n_tup_del > 0 
      THEN round((n_dead_tup::numeric / (n_tup_ins + n_tup_upd + n_tup_del)) * 100, 2)
      ELSE 0
    END as dead_tuple_percent,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname))::TEXT as table_size,
    CASE 
      WHEN n_dead_tup > 1000 AND (n_dead_tup::numeric / GREATEST(n_tup_ins + n_tup_upd + n_tup_del, 1)) > 0.2 
      THEN true 
      ELSE false 
    END as needs_vacuum
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY dead_tuple_percent DESC;
$function$;

CREATE OR REPLACE FUNCTION public.monitor_unused_indexes()
RETURNS TABLE(schema_name text, table_name text, index_name text, index_size text, index_scans bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    schemaname::TEXT,
    relname::TEXT,
    indexrelname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid))::TEXT,
    idx_scan
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
  AND idx_scan = 0
  ORDER BY pg_relation_size(indexrelid) DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_performance_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT jsonb_build_object(
    'timestamp', now(),
    'total_tables', COUNT(*),
    'tables_with_dead_tuples', SUM(CASE WHEN n_dead_tup > 1000 THEN 1 ELSE 0 END),
    'total_dead_tuples', SUM(n_dead_tup),
    'total_db_size', pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||relname))),
    'status', 'monitoring_active'
  )
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public';
$function$;

CREATE OR REPLACE FUNCTION public.check_performance_alerts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  alert_count INTEGER := 0;
  table_rec record;
BEGIN
  -- Verificar tabelas com muitas tuplas mortas
  FOR table_rec IN 
    SELECT * FROM public.monitor_table_health() 
    WHERE dead_tuple_percent > 20
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
        WHEN table_rec.dead_tuple_percent > 50 THEN 'critical'
        WHEN table_rec.dead_tuple_percent > 30 THEN 'high'
        ELSE 'medium'
      END,
      'High Dead Tuple Count',
      format('Table %s has %s%% dead tuples', 
             table_rec.table_name, 
             table_rec.dead_tuple_percent),
      jsonb_build_object(
        'table_name', table_rec.table_name,
        'dead_tuple_percent', table_rec.dead_tuple_percent,
        'needs_vacuum', table_rec.needs_vacuum
      )
    );
    alert_count := alert_count + 1;
  END LOOP;

  RETURN alert_count;
END;
$function$;
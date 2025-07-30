-- Performance Optimization Migration (Corrigido)
-- FASE 1: Criação de Índices Críticos (sem predicados problemáticos)

-- Índices para queries de admin dashboard
CREATE INDEX IF NOT EXISTS idx_orders_user_status_date 
ON public.orders (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_date 
ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_status_login 
ON public.profiles (status, last_login DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_status 
ON public.profiles (created_at DESC, status);

-- Índices para produtos e marketplace
CREATE INDEX IF NOT EXISTS idx_products_active_featured 
ON public.products (active, featured, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON public.products (category_id, active, price);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_sync 
ON public.marketplace_products (api_connection_id, sync_status, last_sync_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_import 
ON public.marketplace_products (is_imported, marketplace_name, created_at DESC);

-- Índices para wishlist e carrinho
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product 
ON public.wishlist (user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user 
ON public.cart_items (user_id, updated_at DESC);

-- Índices para logs e execuções
CREATE INDEX IF NOT EXISTS idx_sync_executions_connection_date 
ON public.sync_executions (api_connection_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_date 
ON public.user_activity_logs (user_id, created_at DESC);

-- FASE 2: Otimização da função fetch_categories_with_subcategories

CREATE OR REPLACE FUNCTION public.fetch_categories_with_subcategories()
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  description text,
  image_url text,
  "order" integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  subcategories jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- FASE 3: Criar função otimizada para is_admin com cache

CREATE OR REPLACE FUNCTION public.is_admin_cached(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin_cached.user_id 
    AND role = 'admin'::app_role
  );
$$;

-- Atualizar função is_admin para usar a versão cached
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_admin_cached(is_admin.user_id);
$$;

-- FASE 4: Criar função para limpeza automática de logs antigos

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;
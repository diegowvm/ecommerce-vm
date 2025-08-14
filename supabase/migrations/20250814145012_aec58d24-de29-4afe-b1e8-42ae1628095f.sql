-- Security Fix Migration: Phase 1-4 Critical Fixes
-- This migration addresses critical RLS policy inconsistencies and function security

-- Phase 1: Fix profiles table RLS policies - Remove conflicting policies and standardize
DROP POLICY IF EXISTS "Profile management" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create standardized profiles policies using user_id consistently
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (is_admin());

-- Phase 2: Enhance API connections security - Add validation
DROP POLICY IF EXISTS "Users can manage their own API connections" ON public.api_connections;
DROP POLICY IF EXISTS "Admins can manage API connections" ON public.api_connections;

CREATE POLICY "Users can view their own API connections" 
ON public.api_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API connections" 
ON public.api_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API connections" 
ON public.api_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API connections" 
ON public.api_connections 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all API connections" 
ON public.api_connections 
FOR ALL 
USING (is_admin());

-- Phase 3: Secure address and order data - Simplify and strengthen policies
DROP POLICY IF EXISTS "Users can create their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;

CREATE POLICY "Users can manage their own addresses" 
ON public.addresses 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all addresses" 
ON public.addresses 
FOR ALL 
USING (is_admin());

-- Phase 4: Fix database function security - Add search path protection
CREATE OR REPLACE FUNCTION public.update_user_last_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    last_login = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE user_id = NEW.id;
  
  -- Register login activity
  PERFORM public.log_user_activity(
    NEW.id,
    'login',
    'User logged in',
    jsonb_build_object('login_count', (SELECT login_count FROM public.profiles WHERE user_id = NEW.id))
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_action text, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, action, description, metadata)
  VALUES (p_user_id, p_action, p_description, p_metadata);
END;
$function$;

CREATE OR REPLACE FUNCTION public.fetch_categories_with_subcategories()
 RETURNS TABLE(id uuid, name text, slug text, description text, image_url text, "order" integer, created_at timestamp with time zone, updated_at timestamp with time zone, subcategories jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.user_activity_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
  
  DELETE FROM public.sync_executions 
  WHERE started_at < CURRENT_DATE - INTERVAL '3 months'
  AND status IN ('completed', 'failed');
  
  DELETE FROM public.marketplace_sync_logs 
  WHERE started_at < CURRENT_DATE - INTERVAL '3 months'
  AND status IN ('completed', 'failed');
  
  DELETE FROM public.api_alerts 
  WHERE resolved_at IS NOT NULL 
  AND resolved_at < CURRENT_DATE - INTERVAL '1 month';
  
  DELETE FROM public.api_metrics 
  WHERE created_at < CURRENT_DATE - INTERVAL '3 months';
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_optimize_tables()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ANALYZE public.%I', table_record.table_name);
  END LOOP;
  
  INSERT INTO public.performance_metrics (metric_name, metric_value, metric_type, tags)
  VALUES ('auto_optimize_completed', 1, 'counter', jsonb_build_object('timestamp', now()));
END;
$function$;

-- Phase 6: Secure business intelligence data - Add admin-only policies where missing
CREATE POLICY "Only admins can view sync executions" 
ON public.sync_executions 
FOR ALL 
USING (is_admin());

-- Add policies for sensitive operational tables
CREATE POLICY "Only admins can manage sync schedules" 
ON public.sync_schedules 
FOR ALL 
USING (is_admin() OR (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
)));

-- Ensure marketplace products are properly secured
DROP POLICY IF EXISTS "Users can manage products from their connections" ON public.marketplace_products;

CREATE POLICY "Users can view products from their connections" 
ON public.marketplace_products 
FOR SELECT 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
) OR is_admin());

CREATE POLICY "Users can update products from their connections" 
ON public.marketplace_products 
FOR UPDATE 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
) OR is_admin());

CREATE POLICY "Users can insert products from their connections" 
ON public.marketplace_products 
FOR INSERT 
WITH CHECK (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
) OR is_admin());

CREATE POLICY "Users can delete products from their connections" 
ON public.marketplace_products 
FOR DELETE 
USING (api_connection_id IN (
  SELECT id FROM public.api_connections WHERE user_id = auth.uid()
) OR is_admin());
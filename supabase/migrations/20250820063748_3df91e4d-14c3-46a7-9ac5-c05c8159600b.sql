-- CRITICAL SECURITY FIX: Add missing RLS policies for unprotected tables

-- 1. API Metrics - Admin only access
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view api metrics"
  ON public.api_metrics FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can insert api metrics"
  ON public.api_metrics FOR INSERT
  WITH CHECK (public.is_admin());

-- 2. API Alerts - Admin only access  
ALTER TABLE public.api_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage api alerts"
  ON public.api_alerts FOR ALL
  USING (public.is_admin());

-- 3. Order Returns - Users can view their own, admins can manage all
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order returns"
  ON public.order_returns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_returns.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own order returns"
  ON public.order_returns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_returns.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all order returns"
  ON public.order_returns FOR ALL
  USING (public.is_admin());

-- 4. Performance Metrics - Admin only access
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage performance metrics"
  ON public.performance_metrics FOR ALL
  USING (public.is_admin());

-- 5. User Activity Logs - Users can view their own, admins can view all
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System can insert activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (true);

-- 6. System Alerts - Admin only access
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage system alerts"
  ON public.system_alerts FOR ALL
  USING (public.is_admin());

-- 7. User Tag Assignments - Admin only access
ALTER TABLE public.user_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage user tag assignments"
  ON public.user_tag_assignments FOR ALL
  USING (public.is_admin());

-- 8. Marketplace Sync Logs - Admin only access
ALTER TABLE public.marketplace_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage marketplace sync logs"
  ON public.marketplace_sync_logs FOR ALL
  USING (public.is_admin());

-- 9. Marketplace Products - Users can view their own connections' products
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products from their connections"
  ON public.marketplace_products FOR SELECT
  USING (api_connection_id IN (
    SELECT id FROM public.api_connections 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage products from their connections"
  ON public.marketplace_products FOR ALL
  USING (api_connection_id IN (
    SELECT id FROM public.api_connections 
    WHERE user_id = auth.uid()
  ));

-- 10. User Preferences - Users can manage their own
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (user_id = auth.uid());

-- 11. Notifications - Users can view their own
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- 12. Admin Communications - Admin only access
ALTER TABLE public.admin_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage communications"
  ON public.admin_communications FOR ALL
  USING (public.is_admin());

-- Fix database function security issues by updating search_path
CREATE OR REPLACE FUNCTION public.is_admin_cached(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin_cached.user_id 
    AND role = 'admin'
  );
$function$;
-- Fix remaining database function security issues by updating search_path
-- This addresses the security warnings from the linter

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
  WHERE id = NEW.id;
  
  -- Register login activity
  PERFORM public.log_user_activity(
    NEW.id,
    'login',
    'User logged in',
    jsonb_build_object('login_count', (SELECT login_count FROM public.profiles WHERE id = NEW.id))
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

CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  old_role text;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT public.is_admin(current_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Prevent self-demotion from admin
  IF current_user_id = target_user_id AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove admin role from yourself';
  END IF;
  
  -- Get old role for logging
  SELECT role INTO old_role FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Update the role
  UPDATE public.user_roles 
  SET role = new_role 
  WHERE user_id = target_user_id;
  
  -- Log the role change
  PERFORM public.log_user_activity(
    target_user_id,
    'role_changed',
    format('Role changed from %s to %s by admin %s', old_role, new_role, current_user_id),
    jsonb_build_object(
      'old_role', old_role,
      'new_role', new_role,
      'changed_by', current_user_id,
      'timestamp', now()
    )
  );
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = is_admin.user_id 
        AND user_roles.role = 'admin'
    );
END;
$function$;
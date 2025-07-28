-- Fix remaining security issues

-- Update functions that are missing search_path settings
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[áàâãäå]', 'a', 'gi'),
        '[éèêë]', 'e', 'gi'
      ),
      '[íìîï]', 'i', 'gi'
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE(total_users bigint, active_users bigint, suspended_users bigint, banned_users bigint, new_users_30d bigint, active_users_7d bigint, avg_login_count numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_statistics;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fetch_categories_with_subcategories()
RETURNS TABLE(id uuid, name text, slug text, description text, image_url text, "order" integer, created_at timestamp with time zone, updated_at timestamp with time zone, subcategories jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c."order",
    c.created_at,
    c.updated_at,
    COALESCE(
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
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) as subcategories
  FROM public.categories c
  LEFT JOIN public.subcategories s ON c.id = s.category_id
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c."order", c.created_at, c.updated_at
  ORDER BY c."order", c.name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
-- Fix subcategories table to use "order" instead of "sort_order"
-- Update existing columns to match the expected structure

-- First, check if "order" column exists in categories and subcategories
-- Add the "order" column to categories table if it doesn't exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- Add the "order" column to subcategories table if it doesn't exist  
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- Update the "order" column values based on existing sort_order
UPDATE public.categories SET "order" = COALESCE(sort_order, 0);
UPDATE public.subcategories SET "order" = COALESCE("order", 0);

-- Create updated function to fetch categories with proper column name
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
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH category_data AS (
    SELECT 
      c.id, c.name, c.slug, c.description, c.image_url, 
      c."order", c.created_at, c.updated_at
    FROM public.categories c
    WHERE c.is_active = true
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
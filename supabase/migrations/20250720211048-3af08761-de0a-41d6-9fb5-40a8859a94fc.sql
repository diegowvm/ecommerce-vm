
-- FASE 1: CONFIGURAÇÃO DO BANCO DE DADOS

-- 1.1 Primeiro, vamos adicionar os campos faltantes na tabela categories existente
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 1.2 Criar função para gerar slug automaticamente
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- 1.3 Criar tabela subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(category_id, name),
  UNIQUE(category_id, slug)
);

-- 1.4 Habilitar RLS na tabela subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 1.5 Criar políticas RLS para subcategories
CREATE POLICY "Subcategories are viewable by everyone" 
ON public.subcategories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage subcategories" 
ON public.subcategories 
FOR ALL 
USING (is_admin());

-- 1.6 Criar trigger para atualizar updated_at em subcategories
CREATE TRIGGER update_subcategories_updated_at 
BEFORE UPDATE ON public.subcategories 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.7 Criar trigger para atualizar updated_at em categories (se não existir)
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON public.categories 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.8 Função para buscar categorias com subcategorias
CREATE OR REPLACE FUNCTION public.fetch_categories_with_subcategories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  "order" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  subcategories JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

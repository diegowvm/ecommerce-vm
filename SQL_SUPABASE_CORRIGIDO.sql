-- =====================================================
-- XEGAI SHOP - CONFIGURAÇÃO COMPLETA DO SUPABASE (VERSÃO CORRIGIDA)
-- =====================================================

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. VERIFICAR E CRIAR/ALTERAR TABELAS
-- =====================================================

-- Tabela de perfis de usuário (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e criar/alterar tabela de categorias
DO $$
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        CREATE TABLE public.categories (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar e criar/alterar tabela de produtos
DO $$
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        CREATE TABLE public.products (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            original_price DECIMAL(10,2),
            images TEXT[] DEFAULT '{}',
            category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
            brand TEXT,
            sizes TEXT[] DEFAULT '{}',
            colors TEXT[] DEFAULT '{}',
            stock INTEGER DEFAULT 0,
            featured BOOLEAN DEFAULT false,
            active BOOLEAN DEFAULT true,
            rating DECIMAL(3,2) DEFAULT 0,
            reviews_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Renomear colunas antigas se existirem
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE public.products RENAME COLUMN is_featured TO featured;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE public.products RENAME COLUMN is_active TO active;
    END IF;

    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'featured') THEN
        ALTER TABLE public.products ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'active') THEN
        ALTER TABLE public.products ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'brand') THEN
        ALTER TABLE public.products ADD COLUMN brand TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE public.products ADD COLUMN sizes TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'colors') THEN
        ALTER TABLE public.products ADD COLUMN colors TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE public.products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'reviews_count') THEN
        ALTER TABLE public.products ADD COLUMN reviews_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint única se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'cart_items' AND constraint_name = 'cart_items_user_id_product_id_size_color_key') THEN
        ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_product_id_size_color_key UNIQUE(user_id, product_id, size, color);
    END IF;
END $$;

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    tracking_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraints de check se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.check_constraints WHERE constraint_schema = 'public' AND constraint_name = 'orders_status_check') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.check_constraints WHERE constraint_schema = 'public' AND constraint_name = 'orders_payment_status_check') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
    END IF;
END $$;

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size TEXT,
    color TEXT
);

-- Tabela de papéis de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraints se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.check_constraints WHERE constraint_schema = 'public' AND constraint_name = 'user_roles_role_check') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'user_roles' AND constraint_name = 'user_roles_user_id_role_key') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE(user_id, role);
    END IF;
END $$;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE (com verificação)
-- =====================================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Criar índices condicionais apenas se as colunas existirem
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'featured') THEN
        CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'active') THEN
        CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
    END IF;
END $$;

-- Índices para carrinho
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Índices para categorias
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active) WHERE is_active = true;
    END IF;
END $$;

-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Categorias são públicas para leitura" ON public.categories;
DROP POLICY IF EXISTS "Produtos são públicos para leitura" ON public.products;
DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio carrinho" ON public.cart_items;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios papéis" ON public.user_roles;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categorias (público para leitura)
CREATE POLICY "Categorias são públicas para leitura" ON public.categories
    FOR SELECT USING (is_active = true);

-- Políticas para produtos (público para leitura)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'active') THEN
        CREATE POLICY "Produtos são públicos para leitura" ON public.products
            FOR SELECT USING (active = true);
    ELSE
        CREATE POLICY "Produtos são públicos para leitura" ON public.products
            FOR SELECT USING (true);
    END IF;
END $$;

-- Políticas para carrinho (apenas o próprio usuário)
CREATE POLICY "Usuários podem gerenciar seu próprio carrinho" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para pedidos (apenas o próprio usuário)
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios pedidos" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para itens do pedido (através do pedido)
CREATE POLICY "Usuários podem ver itens de seus pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Políticas para user_roles
CREATE POLICY "Usuários podem ver seus próprios papéis" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- 5. CRIAR FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_products ON public.products;
DROP TRIGGER IF EXISTS handle_updated_at_orders ON public.orders;

-- Triggers para updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. INSERIR DADOS DE EXEMPLO
-- =====================================================

-- Categorias de exemplo
INSERT INTO public.categories (name, slug, description, is_active, sort_order) VALUES
('Calçados', 'calcados', 'Tênis, sapatos, sandálias e mais', true, 1),
('Roupas', 'roupas', 'Camisetas, vestidos, calças e mais', true, 2),
('Acessórios', 'acessorios', 'Bolsas, relógios, joias e mais', true, 3),
('Esportes', 'esportes', 'Roupas e equipamentos esportivos', true, 4),
('Infantil', 'infantil', 'Moda para crianças', true, 5),
('Casa', 'casa', 'Decoração e itens para o lar', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Produtos de exemplo (verificar se as colunas existem)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'featured') 
       AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'active') THEN
        
        INSERT INTO public.products (name, description, price, original_price, category_id, brand, sizes, colors, stock, featured, active) 
        SELECT 
            'Tênis Nike Air Max 270',
            'Tênis esportivo com tecnologia Air Max para máximo conforto e estilo.',
            299.90,
            399.90,
            c.id,
            'Nike',
            ARRAY['38', '39', '40', '41', '42', '43'],
            ARRAY['Preto', 'Branco', 'Azul'],
            50,
            true,
            true
        FROM public.categories c WHERE c.slug = 'calcados'
        ON CONFLICT DO NOTHING;

        INSERT INTO public.products (name, description, price, original_price, category_id, brand, sizes, colors, stock, featured, active) 
        SELECT 
            'Vestido Floral Primavera',
            'Vestido leve e elegante, perfeito para o dia a dia ou ocasiões especiais.',
            159.90,
            199.90,
            c.id,
            'Zara',
            ARRAY['P', 'M', 'G', 'GG'],
            ARRAY['Floral Rosa', 'Floral Azul', 'Floral Verde'],
            30,
            true,
            true
        FROM public.categories c WHERE c.slug = 'roupas'
        ON CONFLICT DO NOTHING;

        INSERT INTO public.products (name, description, price, category_id, brand, sizes, colors, stock, featured, active) 
        SELECT 
            'Bolsa Couro Premium',
            'Bolsa de couro legítimo com design moderno e compartimentos organizadores.',
            249.90,
            c.id,
            'Coach',
            ARRAY['Único'],
            ARRAY['Preto', 'Marrom', 'Caramelo'],
            25,
            true,
            true
        FROM public.categories c WHERE c.slug = 'acessorios'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 7. CRIAR POLÍTICAS PARA ADMINS
-- =====================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 
        AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas admin existentes
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON public.products;
DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON public.categories;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON public.orders;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos" ON public.orders;

-- Políticas administrativas para produtos
CREATE POLICY "Admins podem gerenciar produtos" ON public.products
    FOR ALL USING (public.is_admin());

-- Políticas administrativas para categorias
CREATE POLICY "Admins podem gerenciar categorias" ON public.categories
    FOR ALL USING (public.is_admin());

-- Políticas administrativas para pedidos
CREATE POLICY "Admins podem ver todos os pedidos" ON public.orders
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins podem atualizar pedidos" ON public.orders
    FOR UPDATE USING (public.is_admin());

-- 8. CONFIGURAÇÕES FINAIS
-- =====================================================

-- Habilitar realtime para tabelas necessárias (ignorar erros se já existir)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Comentários nas tabelas para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuário estendendo auth.users';
COMMENT ON TABLE public.categories IS 'Categorias de produtos com hierarquia';
COMMENT ON TABLE public.products IS 'Catálogo de produtos da loja';
COMMENT ON TABLE public.cart_items IS 'Itens no carrinho de cada usuário';
COMMENT ON TABLE public.orders IS 'Pedidos realizados pelos usuários';
COMMENT ON TABLE public.order_items IS 'Itens específicos de cada pedido';
COMMENT ON TABLE public.user_roles IS 'Papéis e permissões dos usuários';

-- =====================================================
-- CONFIGURAÇÃO CONCLUÍDA!
-- 
-- Este script é seguro para executar múltiplas vezes
-- Ele verifica se as colunas/tabelas existem antes de criar
-- E adapta-se à estrutura existente do seu banco
-- =====================================================
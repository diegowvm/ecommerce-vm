-- =====================================================
-- XEGAI SHOP - CONFIGURAÇÃO COMPLETA DO SUPABASE
-- =====================================================

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAR TABELAS PRINCIPAIS
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

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
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

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
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

-- Tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, size, color)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    tracking_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Índices para carrinho
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active) WHERE is_active = true;

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
CREATE POLICY "Produtos são públicos para leitura" ON public.products
    FOR SELECT USING (active = true);

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

-- Produtos de exemplo
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

-- Habilitar realtime para tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

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
-- Para usar este script:
-- 1. Acesse seu projeto no Supabase
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- 4. Verifique se todas as tabelas foram criadas
-- 5. Teste a autenticação e RLS
-- =====================================================
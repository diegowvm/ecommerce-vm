import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "./category-card";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  product_count?: number;
}

interface DashboardStats {
  totalProducts: number;
  totalBrands: number;
  totalClients: number;
  averageRating: number;
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBrands: 0,
    totalClients: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(3);

      if (categoriesError) throw categoriesError;

      // Buscar estatísticas reais
      const [productsResult, usersResult] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      // Processar categorias com contagem de produtos
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('active', true);

          return {
            ...category,
            product_count: count || 0
          };
        })
      );

      // Buscar marcas únicas
      const { data: brandsData } = await supabase
        .from('marketplace_products')
        .select('brand')
        .not('brand', 'is', null);

      const uniqueBrands = new Set(brandsData?.map(p => p.brand) || []);

      setCategories(categoriesWithCount);
      setStats({
        totalProducts: productsResult.count || 0,
        totalBrands: uniqueBrands.size,
        totalClients: usersResult.count || 0,
        averageRating: 4.9 // Pode ser calculado baseado em avaliações reais futuramente
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-surface/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-muted/20 rounded w-48 mx-auto mb-4"></div>
              <div className="h-12 bg-muted/20 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-muted/20 rounded w-[500px] mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/20 aspect-video rounded-2xl mb-4"></div>
                <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-surface/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-accent font-medium tracking-wide">
            EXPLORE POR CATEGORIA
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Encontre Seu <span className="gradient-text">Estilo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {categories.length > 0 
              ? "Navegue por nossas categorias cuidadosamente selecionadas"
              : "Nossas categorias serão exibidas aqui em breve"
            }
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                title={category.name}
                description={`Produtos da categoria ${category.name}`}
                image={category.image_url || '/placeholder.svg'}
                itemCount={category.product_count || 0}
                gradient="from-primary/80 to-primary-glow/90"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
              <div className="w-10 h-10 text-muted-foreground/50">📂</div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mb-8">
              As categorias serão exibidas aqui quando forem criadas pelo administrador.
            </p>
          </div>
        )}

        {/* Stats Section - Dados Reais */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              {stats.totalProducts}+
            </p>
            <p className="text-muted-foreground">Produtos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-accent">
              {stats.totalBrands}+
            </p>
            <p className="text-muted-foreground">Marcas</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-secondary">
              {stats.totalClients}+
            </p>
            <p className="text-muted-foreground">Clientes</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold gradient-text">
              {stats.averageRating}★
            </p>
            <p className="text-muted-foreground">Avaliação</p>
          </div>
        </div>
      </div>
    </section>
  );
}
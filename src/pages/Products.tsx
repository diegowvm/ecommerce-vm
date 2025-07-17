import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaginationComponent } from '@/components/ui/pagination-component';
import { Search, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePagination, applyPagination, getSupabaseTotalCount } from '@/hooks/usePagination';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: string;
  sizes: string[];
  colors: string[];
  stock: number;
  categories?: { name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');

  // Pagination
  const pagination = usePagination({ defaultItemsPerPage: 12 });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [searchParams, pagination.currentPage, pagination.itemsPerPage]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    
    try {
      // Build base query
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `, { count: 'exact' });

      // Apply filters
      const search = searchParams.get('search');
      const category = searchParams.get('category');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (category && category !== 'all') {
        // First get category ID from slug
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single();
          
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply sorting
      const sort = searchParams.get('sort') || 'name';
      if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('name');
      }

      // Apply pagination
      const paginatedQuery = applyPagination(query, {
        offset: pagination.offset,
        limit: pagination.limit
      });

      const { data, error, count } = await paginatedQuery;
      
      if (error) throw error;

      setProducts(data || []);
      pagination.setTotalItems(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pagination.goToPage(1); // Reset to first page on search
    updateSearchParams({ search: searchTerm || undefined });
  };

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    pagination.reset();
    setSearchParams({});
  };

  const hasFilters = searchParams.get('search') || searchParams.get('category');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Produtos</h1>
            
            {/* Filters */}
            <div className="glass p-6 rounded-lg border border-border/20 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-surface/50 border-border/30"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </form>

                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    pagination.goToPage(1); // Reset to first page on filter change
                    updateSearchParams({ category: value === 'all' ? undefined : value });
                  }}
                >
                  <SelectTrigger className="w-full lg:w-[200px] bg-surface/50 border-border/30">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    pagination.goToPage(1); // Reset to first page on sort change
                    updateSearchParams({ sort: value });
                  }}
                >
                  <SelectTrigger className="w-full lg:w-[200px] bg-surface/50 border-border/30">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>

              {/* Active filters */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchParams.get('search') && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Busca: {searchParams.get('search')}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateSearchParams({ search: undefined })}
                      />
                    </Badge>
                  )}
                  {searchParams.get('category') && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Categoria: {categories.find(c => c.slug === searchParams.get('category'))?.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateSearchParams({ category: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="glass rounded-lg p-4 animate-pulse">
                  <div className="aspect-square bg-surface rounded-lg mb-4"></div>
                  <div className="h-4 bg-surface rounded mb-2"></div>
                  <div className="h-4 bg-surface rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brand={product.categories?.name || 'Marca'}
                    price={product.price}
                    originalPrice={product.original_price}
                    image={product.image_url}
                    rating={4.5}
                    reviews={127}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <PaginationComponent
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.goToPage}
                onItemsPerPageChange={pagination.setItemsPerPage}
                loading={loading}
                itemsPerPageOptions={[12, 24, 48, 96]}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mb-4">
                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros ou buscar por outros termos.
                </p>
              </div>
              {hasFilters && (
                <Button onClick={clearFilters}>
                  Limpar filtros e ver todos os produtos
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
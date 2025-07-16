import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PaginationComponent } from '@/components/ui/pagination-component';
import { Plus, Package, Search, Filter } from 'lucide-react';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination, applyPagination } from '@/hooks/usePagination';

export function ProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // For stats calculation
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Pagination
  const pagination = usePagination({ defaultItemsPerPage: 25 });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllProducts(); // For stats
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query with filters
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      query = query.order('created_at', { ascending: false });

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleProductSaved = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
    fetchAllProducts(); // Refresh stats
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });

      fetchProducts();
      fetchAllProducts(); // Refresh stats
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  // Remove client-side filtering since we're doing server-side filtering now
  const filteredProducts = products;

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        categories={categories}
        onSave={handleProductSaved}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allProducts.filter(p => p.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allProducts.filter(p => (p.stock || 0) < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos com estoque baixo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    pagination.goToPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  pagination.goToPage(1); // Reset to first page on filter
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Pagination */}
      <PaginationComponent
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.goToPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        loading={loading}
      />
    </div>
  );
}
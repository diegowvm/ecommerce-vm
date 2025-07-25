import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Layers, Search, Settings } from 'lucide-react';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { SubcategoryManager } from './SubcategoryManager';
import { PaginationComponent } from '@/components/ui/pagination-component';
import { usePagination, applyPagination, getSupabaseTotalCount } from '@/hooks/usePagination';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function CategoriesManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    offset,
    goToPage,
    setItemsPerPage,
    setTotalItems
  } = usePagination({ defaultItemsPerPage: 10 });

  useEffect(() => {
    fetchCategories();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Build filters
      const filters = {};
      if (searchTerm) {
        filters['name.ilike'] = searchTerm;
      }

      // Get total count
      const totalCount = await getSupabaseTotalCount(supabase, 'categories', filters);
      setTotalItems(totalCount);

      // Build query
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      // Apply filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply pagination
      query = applyPagination(query, { offset, limit: itemsPerPage });

      const { data, error } = await query;

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCategorySaved = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchCategories();
  };

  const handleManageSubcategories = (category) => {
    setSelectedCategory(category);
    setShowSubcategories(true);
  };

  const handleBackFromSubcategories = () => {
    setShowSubcategories(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      // Check if category has products
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (products && products.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir uma categoria que possui produtos associados",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    }
  };

  // Remove client-side filtering since we're doing server-side pagination
  const filteredCategories = categories;

  if (showSubcategories && selectedCategory) {
    return (
      <SubcategoryManager
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        onBack={handleBackFromSubcategories}
      />
    );
  }

  if (showForm) {
    return (
      <CategoryForm
        category={editingCategory}
        onSave={handleCategorySaved}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
          <p className="text-muted-foreground">
            Organize seus produtos por categorias
          </p>
        </div>
        <Button onClick={handleCreateCategory} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
          <Layers className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories.length}</div>
          <p className="text-xs text-muted-foreground">
            categorias cadastradas
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <CategoryList
        categories={filteredCategories}
        loading={loading}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onManageSubcategories={handleManageSubcategories}
      />

      {/* Pagination */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
        loading={loading}
      />
    </div>
  );
}
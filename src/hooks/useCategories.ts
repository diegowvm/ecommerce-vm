import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Subcategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('fetch_categories_with_subcategories');

      if (error) throw error;
      
      const transformedData = (data || []).map((category: any) => ({
        ...category,
        subcategories: Array.isArray(category.subcategories) 
          ? category.subcategories 
          : typeof category.subcategories === 'string' 
          ? JSON.parse(category.subcategories)
          : []
      }));
      
      setCategories(transformedData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Erro ao carregar categorias');
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria",
        variant: "destructive"
      });
      return false;
    }
  };

  const createSubcategory = async (subcategoryData: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .insert(subcategoryData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria criada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar subcategoria",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateSubcategory = async (id: string, subcategoryData: Partial<Subcategory>) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .update(subcategoryData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria atualizada com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar subcategoria",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria excluída com sucesso",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir subcategoria",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    refetch: fetchCategories
  };
}
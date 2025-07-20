import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SubcategoryForm } from './SubcategoryForm';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface SubcategoryManagerProps {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
}

export function SubcategoryManager({ categoryId, categoryName, onBack }: SubcategoryManagerProps) {
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as subcategorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = () => {
    setEditingSubcategory(null);
    setShowForm(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setShowForm(true);
  };

  const handleSubcategorySaved = () => {
    setShowForm(false);
    setEditingSubcategory(null);
    fetchSubcategories();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;

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

      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a subcategoria",
        variant: "destructive",
      });
    }
  };

  if (showForm) {
    return (
      <SubcategoryForm
        categoryId={categoryId}
        subcategory={editingSubcategory}
        onSave={handleSubcategorySaved}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Subcategorias de {categoryName}
          </h2>
          <p className="text-muted-foreground">
            Gerencie as subcategorias desta categoria
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleCreateSubcategory} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Subcategoria
        </Button>
      </div>

      {/* Subcategories List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : subcategories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma subcategoria encontrada</p>
              <Button onClick={handleCreateSubcategory} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira subcategoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          subcategories.map((subcategory) => (
            <Card key={subcategory.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {subcategory.image_url && (
                      <img
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{subcategory.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        /{subcategory.slug}
                      </p>
                      {subcategory.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {subcategory.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Ordem: {subcategory.order}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSubcategory(subcategory)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
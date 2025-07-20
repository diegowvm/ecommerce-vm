import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubcategoryFormProps {
  categoryId: string;
  subcategory?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function SubcategoryForm({ categoryId, subcategory, onSave, onCancel }: SubcategoryFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    order: 0
  });

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        slug: subcategory.slug || '',
        description: subcategory.description || '',
        image_url: subcategory.image_url || '',
        order: subcategory.order || 0
      });
    }
  }, [subcategory]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subcategoryData = {
        category_id: categoryId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        image_url: formData.image_url || null,
        order: formData.order
      };

      let result;
      if (subcategory) {
        result = await supabase
          .from('subcategories')
          .update(subcategoryData)
          .eq('id', subcategory.id);
      } else {
        result = await supabase
          .from('subcategories')
          .insert([subcategoryData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: subcategory ? "Subcategoria atualizada com sucesso" : "Subcategoria criada com sucesso",
      });

      onSave();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a subcategoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {subcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
          </h2>
          <p className="text-muted-foreground">
            {subcategory ? 'Atualize as informações da subcategoria' : 'Adicione uma nova subcategoria'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Subcategoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Subcategoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="subcategoria-exemplo"
              />
              <p className="text-sm text-muted-foreground">
                O slug é gerado automaticamente baseado no nome, mas pode ser editado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da subcategoria..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-muted-foreground">
                Ordem para exibição no menu (menor número aparece primeiro)
              </p>
            </div>

            {formData.image_url && (
              <div className="space-y-2">
                <Label>Preview da Imagem</Label>
                <div className="w-32 h-32 rounded-lg bg-muted/20 overflow-hidden">
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Subcategoria'}
          </Button>
        </div>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Search, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CategoryMapping {
  id: string;
  marketplace_name: string;
  marketplace_category_id: string;
  marketplace_category_name: string;
  xegai_category_id: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

export function CategoryMappings() {
  const [mappings, setMappings] = useState<CategoryMapping[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newMapping, setNewMapping] = useState({
    marketplace_name: '',
    marketplace_category_id: '',
    marketplace_category_name: '',
    xegai_category_id: ''
  });

  useEffect(() => {
    loadMappings();
    loadCategories();
  }, []);

  const loadMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_category_mappings')
        .select(`
          *,
          categories!xegai_category_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappingsWithCategoryNames = data?.map(mapping => ({
        ...mapping,
        category_name: mapping.categories?.name
      })) || [];

      setMappings(mappingsWithCategoryNames);
    } catch (error) {
      console.error('Error loading mappings:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mapeamentos de categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddMapping = async () => {
    try {
      if (!newMapping.marketplace_name || !newMapping.marketplace_category_id || 
          !newMapping.marketplace_category_name || !newMapping.xegai_category_id) {
        toast({
          title: "Erro",
          description: "Todos os campos são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('marketplace_category_mappings')
        .insert(newMapping);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mapeamento criado com sucesso",
      });

      setNewMapping({
        marketplace_name: '',
        marketplace_category_id: '',
        marketplace_category_name: '',
        xegai_category_id: ''
      });
      setShowAddDialog(false);
      loadMappings();
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar mapeamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_category_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mapeamento removido com sucesso",
      });

      loadMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover mapeamento",
        variant: "destructive",
      });
    }
  };

  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = searchTerm === '' || 
      mapping.marketplace_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMarketplace = selectedMarketplace === 'all' || selectedMarketplace === '' || 
      mapping.marketplace_name === selectedMarketplace;

    return matchesSearch && matchesMarketplace;
  });

  if (isLoading) {
    return <div>Carregando mapeamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mapeamento de Categorias</CardTitle>
          <CardDescription>
            Configure como as categorias dos marketplaces são mapeadas para suas categorias internas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Add Button */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos marketplaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="MercadoLivre">MercadoLivre</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="AliExpress">AliExpress</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mapeamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Mapeamento de Categoria</DialogTitle>
                  <DialogDescription>
                    Crie um mapeamento entre uma categoria do marketplace e uma categoria interna
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Marketplace</Label>
                    <Select
                      value={newMapping.marketplace_name}
                      onValueChange={(value) => setNewMapping({...newMapping, marketplace_name: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um marketplace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MercadoLivre">MercadoLivre</SelectItem>
                        <SelectItem value="Amazon">Amazon</SelectItem>
                        <SelectItem value="AliExpress">AliExpress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>ID da Categoria no Marketplace</Label>
                    <Input
                      value={newMapping.marketplace_category_id}
                      onChange={(e) => setNewMapping({...newMapping, marketplace_category_id: e.target.value})}
                      placeholder="Ex: MLB123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nome da Categoria no Marketplace</Label>
                    <Input
                      value={newMapping.marketplace_category_name}
                      onChange={(e) => setNewMapping({...newMapping, marketplace_category_name: e.target.value})}
                      placeholder="Ex: Calçados Esportivos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria Interna</Label>
                    <Select
                      value={newMapping.xegai_category_id}
                      onValueChange={(value) => setNewMapping({...newMapping, xegai_category_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddMapping} className="flex-1">
                      Criar Mapeamento
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mappings Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Categoria do Marketplace</TableHead>
                  <TableHead>ID Externo</TableHead>
                  <TableHead>Categoria Interna</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum mapeamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {mapping.marketplace_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {mapping.marketplace_category_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {mapping.marketplace_category_id}
                      </TableCell>
                      <TableCell>
                        <Badge>
                          {mapping.category_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMapping(mapping.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{mappings.length}</div>
                <p className="text-xs text-muted-foreground">Total de Mapeamentos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {new Set(mappings.map(m => m.marketplace_name)).size}
                </div>
                <p className="text-xs text-muted-foreground">Marketplaces Configurados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {new Set(mappings.map(m => m.xegai_category_id)).size}
                </div>
                <p className="text-xs text-muted-foreground">Categorias Mapeadas</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
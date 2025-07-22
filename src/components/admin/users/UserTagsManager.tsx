import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, Plus, Edit, Trash2, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  user_count?: number;
}

const tagSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal'),
  description: z.string().optional()
});

type TagFormData = z.infer<typeof tagSchema>;

export function UserTagsManager() {
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<UserTag | null>(null);

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      color: '#3b82f6'
    }
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      // Fetch tags with user count
      const { data: tagsData, error: tagsError } = await supabase
        .from('user_tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;

      // Get user count for each tag
      const tagsWithCount = await Promise.all(
        (tagsData || []).map(async (tag) => {
          const { count, error } = await supabase
            .from('user_tag_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tag.id);

          if (error) console.error('Error counting users for tag:', error);

          return {
            ...tag,
            user_count: count || 0
          };
        })
      );

      setTags(tagsWithCount);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TagFormData) => {
    try {
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('user_tags')
          .update({
            name: data.name,
            color: data.color,
            description: data.description || null
          })
          .eq('id', editingTag.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tag atualizada com sucesso!",
        });
      } else {
        // Create new tag
        const { error } = await supabase
          .from('user_tags')
          .insert({
            name: data.name,
            color: data.color,
            description: data.description || null
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tag criada com sucesso!",
        });
      }

      form.reset();
      setEditingTag(null);
      setIsDialogOpen(false);
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tag",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tag: UserTag) => {
    setEditingTag(tag);
    form.reset({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tagId: string, tagName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a tag "${tagName}"? Isso removerá a tag de todos os usuários.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tag excluída com sucesso!",
      });

      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tag",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Gestão de Tags
              </CardTitle>
              <CardDescription>
                Crie e gerencie tags para categorizar e organizar usuários
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingTag(null);
                form.reset({ color: '#3b82f6' });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTag ? 'Editar Tag' : 'Criar Nova Tag'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTag 
                      ? 'Atualize as informações da tag selecionada'
                      : 'Crie uma nova tag para categorizar usuários'
                    }
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Tag</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: VIP, Novo Cliente, Premium..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="color" 
                                className="w-16 h-10 p-1 border rounded"
                                {...field} 
                              />
                              <Input 
                                placeholder="#3b82f6"
                                className="flex-1"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Descreva o propósito desta tag..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingTag ? 'Atualizar' : 'Criar'} Tag
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma tag encontrada. Crie a primeira tag para começar a organizar seus usuários.
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ 
                            backgroundColor: `${tag.color}20`,
                            borderColor: tag.color,
                            color: tag.color
                          }}
                          className="font-medium"
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={tag.description || ''}>
                          {tag.description || 'Sem descrição'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{tag.user_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(tag.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(tag)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(tag.id, tag.name)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {tags.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Tags Disponíveis:</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color
                    }}
                  >
                    {tag.name} ({tag.user_count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
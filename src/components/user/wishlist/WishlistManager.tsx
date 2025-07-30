import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaginationComponent } from '@/components/ui/pagination-component';
import { usePagination, applyPagination, getSupabaseTotalCount } from '@/hooks/usePagination';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function WishlistManager() {
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    offset,
    goToPage,
    setItemsPerPage,
    setTotalItems
  } = usePagination({ defaultItemsPerPage: 9 });

  useEffect(() => {
    fetchWishlistItems();
  }, [currentPage, itemsPerPage]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total count
      const totalCount = await getSupabaseTotalCount(supabase, 'wishlist', { user_id: user.id });
      setTotalItems(totalCount);

      // Build query with pagination
      let query = supabase
        .from('wishlist')
        .select(`
          *,
          products(
            id,
            name,
            price,
            original_price,
            image_url,
            active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply pagination
      query = applyPagination(query, { offset, limit: itemsPerPage });

      const { data, error } = await query;

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Removido",
        description: "Produto removido dos favoritos",
      });

      // Refresh the list
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Heart className="h-5 w-5 text-primary fill-current" />
        <h2 className="text-xl font-semibold">Meus Favoritos</h2>
        <Badge variant="secondary" className="ml-2">
          {wishlistItems.length}
        </Badge>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sua lista de favoritos está vazia</h3>
              <p className="text-muted-foreground mb-4">
                Adicione produtos que você gostaria de comprar mais tarde.
              </p>
              <Button asChild>
                <Link to="/products">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Explorar Produtos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative">
                {item.products.image_url ? (
                  <img
                    src={item.products.image_url}
                    alt={item.products.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sem imagem</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover dos favoritos?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O produto "{item.products.name}" será removido da sua lista de favoritos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(item.product_id)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {!item.products.active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Indisponível</Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">
                  {item.products.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      R$ {item.products.price.toFixed(2)}
                    </span>
                    {item.products.original_price && item.products.original_price > item.products.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {item.products.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    asChild 
                    size="sm" 
                    className="flex-1"
                    disabled={!item.products.active}
                  >
                    <Link to={`/products/${item.product_id}`}>
                      Ver Produto
                    </Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {wishlistItems.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
          loading={loading}
        />
      )}
    </div>
  );
}
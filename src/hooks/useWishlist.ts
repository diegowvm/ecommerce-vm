import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    images?: string[];
    active: boolean;
  };
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadWishlist = async () => {
    try {
      const { data: wishlistData, error } = await supabase
        .from('wishlist')
        .select('id, user_id, product_id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!wishlistData || wishlistData.length === 0) {
        setWishlistItems([]);
        return;
      }

      // Get product details separately
      const productIds = wishlistData.map(item => item.product_id);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, original_price, images, active')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Combine wishlist and product data
      const combinedData: WishlistItem[] = wishlistData.map(wishlistItem => {
        const product = productsData?.find(p => p.id === wishlistItem.product_id);
        return {
          ...wishlistItem,
          products: product || {
            id: wishlistItem.product_id,
            name: 'Produto não encontrado',
            price: 0,
            active: false,
          }
        };
      });

      setWishlistItems(combinedData);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de favoritos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar aos favoritos.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('wishlist')
        .insert([{
          user_id: user.id,
          product_id: productId,
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Informação",
            description: "Este produto já está na sua lista de favoritos.",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Produto adicionado aos favoritos!",
      });

      loadWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto removido dos favoritos!",
      });

      loadWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    loadWishlist,
  };
}
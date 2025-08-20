import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { db } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Product } from '@/types';

// Mock cart item type
interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  products?: Product;
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Mock cart items for now
  const isLoading = false;

  // Mock mutations for now
  const addToCartMutation = {
    mutate: (data: any) => {
      if (!user) {
        toast.error('Faça login para adicionar produtos ao carrinho');
        return;
      }
      toast.success('Produto adicionado ao carrinho!');
    },
    isPending: false
  };

  const removeFromCartMutation = {
    mutate: (itemId: string) => {
      toast.success('Produto removido do carrinho');
    },
    isPending: false
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const shipping = subtotal >= 199 ? 0 : 15; // Free shipping over R$199
  const total = subtotal + shipping;

  // Helper functions
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    if (!user) {
      toast.error('Faça login para adicionar produtos ao carrinho');
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      size,
      color
    });
  };

  const removeFromCart = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Find the item and update it
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      addToCartMutation.mutate({
        productId: item.product_id,
        quantity: newQuantity,
        size: item.size || undefined,
        color: item.color || undefined
      });
    }
  };

  const clearCart = () => {
    cartItems.forEach(item => {
      removeFromCartMutation.mutate(item.id);
    });
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return {
    // Data
    cartItems,
    isLoading,
    subtotal,
    shipping,
    total,
    itemCount,
    
    // UI State
    isOpen,
    openCart,
    closeCart,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Loading states
    isAdding: addToCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending
  };
};
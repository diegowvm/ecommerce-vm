import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { ROUTES, SHIPPING_CONFIG } from '@/lib/constants';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export const CartDrawer = () => {
  const {
    isOpen,
    closeCart,
    cartItems,
    subtotal,
    shipping,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    isLoading
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const freeShippingRemaining = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
  const showFreeShippingProgress = freeShippingRemaining > 0;

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Carrinho ({itemCount})</span>
          </SheetTitle>
          
          {/* Free Shipping Progress */}
          {showFreeShippingProgress && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Frete grátis em:</span>
                <span className="font-medium text-primary">
                  {formatPrice(freeShippingRemaining)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((subtotal / SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Seu carrinho está vazio</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Adicione produtos para começar suas compras
              </p>
              <Button asChild onClick={closeCart}>
                <Link to={ROUTES.PRODUCTS}>
                  Explorar Produtos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">📦</div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.products?.name || 'Produto'}
                    </h4>
                    
                    {/* Variants */}
                    {(item.size || item.color) && (
                      <div className="flex space-x-2 mt-1">
                        {item.size && (
                          <Badge variant="secondary" className="text-xs">
                            {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="secondary" className="text-xs">
                            {item.color}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="font-medium text-sm mt-2">
                      {formatPrice(item.products?.price || 0)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frete</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" asChild onClick={closeCart}>
                <Link to={ROUTES.CHECKOUT}>
                  Finalizar Compra
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                <Link to={ROUTES.CART}>
                  Ver Carrinho Completo
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
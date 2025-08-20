import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        size,
        color,
        products (
          id,
          name,
          price,
          images,
          stock
        )
      `)
      .eq('user_id', user!.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o carrinho",
        variant: "destructive",
      });
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }

    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
    } else {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item removido",
        description: "O item foi removido do carrinho",
      });
    }

    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const shipping = subtotal >= 199 ? 0 : 15;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
              <p className="text-muted-foreground mb-6">
                Faça login para ver seus itens salvos ou comece a comprar!
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/auth">Fazer Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/products">Continuar Comprando</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass p-6 rounded-lg">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-surface rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface rounded w-2/3"></div>
                      <div className="h-4 bg-surface rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
              <p className="text-muted-foreground mb-6">
                Que tal explorar nossos produtos incríveis?
              </p>
              <Button asChild>
                <Link to="/products">Começar a Comprar</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="glass p-6 rounded-lg border border-border/20">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${item.products.id}`} className="flex-shrink-0">
                      <img
                        src={item.products.images && item.products.images.length > 0 ? item.products.images[0] : '/placeholder.png'}
                        alt={item.products.name}
                        className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.products.id}`}
                        className="font-semibold hover:text-primary transition-colors block truncate"
                      >
                        {item.products.name}
                      </Link>
                      
                      <div className="flex gap-2 mt-2">
                        {item.size && (
                          <Badge variant="outline" className="text-xs">
                            Tamanho: {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="outline" className="text-xs">
                            Cor: {item.color}
                          </Badge>
                        )}
                      </div>

                      <p className="text-lg font-bold text-primary mt-2">
                        R$ {item.products.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id) || item.quantity >= item.products.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold">
                        R$ {(item.products.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass p-6 rounded-lg border border-border/20 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "GRÁTIS" : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>

                  {subtotal < 199 && (
                    <div className="text-sm text-muted-foreground">
                      Frete grátis para compras acima de R$ 199,00
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Finalizar Compra
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full mt-3" 
                  asChild
                >
                  <Link to="/products">Continuar Comprando</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
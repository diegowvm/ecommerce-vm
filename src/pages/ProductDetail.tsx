import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  categories?: { name: string; slug: string };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Produto não encontrado",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }

    if (data) {
      setProduct(data);
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
    }
    setLoading(false);
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedSize && product?.sizes?.length > 0) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, escolha um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedColor && product?.colors?.length > 0) {
      toast({
        title: "Selecione uma cor",
        description: "Por favor, escolha uma cor antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(true);

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: product!.id,
        quantity,
        size: selectedSize || null,
        color: selectedColor || null,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Adicionado ao carrinho!",
        description: `${product!.name} foi adicionado ao seu carrinho.`,
      });
    }

    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-surface rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-surface rounded"></div>
                  <div className="h-4 bg-surface rounded w-2/3"></div>
                  <div className="h-6 bg-surface rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
              <Button onClick={() => navigate('/products')}>
                Voltar aos produtos
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/products')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos produtos
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden glass">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded overflow-hidden glass cursor-pointer">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              {product.categories && (
                <Badge variant="secondary" className="w-fit">
                  {product.categories.name}
                </Badge>
              )}

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.0) • 127 avaliações</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                    <Badge variant="destructive">-{discount}%</Badge>
                  </>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tamanho</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="aspect-square"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Cor</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Quantidade</h3>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock info */}
              <div className="text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-green-600">✓ {product.stock} unidades em estoque</span>
                ) : (
                  <span className="text-red-600">✗ Produto fora de estoque</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={addToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 flex items-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                </Button>
                
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 gap-4 pt-6 border-t border-border/20">
                <div className="flex justify-between text-sm">
                  <span>Frete grátis</span>
                  <span className="text-green-600">Acima de R$ 199,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entrega</span>
                  <span>3-5 dias úteis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Troca e devolução</span>
                  <span>30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
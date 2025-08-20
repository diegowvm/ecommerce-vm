import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ROUTES } from '@/lib/constants';

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    name: 'Tênis Nike Air Max 270',
    price: 299.90,
    original_price: 399.90,
    images: ['/product-1.jpg'],
    rating: 4.8,
    reviews_count: 124,
    featured: true,
    brand: 'Nike'
  },
  {
    id: '2',
    name: 'Vestido Floral Primavera',
    price: 159.90,
    original_price: 199.90,
    images: ['/product-2.jpg'],
    rating: 4.6,
    reviews_count: 89,
    featured: true,
    brand: 'Zara'
  },
  {
    id: '3',
    name: 'Jaqueta Jeans Clássica',
    price: 189.90,
    original_price: 249.90,
    images: ['/product-3.jpg'],
    rating: 4.7,
    reviews_count: 156,
    featured: true,
    brand: 'Levi\'s'
  },
  {
    id: '4',
    name: 'Bolsa Couro Premium',
    price: 249.90,
    original_price: 349.90,
    images: ['/product-4.jpg'],
    rating: 4.9,
    reviews_count: 203,
    featured: true,
    brand: 'Coach'
  }
];

export const FeaturedProducts = () => {
  const { data: products = mockProducts, isLoading } = useFeaturedProducts();
  const { addToCart, isAdding } = useCart();

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-lg text-muted-foreground">
              Selecionados especialmente para você
            </p>
          </div>
          
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to={ROUTES.PRODUCTS}>
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid-products">
          {products.slice(0, 8).map((product) => (
            <Card key={product.id} className="card-product group">
              <div className="relative overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <div className="text-4xl opacity-50">📦</div>
                </div>

                {/* Discount Badge */}
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                    -{calculateDiscount(product.original_price, product.price)}%
                  </Badge>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Add to Cart */}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => addToCart(product)}
                    disabled={isAdding}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Brand */}
                <div className="text-xs text-muted-foreground mb-1">
                  {product.brand}
                </div>

                {/* Product Name */}
                <Link 
                  to={`/products/${product.id}`}
                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 mb-2 block"
                >
                  {product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews_count})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>

                {/* Installments */}
                <div className="text-xs text-muted-foreground mt-1">
                  ou 12x de {formatPrice(product.price / 12)} sem juros
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button asChild>
            <Link to={ROUTES.PRODUCTS}>
              Ver Todos os Produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
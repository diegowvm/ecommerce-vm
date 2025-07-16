import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./button";
import { ArrowRight, Star, Heart, ShoppingBag } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel";
import { LazyImage } from "./lazy-image";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images?: string[];
  description?: string;
  featured: boolean;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('active', true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/20 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-12 bg-muted/20 rounded-lg w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-muted/20 rounded-lg w-[500px] mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/20 aspect-square rounded-2xl mb-4"></div>
                <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-surface/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary font-medium tracking-wider text-sm uppercase">
            CATÁLOGO PREMIUM
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Produtos <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-accent">Exclusivos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra nossa coleção curada de produtos premium, selecionados especialmente para você
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Nenhum produto em destaque</h3>
            <p className="text-muted-foreground mb-8">
              Os produtos em destaque aparecerão aqui quando forem adicionados pelo administrador.
            </p>
          </div>
        ) : (
          <>
            {/* Modern Rotating Carousel */}
            <div className="relative mb-16">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {products.map((product, index) => (
                    <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="group relative">
                        {/* Main Card Container */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card/50 to-card border border-border/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-2">
                          {/* Background Gradient Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden">
                              {product.image_url || (product.images && product.images[0]) ? (
                                <LazyImage
                                  src={product.image_url || product.images?.[0] || ''}
                                  alt={product.name}
                                  width={600}
                                  height={600}
                                  aspectRatio="1/1"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  fallbackSrc="/placeholder.svg"
                                  containerClassName="w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                              )}
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Price Badge */}
                            <div className="absolute top-4 left-4">
                              <div className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full border border-border/50">
                                <span className="text-sm font-semibold text-foreground">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            </div>

                            {/* Discount Badge */}
                            {product.original_price && product.original_price > product.price && (
                              <div className="absolute top-4 right-4">
                                <div className="px-3 py-1.5 bg-destructive/90 backdrop-blur-sm rounded-full">
                                  <span className="text-sm font-semibold text-destructive-foreground">
                                    -{calculateDiscount(product.price, product.original_price)}%
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <Button size="sm" className="flex-1 bg-background/90 hover:bg-background text-foreground border border-border/50 backdrop-blur-sm">
                                <Heart className="w-4 h-4 mr-2" />
                                Favoritar
                              </Button>
                              <Button size="sm" className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Comprar
                              </Button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 relative z-10">
                            <h3 className="font-bold text-xl mb-2 text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                              {product.name}
                            </h3>
                            
                            {product.description && (
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                {product.description}
                              </p>
                            )}

                            {/* Price Section */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {product.original_price && product.original_price > product.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.original_price)}
                                  </span>
                                )}
                                <span className="text-lg font-bold text-primary">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-primary text-primary" />
                                <span className="text-sm font-medium">4.8</span>
                              </div>
                            </div>
                          </div>

                          {/* Shine Effect */}
                          <div className="absolute inset-0 -top-full group-hover:top-full bg-gradient-to-b from-transparent via-white/20 to-transparent transition-all duration-1000 pointer-events-none"></div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background" />
                <CarouselNext className="right-4 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background" />
              </Carousel>
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button 
                size="lg"
                className="group px-8 py-4 text-lg bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-accent transition-all duration-500 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
              >
                <span className="mr-2">Explorar Catálogo Completo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ProductCard } from "@/components/ui/product-card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  discount_percentage?: number;
}

const Outlet = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutletProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, original_price, image_url')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching outlet products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold gradient-text">
                Outlet
              </h1>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                Até 70% OFF
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aproveite ofertas imperdíveis em produtos selecionados com descontos especiais
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  {product.discount_percentage && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 left-2 z-10"
                    >
                      -{product.discount_percentage}%
                    </Badge>
                  )}
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    brand="Marca"
                    price={product.price}
                    originalPrice={product.original_price}
                    image={product.image_url}
                    rating={4.1}
                    reviews={23}
                    isSale={true}
                    discount={product.discount_percentage}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">Nenhuma oferta disponível</h3>
              <p className="text-muted-foreground">
                Novas promoções serão adicionadas em breve
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Outlet;
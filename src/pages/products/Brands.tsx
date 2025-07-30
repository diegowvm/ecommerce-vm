import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  product_count: number;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Como não temos tabela de marcas ainda, vamos usar dados mockados
        const mockBrands = [
          { id: '1', name: 'Nike', description: 'Just Do It', product_count: 45 },
          { id: '2', name: 'Adidas', description: 'Impossible is Nothing', product_count: 38 },
          { id: '3', name: 'Puma', description: 'Forever Faster', product_count: 22 },
          { id: '4', name: 'Vans', description: 'Off The Wall', product_count: 19 },
          { id: '5', name: 'Converse', description: 'All Star', product_count: 15 },
          { id: '6', name: 'New Balance', description: 'Run Your Way', product_count: 12 },
          { id: '7', name: 'Asics', description: 'Sound Mind, Sound Body', product_count: 18 },
          { id: '8', name: 'Reebok', description: 'Be More Human', product_count: 14 }
        ];
        
        setBrands(mockBrands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Nossas Marcas
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore produtos das marcas mais prestigiadas do mundo esportivo e casual
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-32 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <Link key={brand.id} to={`/products?brand=${brand.name}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover-glow">
                    <CardContent className="p-6 text-center">
                      <div className="h-16 flex items-center justify-center mb-4">
                        {brand.logo_url ? (
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-primary">
                            {brand.name}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                      {brand.description && (
                        <p className="text-muted-foreground text-sm mb-3">
                          {brand.description}
                        </p>
                      )}
                      <p className="text-sm text-primary font-medium">
                        {brand.product_count} produtos
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
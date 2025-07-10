import { ProductCard } from "./product-card";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const featuredProducts = [
  {
    id: "1",
    name: "AirMax Revolution 2024",
    brand: "NikeFlow",
    price: 299.99,
    originalPrice: 399.99,
    image: product1,
    rating: 4.8,
    reviews: 324,
    isNew: true,
    isSale: true,
    discount: 25,
    colors: ["#3B82F6", "#FFFFFF", "#000000"]
  },
  {
    id: "2",
    name: "Elite Basketball Pro",
    brand: "Jordan Peak",
    price: 459.99,
    image: product2,
    rating: 4.9,
    reviews: 187,
    isNew: true,
    colors: ["#000000", "#DC2626", "#FFFFFF"]
  },
  {
    id: "3",
    name: "Court Master Tennis",
    brand: "Adidas Ultra",
    price: 199.99,
    originalPrice: 249.99,
    image: product3,
    rating: 4.7,
    reviews: 256,
    isSale: true,
    discount: 20,
    colors: ["#FFFFFF", "#10B981", "#6B7280"]
  },
  {
    id: "4",
    name: "Speed Runner Elite",
    brand: "NikeFlow",
    price: 349.99,
    image: product1,
    rating: 4.6,
    reviews: 143,
    colors: ["#3B82F6", "#8B5CF6", "#FFFFFF"]
  },
  {
    id: "5",
    name: "Urban Street Style",
    brand: "Jordan Peak",
    price: 289.99,
    originalPrice: 329.99,
    image: product2,
    rating: 4.5,
    reviews: 289,
    isSale: true,
    discount: 12,
    colors: ["#000000", "#FFFFFF", "#6B7280"]
  },
  {
    id: "6",
    name: "Comfort Walk Pro",
    brand: "Adidas Ultra",
    price: 179.99,
    image: product3,
    rating: 4.8,
    reviews: 412,
    isNew: true,
    colors: ["#FFFFFF", "#3B82F6", "#10B981"]
  }
];

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-surface/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary font-medium tracking-wide">
            PRODUTOS EM DESTAQUE
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Nossos <span className="gradient-text">Lançamentos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra os produtos mais inovadores e desejados da temporada
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            size="lg"
            variant="outline"
            className="btn-glass group text-lg px-8 py-6"
          >
            Ver Todos os Produtos
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
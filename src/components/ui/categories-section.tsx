import { CategoryCard } from "./category-card";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const categories = [
  {
    title: "Running",
    description: "Tênis para corrida e performance",
    image: product1,
    itemCount: 156,
    gradient: "from-blue-600/80 to-blue-800/90"
  },
  {
    title: "Basketball",
    description: "Calçados para quadra",
    image: product2,
    itemCount: 89,
    gradient: "from-red-600/80 to-red-800/90"
  },
  {
    title: "Lifestyle",
    description: "Estilo casual para o dia a dia",
    image: product3,
    itemCount: 234,
    gradient: "from-green-600/80 to-green-800/90"
  }
];

export function CategoriesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-surface/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-accent font-medium tracking-wide">
            EXPLORE POR CATEGORIA
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Encontre Seu <span className="gradient-text">Estilo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navegue por nossas categorias cuidadosamente selecionadas
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              500+
            </p>
            <p className="text-muted-foreground">Produtos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-accent">
              50+
            </p>
            <p className="text-muted-foreground">Marcas</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold text-secondary">
              10k+
            </p>
            <p className="text-muted-foreground">Clientes</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl md:text-4xl font-bold gradient-text">
              4.9★
            </p>
            <p className="text-muted-foreground">Avaliação</p>
          </div>
        </div>
      </div>
    </section>
  );
}
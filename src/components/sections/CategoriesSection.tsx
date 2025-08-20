import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    id: 'calcados',
    name: 'Calçados',
    description: 'Tênis, sapatos e sandálias',
    image: '👟',
    href: '/products?category=calcados',
    color: 'from-blue-500/20 to-blue-600/20'
  },
  {
    id: 'roupas',
    name: 'Roupas',
    description: 'Camisetas, vestidos e mais',
    image: '👕',
    href: '/products?category=roupas',
    color: 'from-purple-500/20 to-purple-600/20'
  },
  {
    id: 'acessorios',
    name: 'Acessórios',
    description: 'Bolsas, relógios e joias',
    image: '👜',
    href: '/products?category=acessorios',
    color: 'from-pink-500/20 to-pink-600/20'
  },
  {
    id: 'esportes',
    name: 'Esportes',
    description: 'Roupas e equipamentos',
    image: '⚽',
    href: '/products?category=esportes',
    color: 'from-green-500/20 to-green-600/20'
  },
  {
    id: 'infantil',
    name: 'Infantil',
    description: 'Moda para crianças',
    image: '🧸',
    href: '/products?category=infantil',
    color: 'from-yellow-500/20 to-yellow-600/20'
  },
  {
    id: 'casa',
    name: 'Casa & Decoração',
    description: 'Itens para o lar',
    image: '🏠',
    href: '/products?category=casa',
    color: 'from-orange-500/20 to-orange-600/20'
  }
];

export const CategoriesSection = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore por Categoria
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre exatamente o que você procura navegando pelas nossas categorias
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={category.href}>
              <Card className="card-hover border-0 bg-background/50 backdrop-blur-sm h-full">
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                    {category.image}
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-sm md:text-base mb-2">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Special Categories */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Outlet */}
          <Card className="card-hover bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-destructive">
                    Outlet Especial
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Até 70% de desconto em produtos selecionados
                  </p>
                  <Button variant="destructive" asChild>
                    <Link to="/products/outlet">
                      Ver Ofertas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="text-6xl opacity-50">🔥</div>
              </div>
            </CardContent>
          </Card>

          {/* New Releases */}
          <Card className="card-hover bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">
                    Lançamentos
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Novidades que acabaram de chegar
                  </p>
                  <Button asChild>
                    <Link to="/products/new-releases">
                      Descobrir
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="text-6xl opacity-50">✨</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';

const heroSlides = [
  {
    id: 1,
    title: 'Nova Coleção Verão 2025',
    subtitle: 'Descubra as últimas tendências em moda',
    description: 'Peças exclusivas com até 50% de desconto na primeira compra',
    image: '/hero-1.jpg',
    cta: 'Ver Coleção',
    badge: 'Novo'
  },
  {
    id: 2,
    title: 'Calçados Premium',
    subtitle: 'Conforto e estilo em cada passo',
    description: 'Marcas renomadas com frete grátis para todo o Brasil',
    image: '/hero-2.jpg',
    cta: 'Explorar',
    badge: 'Frete Grátis'
  },
  {
    id: 3,
    title: 'Outlet Especial',
    subtitle: 'Até 70% de desconto',
    description: 'Produtos selecionados com preços imperdíveis',
    image: '/hero-3.jpg',
    cta: 'Aproveitar',
    badge: '70% OFF'
  }
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
      
      <div className="container-custom relative h-full">
        <div className="flex items-center h-full">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            {/* Badge */}
            <Badge variant="secondary" className="text-sm font-medium">
              {slide.badge}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
              {slide.subtitle}
            </h2>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg">
              {slide.description}
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span className="text-muted-foreground">(50k+ avaliações)</span>
              </div>
              <div className="text-muted-foreground">
                500+ marcas parceiras
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-primary group" asChild>
                <Link to={ROUTES.PRODUCTS}>
                  {slide.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" />
                Como Funciona
              </Button>
            </div>
          </div>

          {/* Hero Image - Hidden on mobile for better performance */}
          <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20" />
              {/* Placeholder for hero image */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-l-3xl flex items-center justify-center">
                <div className="text-6xl opacity-20">👟</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 hidden xl:block animate-float">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
          <div className="text-2xl">✨</div>
        </div>
      </div>
      
      <div className="absolute bottom-32 right-32 hidden xl:block animate-float" style={{ animationDelay: '2s' }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
          <div className="text-xl">🎯</div>
        </div>
      </div>
    </section>
  );
};
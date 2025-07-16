import { Button } from "./button";
import { ArrowRight, Play } from "lucide-react";
import heroShoe from "@/assets/hero-shoe.jpg";
import { OptimizedImage } from "./optimized-image";
import { useImagePreloader } from "@/hooks/useImagePreloader";
export function HeroSection() {
  // Preload critical hero image
  useImagePreloader({
    images: [heroShoe],
    priority: true,
  });

  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroShoe} 
          alt="Hero Product" 
          width={1920}
          height={1080}
          priority={true}
          lazy={false}
          className="w-full h-full object-cover opacity-50" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-xl animate-float" style={{
      animationDelay: '2s'
    }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-float" style={{
      animationDelay: '4s'
    }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <p className="text-primary font-medium text-lg tracking-wide">NOVA COLEÇÃO 2025</p>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                O FUTURO
                <br />
                <span className="gradient-text">DO ESPORTE</span>
                <br />
                CHEGOU
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Descubra a próxima geração de calçados esportivos com tecnologia
                revolucionária e design futurístico.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="btn-gradient hover-glow group text-lg px-8 py-6">
                Explorar Coleção
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="btn-glass group text-lg px-8 py-6">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Assistir Vídeo
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Frete Grátis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Troca Garantida</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span>Entrega Rápida</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 animate-float">
              <OptimizedImage 
                src={heroShoe} 
                alt="Tênis Futurístico" 
                width={500}
                height={500}
                priority={true}
                lazy={false}
                className="w-full max-w-md mx-auto drop-shadow-2xl" 
              />
            </div>
            
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl transform scale-75" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-glow" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>;
}
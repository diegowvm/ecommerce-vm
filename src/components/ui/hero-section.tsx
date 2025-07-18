import { Button } from "./button";
import { ArrowRight, Play } from "lucide-react";
import heroShoe from "@/assets/hero-shoe.jpg";
export function HeroSection() {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroShoe} alt="Hero Product" className="w-full h-full object-cover opacity-50" />
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
              <img src={heroShoe} alt="Tênis Futurístico" className="w-full max-w-md mx-auto drop-shadow-2xl" />
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
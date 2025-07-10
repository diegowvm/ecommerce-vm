import { ArrowRight } from "lucide-react";
import { Button } from "./button";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  itemCount: number;
  gradient: string;
}

export function CategoryCard({ 
  title, 
  description, 
  image, 
  itemCount,
  gradient 
}: CategoryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl product-hover cursor-pointer">
      <div className="relative h-80 bg-gradient-to-br from-surface to-muted/50">
        {/* Background Image */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-80`} />
        
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="space-y-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {title}
              </h3>
              <p className="text-white/80">
                {description}
              </p>
              <p className="text-sm text-white/60">
                {itemCount} produtos
              </p>
            </div>
            
            <Button 
              variant="secondary"
              className="group/btn w-fit bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              Explorar
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
      </div>
    </div>
  );
}
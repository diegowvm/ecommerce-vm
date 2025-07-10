import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  colors?: string[];
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  isNew = false,
  isSale = false,
  discount,
  colors = []
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="group relative product-hover">
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/20 p-6">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {isNew && (
            <Badge className="bg-accent text-accent-foreground">
              NOVO
            </Badge>
          )}
          {isSale && discount && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
          onClick={() => setIsFavorited(!isFavorited)}
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'
            }`} 
          />
        </Button>

        {/* Product Image */}
        <div className="relative mb-6 group/image">
          <div className="aspect-square bg-gradient-to-br from-surface to-muted/50 rounded-xl overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          {/* Quick Add Button */}
          <Button 
            size="sm"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 btn-gradient hover-glow"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Brand */}
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            {brand.toUpperCase()}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviews})
            </span>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex items-center space-x-2">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedColor === index
                      ? 'border-primary scale-110'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(index)}
                />
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
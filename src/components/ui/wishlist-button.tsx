import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function WishlistButton({ 
  productId, 
  size = 'md', 
  variant = 'ghost',
  className 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsToggling(true);
    try {
      await toggleWishlist(productId);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        sizeClasses[size],
        'transition-colors relative',
        inWishlist && variant === 'ghost' && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleToggle}
      disabled={isToggling}
      title={inWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isToggling ? (
        <div className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          iconSizes[size]
        )} />
      ) : (
        <Heart 
          className={cn(
            iconSizes[size],
            'transition-all duration-200',
            inWishlist && 'fill-current scale-110'
          )} 
        />
      )}
    </Button>
  );
}
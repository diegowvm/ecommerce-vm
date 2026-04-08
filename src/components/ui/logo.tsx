import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 'h-8 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-20 w-auto',
};

export function Logo({ size = 'md', linkTo = '/', className, showText = false }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src="/logo-xegai.png"
        alt="Xegai Shop"
        className={cn(sizeMap[size], 'object-contain')}
      />
      {showText && (
        <span className="font-bold text-xl text-foreground">Xegai Shop</span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}

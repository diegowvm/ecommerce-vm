import React, { Suspense, lazy } from 'react';
import { Skeleton } from './skeleton';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  enableSuspense?: boolean;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  className,
  enableSuspense = true,
}) => {
  const defaultFallback = (
    <div className={`w-full h-32 ${className}`}>
      <Skeleton className="w-full h-full" />
    </div>
  );

  if (!enableSuspense) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component para lazy loading de componentes
export const withLazyLoading = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyWrappedComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyComponent fallback={fallback}>
      <LazyWrappedComponent {...props} ref={ref} />
    </LazyComponent>
  ));
};

export { LazyComponent };
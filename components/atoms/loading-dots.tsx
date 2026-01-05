import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
  color?: string;
}

export const LoadingDots = memo(
  ({ className, dotClassName, color }: LoadingDotsProps) => {
    const style = color ? { backgroundColor: color } : undefined;

    return (
      <section
        className={cn(
          'flex items-center justify-center gap-2 h-full w-full',
          className
        )}
      >
        <div
          className={cn(
            'h-2 w-2 rounded-full animate-pulse-dots will-change-transform [animation-delay:-0.3s]',
            !color && (dotClassName || 'bg-brand-accent')
          )}
          style={style}
        ></div>
        <div
          className={cn(
            'h-2 w-2 rounded-full animate-pulse-dots will-change-transform [animation-delay:-0.15s]',
            !color && (dotClassName || 'bg-brand-accent')
          )}
          style={style}
        ></div>
        <div
          className={cn(
            'h-2 w-2 rounded-full animate-pulse-dots will-change-transform [animation-delay:0s]',
            !color && (dotClassName || 'bg-brand-accent')
          )}
          style={style}
        ></div>
      </section>
    );
  }
);

LoadingDots.displayName = 'LoadingDots';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingDots = memo(({ className, dotClassName }: LoadingDotsProps) => {
  return (
    <section className={cn("flex items-center justify-center gap-2 h-full w-full", className)}>
      <div className={cn("h-3 w-3 rounded-full animate-pulse-dots will-change-transform [animation-delay:-0.3s]", dotClassName || "bg-brand-accent")}></div>
      <div className={cn("h-3 w-3 rounded-full animate-pulse-dots will-change-transform [animation-delay:-0.15s]", dotClassName || "bg-brand-accent")}></div>
      <div className={cn("h-3 w-3 rounded-full animate-pulse-dots will-change-transform [animation-delay:0s]", dotClassName || "bg-brand-accent")}></div>
      <div className={cn("h-3 w-3 rounded-full animate-pulse-dots will-change-transform [animation-delay:0.15s]", dotClassName || "bg-brand-accent")}></div>
      <div className={cn("h-3 w-3 rounded-full animate-pulse-dots will-change-transform [animation-delay:0.3s]", dotClassName || "bg-brand-accent")}></div>
    </section>
  );
});

LoadingDots.displayName = 'LoadingDots';

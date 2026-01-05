import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/atoms/loading-dots';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-brand-accent text-white hover:opacity-90 shadow-lg shadow-brand-accent/20',
      secondary:
        'bg-white/5 text-white hover:bg-white/10 border border-white/10',
      outline:
        'bg-transparent border border-white/10 text-gray-400 hover:text-white hover:bg-white/5',
      ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
      danger:
        'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-2xl',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className='flex items-center justify-center h-5'>
            <LoadingDots
              className='w-12'
              dotClassName={
                variant === 'primary' ? 'bg-white' : 'bg-brand-accent'
              }
            />
          </div>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

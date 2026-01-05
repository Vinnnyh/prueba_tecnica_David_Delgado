import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all placeholder:text-gray-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-accent transition-colors">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

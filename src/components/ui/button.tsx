import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'text-slate-700 hover:bg-slate-100',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      link: 'text-blue-600 underline-offset-4 hover:underline'
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-sm',
      xs: 'h-6 px-2 text-xs',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-10 px-6 text-base',
      icon: 'h-9 w-9 p-0',
      'icon-xs': 'h-6 w-6 p-0',
      'icon-sm': 'h-7 w-7 p-0',
      'icon-lg': 'h-10 w-10 p-0'
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;

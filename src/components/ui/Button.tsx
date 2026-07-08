import React from 'react';
import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps, Spinner } from '@heroui/react';

export interface ButtonProps extends Omit<HeroUIButtonProps, 'children' | 'isLoading'> {
  /** Button variant - extends HeroUI variants with custom ones */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner */
  isLoading?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonProps['variant'], string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
  outline: 'border border-zinc-700 bg-transparent hover:bg-zinc-800 text-white',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20',
};

const sizeStyles: Record<ButtonProps['size'], string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      font-bold rounded-2xl transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      flex items-center justify-center gap-1.5
      ${fullWidth ? 'w-full' : ''}
    `;

    return (
      <HeroUIButton
        ref={ref}
        disableAnimation
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        isDisabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" color="white" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </HeroUIButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
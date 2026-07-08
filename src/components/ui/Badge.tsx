import React from 'react';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'outline' | 'ghost';
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Shape */
  shape?: 'rounded' | 'pill' | 'square';
  /** Dot indicator */
  dot?: boolean;
  /** Dot color (overrides variant) */
  dotColor?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Removable */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
}

const variantStyles: Record<'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'outline' | 'ghost', string> = {
  default: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  success: 'bg-success-500/15 text-success-400 border border-success-500/30',
  warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/30',
  danger: 'bg-danger-500/15 text-danger-400 border border-danger-500/30',
  info: 'bg-info-500/15 text-info-400 border border-info-500/30',
  brand: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  outline: 'bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-600',
  ghost: 'bg-transparent text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-transparent',
};

const sizeStyles: Record<'xs' | 'sm' | 'md' | 'lg', string> = {
  xs: 'px-2 py-0.5 text-[9px] gap-1',
  sm: 'px-2.5 py-1 text-[10px] gap-1.5',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2',
};

const shapeStyles: Record<'rounded' | 'pill' | 'square', string> = {
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  square: 'rounded-lg',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      shape = 'pill',
      dot = false,
      dotColor,
      onClick,
      className = '',
      removable = false,
      onRemove,
      ...props
    },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold transition-all duration-200
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${shapeStyles[shape]}
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
          ${removable ? 'pr-1' : ''}
          ${className}
        `}
        onClick={onClick}
        {...props}
      >
        {dot && (
          <span
            className={`
              rounded-full flex-shrink-0
              ${dotColor ? `bg-[${dotColor}]` : variant === 'success' ? 'bg-success-500' :
                variant === 'warning' ? 'bg-warning-500' :
                variant === 'danger' ? 'bg-danger-500' :
                variant === 'brand' ? 'bg-brand-500' :
                variant === 'info' ? 'bg-info-500' : 'bg-zinc-500'}
              h-1.5 w-1.5
            `}
            aria-hidden="true"
          />
        )}
        <span className="whitespace-nowrap">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="ml-1 p-0.5 rounded hover:bg-black/20 transition-colors flex items-center justify-center"
            aria-label="Remove"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-current opacity-70 hover:opacity-100">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
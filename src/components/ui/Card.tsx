import React from 'react';

export interface CardProps {
  /** Card variant */
  variant?: 'default' | 'glass' | 'elevated' | 'bordered' | 'gradient';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover effect */
  hover?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Children */
  children: React.ReactNode;
  /** Custom style */
  style?: React.CSSProperties;
}

const variantStyles: Record<CardProps['variant'], string> = {
  default: 'bg-zinc-900/60 border border-zinc-800',
  glass: 'glass border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl',
  elevated: 'bg-zinc-950 border border-zinc-800 shadow-xl shadow-black/30',
  bordered: 'bg-transparent border-2 border-zinc-700',
  gradient: 'bg-gradient-to-br from-brand-600/20 via-brand-700/5 to-zinc-950 border border-brand-500/20',
};

const paddingStyles: Record<CardProps['padding'], string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      onClick,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-3xl transition-all duration-300
      ${variantStyles[variant]}
      ${paddingStyles[padding]}
      ${hover ? 'hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/10 cursor-pointer' : ''}
      ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
    `;

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${className}`}
        style={style}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
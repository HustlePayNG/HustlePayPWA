import React from 'react';

export interface SkeletonProps {
  /** Variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button';
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Border radius */
  radius?: string;
  /** Animation */
  animation?: 'pulse' | 'wave' | 'none';
  /** Number of lines (for text variant) */
  lines?: number;
  /** Gap between lines */
  gap?: string;
  /** Additional className */
  className?: string;
}

const animationStyles: Record<'pulse' | 'wave' | 'none', string> = {
  pulse: 'animate-pulse',
  wave: 'animate-[shimmer_1.5s_infinite]',
  none: '',
};

const variantDefaults: Record<'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button', { width?: string; height?: string; radius?: string }> = {
  text: { height: '1rem', radius: 'rounded' },
  circular: { width: '3rem', height: '3rem', radius: 'rounded-full' },
  rectangular: { width: '100%', height: '1rem', radius: 'rounded-lg' },
  card: { width: '100%', height: '12rem', radius: 'rounded-2xl' },
  avatar: { width: '2.5rem', height: '2.5rem', radius: 'rounded-full' },
  button: { width: '6rem', height: '2.5rem', radius: 'rounded-xl' },
};

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      radius,
      animation = 'wave',
      lines = 1,
      gap = '0.5rem',
      className = '',
      ...props
    },
    ref
  ) => {
    const defaults = variantDefaults[variant];
    const w = width ?? defaults.width ?? '100%';
    const h = height ?? defaults.height ?? '1rem';
    const r = radius ?? defaults.radius ?? 'rounded';

    const baseStyle: React.CSSProperties = {
      width: typeof w === 'number' ? `${w}px` : w,
      height: typeof h === 'number' ? `${h}px` : h,
      borderRadius: r.replace('rounded', '').replace('-', '').replace('full', '9999px').replace('xl', '1rem').replace('lg', '0.5rem').replace('md', '0.375rem').replace('sm', '0.25rem').replace('2xl', '1.5rem'),
      background: 'linear-gradient(90deg, #27272a 25%, #3f3f46 50%, #27272a 75%)',
      backgroundSize: '200% 100%',
    };

    if (animation === 'none') {
      baseStyle.background = '#27272a';
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={`flex flex-col gap-[${gap}] ${className}`} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={animationStyles[animation]}
              style={{
                ...baseStyle,
                width: i === lines - 1 ? '60%' : '100%',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${animationStyles[animation]} ${className}`}
        style={baseStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
import React from 'react';

export interface AvatarProps {
  /** Image source */
  src?: string | null;
  /** Alt text */
  alt?: string;
  /** Fallback initials */
  name?: string;
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  /** Shape */
  shape?: 'circle' | 'square' | 'rounded';
  /** Border */
  border?: boolean;
  /** Border color */
  borderColor?: string;
  /** Status indicator */
  status?: 'online' | 'busy' | 'away' | 'offline';
  /** Status position */
  statusPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  /** Additional className */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
}

const sizeStyles: Record<Exclude<AvatarProps['size'], number>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
  '2xl': 'h-20 w-20 text-lg',
};

const shapeStyles: Record<AvatarProps['shape'], string> = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-2xl',
};

const statusSizeStyles: Record<AvatarProps['size'], string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5',
};

const statusColorStyles: Record<AvatarProps['status'], string> = {
  online: 'bg-success-500',
  busy: 'bg-danger-500',
  away: 'bg-warning-500',
  offline: 'bg-zinc-600',
};

const statusPositionStyles: Record<AvatarProps['statusPosition'], string> = {
  'bottom-right': 'bottom-0 right-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-left': 'top-0 left-0',
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      name,
      size = 'md',
      shape = 'circle',
      border = false,
      borderColor,
      status,
      statusPosition = 'bottom-right',
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeClass = typeof size === 'number' ? `h-[${size}px] w-[${size}px]` : sizeStyles[size];
    const textSizeClass = typeof size === 'number' ? `text-[${size * 0.35}px]` : sizeClass.replace(/h-\d+ w-\d+ /, '');

    const getInitials = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = name ? getInitials(name) : '?';

    const bgColors = [
      'bg-brand-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-red-500',
    ];
    const colorIndex = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length : 0;
    const bgColor = bgColors[colorIndex];

    const statusSize = typeof size === 'number' ? 'h-2 w-2' : statusSizeStyles[size];

    return (
      <div
        ref={ref}
        className={`relative inline-flex shrink-0 ${className}`}
        onClick={onClick}
        {...props}
      >
        <div
          className={`
            ${sizeClass} ${shapeStyles[shape]} overflow-hidden flex items-center justify-center
            ${bgColor} font-bold select-none
            ${border ? `ring-2 ${borderColor ? `ring-[${borderColor}]` : 'ring-zinc-700'}` : ''}
            ${onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''}
          `}
        >
          {src ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <span className={textSizeClass}>{initials}</span>
          )}
        </div>

        {status && (
          <span
            className={`
              absolute rounded-full ring-2 ring-zinc-950
              ${statusColorStyles[status]}
              ${statusPositionStyles[statusPosition]}
              ${statusSize}
            `}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
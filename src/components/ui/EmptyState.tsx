import React from 'react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  /** Icon */
  icon?: React.ReactNode;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Alignment */
  align?: 'center' | 'left';
  /** Custom className */
  className?: string;
  /** Custom illustration */
  illustration?: React.ReactNode;
}

const sizeStyles: Record<EmptyStateProps['size'], string> = {
  sm: 'py-6 px-4',
  md: 'py-12 px-6',
  lg: 'py-16 px-8',
};

const alignStyles: Record<EmptyStateProps['align'], string> = {
  center: 'text-center items-center',
  left: 'text-left items-start',
};

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      align = 'center',
      className = '',
      illustration,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col gap-4 ${sizeStyles[size]} ${alignStyles[align]} ${className}`}
        {...props}
      >
        <div className="flex flex-col items-center gap-3 w-full">
          {illustration ? (
            <div className="w-full max-w-xs">{illustration}</div>
          ) : icon ? (
            <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-500">
              {icon}
            </div>
          ) : null}

          <div className="w-full">
            <h3 className={`font-extrabold text-white ${align === 'center' ? 'text-lg' : 'text-base'}`}>
              {title}
            </h3>
            {description && (
              <p className={`mt-2 text-zinc-400 text-sm leading-relaxed font-light ${align === 'center' ? 'mx-auto max-w-sm' : ''}`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {(action || secondaryAction) && (
          <div className={`flex gap-3 w-full mt-2 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
            {secondaryAction && (
              <Button
                variant="ghost"
                size={size === 'sm' ? 'sm' : 'md'}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {action && (
              <Button
                variant={action.variant || 'primary'}
                size={action.size || (size === 'sm' ? 'sm' : 'md')}
                leftIcon={action.leftIcon}
                rightIcon={action.rightIcon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
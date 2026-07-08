import React from 'react';
import { Input as HeroUIInput, InputProps as HeroUIInputProps } from '@heroui/react';

export interface InputProps extends Omit<HeroUIInputProps, 'children'> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Input variant */
  variant?: 'default' | 'search' | 'filled';
  /** Full width */
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      fullWidth = true,
      className = '',
      classNames,
      ...props
    },
    ref
  ) => {
    const inputWrapperStyles = `
      flex flex-col gap-1.5 w-full
      ${fullWidth ? 'w-full' : ''}
    `;

    const labelStyles = 'text-[11px] font-semibold text-zinc-400 uppercase tracking-wider';

    const baseInputStyles = `
      flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none
      disabled:bg-zinc-900/50 disabled:text-zinc-600
    `;

    const variantStyles: Record<InputProps['variant'], string> = {
      default: 'border border-zinc-800 bg-zinc-900/50 focus-within:border-brand-500',
      search: 'border border-zinc-800 bg-zinc-900/60 focus-within:border-brand-500',
      filled: 'border border-zinc-800 bg-zinc-900 focus-within:border-brand-500',
    };

    const inputStyles = `${baseInputStyles} h-11 px-3.5`;

    return (
      <div className={inputWrapperStyles}>
        {label && <label className={labelStyles}>{label}</label>}
        <div
          className={`flex items-center gap-2.5 rounded-xl transition-colors ${variantStyles[variant]}`}
          {...(classNames?.wrapper && { className: classNames.wrapper })}
        >
          {leftIcon && (
            <span className="text-zinc-500 flex-shrink-0">{leftIcon}</span>
          )}
          <HeroUIInput
            ref={ref}
            classNames={{
              input: `${inputStyles} ${className}`,
            }}
            {...props}
          />
          {rightIcon && (
            <span className="text-zinc-500 flex-shrink-0">{rightIcon}</span>
          )}
          {error && <span className="text-red-400 text-[10px] flex-shrink-0">{error}</span>}
        </div>
        {error && <p className="text-red-400 text-[10px] mt-0.5" role="alert">{error}</p>}
        {helperText && !error && <p className="text-zinc-500 text-[10px] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
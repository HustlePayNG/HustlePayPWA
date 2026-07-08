import React from 'react';
import { Textarea as HeroUITextarea, TextareaProps as HeroUITextareaProps } from '@heroui/react';

export interface TextAreaProps extends Omit<HeroUITextareaProps, 'children'> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Character count limit */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Rows */
  rows?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      fullWidth = true,
      rows = 4,
      className = '',
      classNames,
      ...props
    },
    ref
  ) => {
    const wrapperStyles = `
      flex flex-col gap-1.5
      ${fullWidth ? 'w-full' : ''}
    `;

    const labelStyles = 'text-[11px] font-semibold text-zinc-400 uppercase tracking-wider';

    const baseTextareaStyles = `
      w-full bg-zinc-900/50 border border-zinc-800 rounded-xl
      text-xs text-white placeholder:text-zinc-600
      focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500
      disabled:bg-zinc-900/30 disabled:text-zinc-600 disabled:border-zinc-800
      resize-y transition-colors
      p-3.5
    `;

    const charCount = props.value ? props.value.toString().length : 0;

    return (
      <div className={wrapperStyles}>
        {label && <label className={labelStyles}>{label}</label>}
        <div className="relative">
          <HeroUITextarea
            ref={ref}
            rows={rows}
            classNames={{
              textarea: `${baseTextareaStyles} ${className}`,
            }}
            {...props}
          />
          {(showCount || maxLength) && (
            <div className="absolute bottom-2 right-2 text-[9px] text-zinc-500 pointer-events-none">
              {charCount}{maxLength && ` / ${maxLength}`}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-[10px] mt-0.5" role="alert">{error}</p>}
        {helperText && !error && <p className="text-zinc-500 text-[10px] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
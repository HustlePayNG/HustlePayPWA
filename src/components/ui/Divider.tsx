import React, { forwardRef } from 'react';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ className = '', orientation = 'horizontal', ...props }, ref) => {
    return (
      <hr
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={`border-0 border-t border-zinc-800 ${orientation === 'vertical' ? 'h-8 w-px' : 'my-4'} ${className}`}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
import React, { forwardRef } from 'react';

interface SwitchProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  isDisabled?: boolean;
  className?: string;
  thumbIcon?: React.ReactNode;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onValueChange, isDisabled, className = '', thumbIcon }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isDisabled}
        onClick={() => !isDisabled && onValueChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        style={{
          backgroundColor: checked ? '#33658A' : '#3f3f46',
        }}
      >
        <span
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          style={{
            transform: checked ? 'translateX(5px)' : 'translateX(0)'
          }}
        >
          {thumbIcon && <span className="flex items-center justify-center h-full w-full">{thumbIcon}</span>}
        </span>
      </button>
    );
  }
);

Switch.displayName = 'Switch';
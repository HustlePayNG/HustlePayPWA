import React from 'react';

interface CustomCheckboxProps {
  isSelected: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  isSelected,
  onChange,
  className = '',
  children,
  isDisabled = false
}) => {
  return (
    <label className={`flex items-start gap-2.5 select-none text-left ${
      isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    } ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={isSelected}
          disabled={isDisabled}
          onChange={(e) => !isDisabled && onChange(e.target.checked)}
        />
        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
          isDisabled
            ? 'bg-zinc-100 border-zinc-300 opacity-60'
            : isSelected 
              ? 'bg-[#33658a] border-[#33658a]' 
              : 'border-[#94a3b8] hover:border-[#33658a] bg-white'
        }`}>
          {isSelected && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={4.5} 
              stroke="currentColor" 
              className="w-2.5 h-2.5"
              style={{ color: '#ffffff' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-zinc-500 text-xs leading-relaxed">{children}</span>
    </label>
  );
};

export default CustomCheckbox;

import React from 'react';
import {
  Select as HeroUISelect,
  SelectTrigger,
  SelectValue,
  SelectPopover,
  ListBox,
  ListBoxItem,
  SelectProps as HeroUISelectProps,
} from '@heroui/react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<HeroUISelectProps, 'children'> {
  /** Label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Options */
  options: SelectOption[];
  /** Placeholder */
  placeholder?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Show search */
  searchable?: boolean;
  /** Custom render for option */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  /** Additional className */
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      fullWidth = true,
      searchable = false,
      renderOption,
      className = '',
      classNames,
      selectedKey,
      onSelectionChange,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const wrapperStyles = `
      flex flex-col gap-1.5
      ${fullWidth ? 'w-full' : ''}
    `;

    const labelStyles = 'text-[11px] font-semibold text-zinc-400 uppercase tracking-wider';

    const triggerStyles = `
      w-full bg-zinc-900/50 border border-zinc-800 rounded-xl
      p-3 text-xs text-white
      focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500
      disabled:bg-zinc-900/30 disabled:text-zinc-600 disabled:border-zinc-800
      transition-colors
      flex items-center justify-between
    `;

    const popoverStyles = 'bg-zinc-950 border border-zinc-850 rounded-xl p-1 text-white z-50 max-h-64';

    const itemStyles = `
      p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-brand-500/20
      rounded-lg cursor-pointer outline-none
      transition-colors
      flex items-center gap-2
      data-[selected=true]:bg-brand-500/20 data-[selected=true]:text-white
      data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed
    `;

    return (
      <div ref={ref} className={`${wrapperStyles} ${className}`} {...props}>
        {label && <label className={labelStyles}>{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
        <HeroUISelect
          classNames={{
            trigger: triggerStyles,
            popover: popoverStyles,
            listbox: 'outline-none',
          }}
          selectedKey={selectedKey}
          onSelectionChange={onSelectionChange}
          isDisabled={disabled}
          {...props}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectPopover>
            <ListBox className="outline-none" autoFocus>
              {options.map((option) => (
                <ListBoxItem
                  key={option.value}
                  textValue={option.value}
                  disabled={option.disabled}
                  className={itemStyles}
                >
                  {renderOption
                    ? renderOption(option, selectedKey === option.value)
                    : (
                      <>
                        {option.icon && <span className="flex-shrink-0 text-zinc-500">{option.icon}</span>}
                        <span className="flex-1 truncate">{option.label}</span>
                      </>
                    )}
                </ListBoxItem>
              ))}
            </ListBox>
          </SelectPopover>
        </HeroUISelect>
        {error && <p className="text-red-400 text-[10px] mt-0.5" role="alert">{error}</p>}
        {helperText && !error && <p className="text-zinc-500 text-[10px] mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
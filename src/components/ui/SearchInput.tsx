import React from 'react';
import { SearchNormal1, CloseCircle } from 'iconsax-react';

export interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Value */
  value: string;
  /** On change handler */
  onChange: (value: string) => void;
  /** On submit handler */
  onSubmit?: (value: string) => void;
  /** Show filter button */
  showFilter?: boolean;
  /** Filter button click handler */
  onFilterClick?: () => void;
  /** Filter active state */
  filterActive?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Auto focus */
  autoFocus?: boolean;
  /** Additional className */
  className?: string;
  /** Input ref */
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = 'Search...',
      value,
      onChange,
      onSubmit,
      showFilter = false,
      onFilterClick,
      filterActive = false,
      disabled = false,
      autoFocus = false,
      className = '',
      inputRef,
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit(value);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 flex items-center gap-2.5 px-3.5 h-11 border border-zinc-800 rounded-2xl bg-zinc-900/60 focus-within:border-brand-500/70 transition-colors">
          <SearchNormal1 size={16} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
          <input
            ref={(el) => {
              if (inputRef) inputRef.current = el;
              if (ref) (ref as React.MutableRefObject<HTMLInputElement>).current = el;
            }}
            type="text"
            placeholder={placeholder}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoFocus={autoFocus}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <CloseCircle size={14} color="currentColor" variant="Broken" />
            </button>
          )}
        </div>
        {showFilter && (
          <button
            type="button"
            onClick={onFilterClick}
            disabled={disabled}
            className={`h-11 w-11 flex items-center justify-center rounded-2xl border transition-all ${
              filterActive
                ? 'bg-brand-500 border-brand-400 text-white'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
            }`}
            aria-label="Filters"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-currentColor">
              <path d="M4 5H14M4 9H12M4 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
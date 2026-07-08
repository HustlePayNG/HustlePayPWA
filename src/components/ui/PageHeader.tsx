import React from 'react';

export interface PageHeaderProps {
  /** Greeting text (e.g., "Good morning, Leslie") */
  greeting?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Search input props */
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    showFilter?: boolean;
    onFilterClick?: () => void;
    filterActive?: boolean;
  };
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Custom className */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  greeting,
  subtitle,
  search,
  action,
  className = '',
}) => {
  return (
    <div className={`px-5 pb-4 ${className}`}>
      {greeting && (
        <p className="text-[11px] text-brand-400 uppercase tracking-widest font-bold mb-0.5">
          {greeting}
        </p>
      )}
      {subtitle && (
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-4">{subtitle}</h1>
      )}
      {(search || action) && (
        <div className="flex gap-2 items-center">
          {search && (
            <div className="flex-1">
              <SearchInput
                placeholder={search.placeholder}
                value={search.value}
                onChange={search.onChange}
                onSubmit={search.onSubmit}
                showFilter={search.showFilter}
                onFilterClick={search.onFilterClick}
                filterActive={search.filterActive}
              />
            </div>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import { SearchInput } from './SearchInput';

export default PageHeader;
import React from 'react';

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Icon background color */
  iconBg?: string;
  /** Icon color */
  iconColor?: string;
  /** Action link */
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  /** Show divider */
  divider?: boolean;
  /** Custom className */
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  iconBg = 'bg-brand-500/15',
  iconColor = 'text-brand-400',
  action,
  divider = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg}`}>
            <span className={`${iconColor}`}>{icon}</span>
          </div>
        )}
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-brand-400 font-semibold bg-brand-500/10 px-3 py-1 rounded-full hover:bg-brand-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

export interface TabItem {
  /** Unique identifier */
  id: string;
  /** Label */
  label: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Badge count */
  badge?: number;
  /** Badge variant */
  badgeVariant?: 'default' | 'brand' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Custom path (defaults to `/${id}`) */
  path?: string;
}

export interface TabBarProps {
  /** Tab items */
  tabs: TabItem[];
  /** Current active tab ID */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Variant */
  variant?: 'floating' | 'fixed' | 'inline';
  /** Show labels (on hover/focus for floating) */
  showLabels?: boolean;
  /** Custom className */
  className?: string;
  /** Container className */
  containerClassName?: string;
}

const variantStyles: Record<TabBarProps['variant'], string> = {
  floating: 'fixed bottom-4 left-1/2 -translate-x-1/2 z-30 lg:absolute w-fit glass border-0 h-11 rounded-full p-0 flex flex-row flex-nowrap items-center justify-center gap-0 overflow-hidden shadow-lg',
  fixed: 'fixed bottom-0 left-0 right-0 z-30 glass border-t border-zinc-800 h-16 px-2 flex flex-row flex-nowrap items-center justify-around',
  inline: 'flex flex-row flex-nowrap items-center justify-around gap-0',
};

const tabStyles = `
  focus:outline-none cursor-pointer h-full shrink-0
  transition-colors duration-300
`;

export const TabBar = React.forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      tabs,
      activeTab,
      onTabChange,
      variant = 'floating',
      showLabels = true,
      className = '',
      containerClassName = '',
    },
    ref
  ) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppStore();

    // Auto-detect active tab from route if not provided
    const currentPath = location.pathname;
    const computedActiveTab = activeTab ?? tabs.find(t => currentPath === t.path || currentPath.startsWith(t.path + '/'))?.id ?? tabs[0]?.id;

    const handleTabClick = (tab: TabItem) => {
      if (tab.disabled) return;
      const path = tab.path ?? `/${tab.id}`;
      navigate(path);
      onTabChange?.(tab.id);
    };

    const getBadgeStyles = (variant: TabItem['badgeVariant']) => {
      switch (variant) {
        case 'brand': return 'bg-brand-500 text-white';
        case 'danger': return 'bg-red-500 text-white';
        default: return 'bg-zinc-500 text-white';
      }
    };

    return (
      <nav
        ref={ref}
        className={`${variantStyles[variant]} ${containerClassName}`}
        role="tablist"
        aria-label="Main navigation"
      >
        {tabs.map((tab, index) => {
          const isActive = computedActiveTab === tab.id;
          const badgeStyles = tab.badge ? getBadgeStyles(tab.badgeVariant) : '';

          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab)}
              className={`${tabStyles} ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              whileTap={{ scale: 0.95 }}
              style={{ position: 'relative' }}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`flex items-center gap-1.5 h-full rounded-full transition-colors duration-300 ${
                  isActive
                    ? 'bg-brand-500 text-white px-5 font-bold text-white-force'
                    : 'text-zinc-500 hover:text-zinc-300 px-4'
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <AnimatePresence initial={false}>
                  {showLabels && isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] overflow-hidden whitespace-nowrap"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${badgeStyles}`}
                    aria-label={`${tab.badge} notifications`}
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </nav>
    );
  }
);

TabBar.displayName = 'TabBar';

export default TabBar;
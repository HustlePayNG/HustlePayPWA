import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import {
  Home, SearchNormal1, MessageText
} from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';

// Standard layout

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hasBadge?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label, hasBadge }) => {
  return (
    <button
      onClick={onClick}
      className="focus:outline-none cursor-pointer h-full shrink-0"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className={`flex items-center gap-1.5 h-full rounded-full transition-colors duration-300 relative ${
          isActive
            ? 'bg-brand-500 text-white px-3.5 font-bold text-white-force'
            : 'text-zinc-500 hover:text-zinc-300 px-2.5'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {icon}
          {hasBadge && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-zinc-950" />
          )}
        </div>
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeMode, notifications, refreshNotifications } = useAppStore();
  const isArtisanPending = activeMode === 'artisan' && user?.kycStatus !== 'approved';

  const hasUnreadMessages = notifications.some(
    n => !n.read && (
      n.title.toLowerCase().includes('message') || 
      n.body.toLowerCase().includes('message') || 
      n.title.toLowerCase().includes('chat')
    )
  );

  const hasUnreadOther = notifications.some(
    n => !n.read && !(
      n.title.toLowerCase().includes('message') || 
      n.body.toLowerCase().includes('message') || 
      n.title.toLowerCase().includes('chat')
    )
  );

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 8000); // Polling simulation
    return () => clearInterval(interval);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/home')) return 'home';
    if (path.startsWith('/discover')) return 'discover';
    if (path.startsWith('/messages') || path.startsWith('/chat')) return 'messages';
    return 'me';
  };

  const currentTab = getActiveTab();

  if (!user) {
    return <div className="flex-1 flex flex-col bg-zinc-950 text-white">{children}</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white relative min-h-full">


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-10 pb-20 overflow-x-hidden animate-page-fade">
        {children}
      </main>

      {!isArtisanPending && (
        <nav
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 lg:absolute w-fit glass h-11 rounded-full flex flex-row items-center justify-center gap-0 shadow-2xl"
        >
          <TabButton
            isActive={currentTab === 'home'}
            onClick={() => handleNav('/')}
            icon={<Home size={18} color="currentColor" variant="Broken" />}
            label="Home"
          />
          <TabButton
            isActive={currentTab === 'discover'}
            onClick={() => handleNav('/discover')}
            icon={<SearchNormal1 size={18} color="currentColor" variant="Broken" />}
            label="Discover"
          />
          <TabButton
            isActive={currentTab === 'messages'}
            onClick={() => handleNav('/messages')}
            icon={<MessageText size={18} color="currentColor" variant="Broken" />}
            label="Messages"
            hasBadge={hasUnreadMessages}
          />
          <TabButton
            isActive={currentTab === 'me'}
            onClick={() => handleNav('/more')}
            icon={
              <div className="relative">
                <img 
                  src={user?.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=HustlePay"} 
                  className={`h-6 w-6 rounded-full object-cover transition-all ${
                    currentTab === 'me' ? 'ring-1 ring-white' : 'opacity-70 hover:opacity-100'
                  }`} 
                  alt="Me" 
                />
              </div>
            }
            label="Me"
            hasBadge={hasUnreadOther}
          />
        </nav>
      )}
    </div>
  );
};

export default AppLayout;

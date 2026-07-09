import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb } from '../services/mockDb';
import {
  Home, SearchNormal1, MessageText, NotificationBing, CloseCircle
} from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';
import { liquidGlass } from './liquidGlass';

// Standard layout

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className="focus:outline-none cursor-pointer h-full shrink-0"
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
        {icon}
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
  const { user, activeMode, unreadCount, refreshNotifications } = useAppStore();
  const isArtisanPending = activeMode === 'artisan' && user?.kycStatus !== 'approved';
  
  const [showNotifications, setShowNotifications] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 8000); // Polling simulation
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const instances: any[] = [];

    if (navRef.current) {
      instances.push(liquidGlass(navRef.current, {
        scale: -112,
        chroma: 6,
        border: 0.07,
        mapBlur: 12,
        blur: 3,
        saturate: 1.5,
        fallbackBlur: 16
      }));
    }

    if (headerRef.current) {
      instances.push(liquidGlass(headerRef.current, {
        scale: -112,
        chroma: 6,
        border: 0.07,
        mapBlur: 12,
        blur: 3,
        saturate: 1.5,
        fallbackBlur: 16
      }));
    }

    return () => {
      instances.forEach(ins => ins.destroy());
    };
  }, [user, isArtisanPending, location.pathname]);

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
      {/* Top Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 liquid-glass-header border-b border-zinc-800 lg:absolute"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
          <img src="/logo.png" className="h-8 w-auto" alt="HustlePay Logo" />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              mockDb.markNotificationsAsRead(user.id);
              refreshNotifications();
            }}
            className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors relative"
          >
            <NotificationBing size={20} color="currentColor" variant="Broken" className="text-zinc-200" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications Floating Panel */}
      {showNotifications && (
        <div className="absolute top-16 right-4 left-4 lg:right-6 lg:left-auto lg:w-80 z-50 glass rounded-2xl shadow-2xl p-4 border border-zinc-800 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-white">Notifications</span>
            <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-white">
              <CloseCircle size={16} color="currentColor" variant="Broken" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {mockDb.getNotifications(user.id).length === 0 ? (
              <span className="text-xs text-zinc-500 text-center py-4">No notifications</span>
            ) : (
              mockDb.getNotifications(user.id).map(notif => (
                <div key={notif.id} className={`p-2.5 rounded-xl border ${notif.read ? 'border-zinc-800/40 bg-zinc-900/30' : 'border-brand-500/20 bg-brand-500/5'} text-left`}>
                  <div className="font-semibold text-xs text-white mb-0.5">{notif.title}</div>
                  <div className="text-[11px] text-zinc-400">{notif.body}</div>
                  <div className="text-[9px] text-zinc-600 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-16 pb-20 overflow-x-hidden">
        {children}
      </main>

      {!isArtisanPending && (
        <div
          ref={navRef}
          role="navigation"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 lg:absolute w-fit liquid-glass-nav h-11 rounded-full p-0 flex flex-row flex-nowrap items-center justify-center gap-0 overflow-hidden"
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
          />
          <TabButton
            isActive={currentTab === 'me'}
            onClick={() => handleNav('/more')}
            icon={
              <img 
                src={user?.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=HustlePay"} 
                className={`h-6 w-6 rounded-full object-cover transition-all ${
                  currentTab === 'me' ? 'ring-1 ring-white' : 'opacity-70 hover:opacity-100'
                }`} 
                alt="Me" 
              />
            }
            label="Me"
          />
        </div>
      )}
    </div>
  );
};

export default AppLayout;

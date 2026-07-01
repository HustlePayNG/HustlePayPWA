import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb } from '../services/mockDb';
import { 
  Menu, Notification, Home, Card, Briefcase, Clock, 
  Setting, Logout, Danger, InfoCircle, 
  CloseCircle, ArrowRight2, Refresh
} from 'iconsax-react';
// Standard layout

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeMode, switchMode, logout, unreadCount, refreshNotifications } = useAppStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 8000); // Polling simulation
    return () => clearInterval(interval);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/home')) return 'home';
    if (path.startsWith('/payment') || path.startsWith('/wallet')) return 'payment';
    if (path.startsWith('/requests') || path.startsWith('/bookings')) return 'requests';
    if (path.startsWith('/history')) return 'history';
    return 'more';
  };

  const currentTab = getActiveTab();

  if (!user) {
    return <div className="flex-1 flex flex-col bg-zinc-950 text-white">{children}</div>;
  }

  // Check if artisan application is approved
  const isArtisanPending = activeMode === 'artisan' && user.kycStatus !== 'approved';

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white relative min-h-screen">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 glass border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} color="currentColor" variant="Broken" className="text-zinc-200" />
          </button>
          <span className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
            <span className="text-brand-400">Hustle</span>
            <span>Pay</span>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              {activeMode}
            </span>
          </span>
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
            <Notification size={20} color="currentColor" variant="Broken" className="text-zinc-200" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          
          <img 
            src={user.avatarUrl} 
            className="h-8 w-8 rounded-xl object-cover cursor-pointer border-2 border-brand-500/30"
            onClick={() => handleNav('/settings')} 
            alt=""
          />
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
      <main className="flex-1 flex flex-col pb-20 overflow-x-hidden">
        {children}
      </main>

      {/* Collapsible Sidebar (GEN-2) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={toggleSidebar}
          ></div>
          
          {/* Sidebar Drawer */}
          <div className="relative w-80 max-w-[85%] bg-zinc-950 border-r border-zinc-800 flex flex-col h-full z-50 animate-in slide-in-from-left duration-200">
            {/* Header info */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} className="h-10 w-10 rounded-xl object-cover border-2 border-brand-500/50" alt="" />
                <div className="text-left">
                  <div className="font-bold text-white text-sm truncate w-40">{user.fullName}</div>
                  <div className="text-xs text-zinc-400 capitalize">{activeMode} Profile</div>
                </div>
              </div>
              <button onClick={toggleSidebar} className="p-1 hover:bg-zinc-800 rounded-lg">
                <CloseCircle size={18} color="currentColor" variant="Broken" className="text-zinc-400" />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 text-left">
              <button 
                onClick={() => handleNav('/settings')} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-200 text-sm font-semibold"
              >
                <Setting size={18} color="currentColor" variant="Broken" className="text-zinc-400" />
                <span>Account Settings</span>
              </button>
              
              <button 
                onClick={() => handleNav('/wallet')} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-200 text-sm font-semibold"
              >
                <Card size={18} color="currentColor" variant="Broken" className="text-zinc-400" />
                <span>My Wallet</span>
              </button>

              <button 
                onClick={() => handleNav('/disputes')} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-200 text-sm font-semibold"
              >
                <Danger size={18} color="currentColor" variant="Broken" className="text-zinc-400" />
                <span>Disputes</span>
              </button>

              <button 
                onClick={() => handleNav('/help')} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-200 text-sm font-semibold"
              >
                <InfoCircle size={18} color="currentColor" variant="Broken" className="text-zinc-400" />
                <span>Help & Support</span>
              </button>

              <div className="h-px bg-zinc-800 my-2"></div>

              {/* Mode switching button (GEN-1) */}
              <button 
                onClick={() => {
                  switchMode();
                  setIsSidebarOpen(false);
                  navigate('/');
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-300 text-sm font-bold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Refresh size={18} color="currentColor" variant="Broken" className="animate-spin-slow" />
                  <span>Switch to {activeMode === 'seeker' ? 'Artisan' : 'Seeker'}</span>
                </div>
                <ArrowRight2 size={16} color="currentColor" variant="Broken" />
              </button>
            </div>

            {/* Logout at bottom */}
            <div className="p-4 border-t border-zinc-800 text-left">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-colors"
              >
                <Logout size={16} color="currentColor" variant="Broken" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {!isArtisanPending && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 lg:absolute glass border-t border-zinc-800 h-18 px-4 flex items-center justify-around">
          {activeMode === 'seeker' ? (
            // --- SEEKER TABS ---
            <>
              <button 
                onClick={() => handleNav('/')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'home' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Home size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">Home</span>
              </button>

              <button 
                onClick={() => handleNav('/wallet')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'payment' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Card size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">Payment</span>
              </button>

              <button 
                onClick={() => handleNav('/requests')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'requests' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Briefcase size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">Requests</span>
              </button>

              <button 
                onClick={toggleSidebar}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300`}
              >
                <Menu size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">More</span>
              </button>
            </>
          ) : (
            // --- ARTISAN TABS ---
            <>
              <button 
                onClick={() => handleNav('/')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'home' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Home size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">Home</span>
              </button>

              <button 
                onClick={() => handleNav('/bookings')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'requests' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Briefcase size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">Bookings</span>
              </button>

              <button 
                onClick={() => handleNav('/history')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentTab === 'history' ? 'text-brand-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Clock size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">History</span>
              </button>

              <button 
                onClick={toggleSidebar}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-zinc-500 hover:text-zinc-300`}
              >
                <Menu size={20} color="currentColor" variant="Broken" />
                <span className="text-[10px]">More</span>
              </button>
            </>
          )}
        </nav>
      )}
    </div>
  );
};

export default AppLayout;

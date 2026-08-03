import React from 'react';
import { SearchNormal1, Notification, HambergerMenu } from 'iconsax-react';
import { useAppStore } from '../../store';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          <HambergerMenu size={20} color="#0f172a" variant="Broken" />
        </button>

        {/* Global Admin Search */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 h-10 bg-slate-50 border border-slate-200 rounded-2xl w-72 focus-within:border-brand-500 transition-all">
          <SearchNormal1 size={15} color="#64748b" variant="Broken" className="shrink-0" />
          <input 
            type="text" 
            placeholder="Search users, bookings, dispute ref..."
            className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Environment Badge */}
        <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Production Live
        </span>

        {/* Notifications */}
        <button className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all cursor-pointer relative">
          <Notification size={18} color="#0f172a" variant="Broken" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img 
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'} 
            className="h-9 w-9 rounded-xl border border-slate-200 object-cover" 
            alt="Admin"
          />
          <div className="hidden sm:block text-left">
            <span className="font-black text-xs text-slate-900 block truncate">{user?.fullName || 'Super Admin'}</span>
            <span className="text-[9px] text-slate-500 font-extrabold block">Compliance Lead</span>
          </div>
        </div>

      </div>

    </header>
  );
};

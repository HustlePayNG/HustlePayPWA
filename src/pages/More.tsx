import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { 
  Setting, Card, Danger, InfoCircle, 
  Refresh, ArrowRight2, Logout
} from 'iconsax-react';

export const More: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeMode, switchMode, logout } = useAppStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchMode = () => {
    switchMode();
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      <h2 className="text-2xl font-extrabold text-white mb-2">More Options</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Manage your profile coordinates, switcher modes, wallet status, and active system disputes.
      </p>

      {/* User Info Card */}
      <div className="glass border-0 rounded-[28px] p-5 mb-5 bg-zinc-900/40 flex items-center gap-4">
        <img 
          src={user.avatarUrl} 
          className="h-14 w-14 rounded-2xl object-cover" 
          alt="Avatar" 
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate">{user.fullName}</h3>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          <div className="inline-block mt-2 text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
            {activeMode} Profile
          </div>
        </div>
      </div>

      {/* Menu Options Group */}
      <div className="glass border-0 rounded-[28px] p-4 bg-zinc-900/40 flex flex-col gap-1 mb-5">
        <button 
          onClick={() => navigate('/settings')} 
          className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl hover:bg-zinc-800/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Setting size={20} color="currentColor" variant="Broken" className="text-brand-400" />
            <span className="text-zinc-200 text-sm font-semibold">Account Settings</span>
          </div>
          <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-500" />
        </button>

        <button 
          onClick={() => navigate('/wallet')} 
          className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl hover:bg-zinc-800/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Card size={20} color="currentColor" variant="Broken" className="text-brand-400" />
            <span className="text-zinc-200 text-sm font-semibold">My Wallet</span>
          </div>
          <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-500" />
        </button>

        <button 
          onClick={() => navigate('/disputes')} 
          className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl hover:bg-zinc-800/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Danger size={20} color="currentColor" variant="Broken" className="text-brand-400" />
            <span className="text-zinc-200 text-sm font-semibold">Disputes</span>
          </div>
          <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-500" />
        </button>

        <button 
          onClick={() => navigate('/help')} 
          className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl hover:bg-zinc-800/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <InfoCircle size={20} color="currentColor" variant="Broken" className="text-brand-400" />
            <span className="text-zinc-200 text-sm font-semibold">Help & Support</span>
          </div>
          <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-500" />
        </button>
      </div>

      {/* Switch Mode Card */}
      <div className="glass border-0 rounded-[28px] p-5 mb-5 bg-zinc-900/40 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Access Switch</h4>
        <button 
          onClick={handleSwitchMode}
          className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-300 text-sm font-bold transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <Refresh size={18} color="currentColor" variant="Broken" className="animate-spin-slow" />
            <span>Switch to {activeMode === 'seeker' ? 'Artisan' : 'Seeker'} Mode</span>
          </div>
          <ArrowRight2 size={16} color="currentColor" variant="Broken" />
        </button>
      </div>

      {/* Logout Card */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-[24px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold transition-all"
      >
        <Logout size={20} color="currentColor" variant="Broken" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default More;

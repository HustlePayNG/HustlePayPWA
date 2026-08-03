import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Element3, 
  Verify, 
  ShieldSecurity, 
  CardSend, 
  People, 
  Bag2, 
  Gallery, 
  Logout
} from 'iconsax-react';
import { useAppStore } from '../../store';
import { toast } from '@heroui/react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();

  const navItems = [
    { label: 'Executive Overview', icon: Element3, path: '/backdoor' },
    { label: 'KYC Compliance Queue', icon: Verify, path: '/backdoor/kyc' },
    { label: 'Disputes & Escrow', icon: ShieldSecurity, path: '/backdoor/disputes' },
    { label: 'Financial Ledger', icon: CardSend, path: '/backdoor/ledger' },
    { label: 'User Directory', icon: People, path: '/backdoor/users' },
    { label: 'Marketplace Monitor', icon: Bag2, path: '/backdoor/marketplace' },
    { label: 'Content Moderation', icon: Gallery, path: '/backdoor/content' }
  ];

  const isActive = (path: string) => {
    if (path === '/backdoor') return location.pathname === '/backdoor' || location.pathname === '/backdoor/';
    return location.pathname.startsWith(path);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('hp_admin_auth');
    logout();
    toast.success('Logged out of Admin Portal');
    navigate('/login');
  };

  return (
    <aside className={`group md:w-20 hover:w-64 bg-[#0a182e] border-r border-blue-900/40 flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out z-30 ${isOpen ? 'w-64 block' : 'hidden md:flex'}`}>
      
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-start gap-3 border-b border-blue-900/50 shrink-0 overflow-hidden cursor-pointer" onClick={() => navigate('/backdoor')}>
        <img 
          src="/logo.png" 
          className="h-9 w-9 object-contain shrink-0 drop-shadow-md" 
          alt="HustlePay Logo" 
        />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-left">
          <h1 className="font-black text-base tracking-tight leading-none text-white !text-white" style={{ color: '#ffffff' }}>HustlePay</h1>
          <span className="text-[9px] font-black tracking-widest uppercase block mt-0.5" style={{ color: '#93c5fd' }}>Admin Ops Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto no-scrollbar">
        <div className="px-2 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-left">
          <span className="text-[9px] font-black uppercase tracking-widest block whitespace-nowrap" style={{ color: '#93c5fd' }}>Main Controls</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={item.label}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                active 
                  ? 'bg-brand-500 shadow-lg shadow-brand-500/30' 
                  : 'hover:bg-blue-900/50'
              }`}
              style={{ color: '#ffffff' }}
            >
              <div className="h-6 w-6 flex items-center justify-center shrink-0">
                <Icon size={22} color="#ffffff" variant="Broken" className="shrink-0" />
              </div>
              <span 
                className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-black whitespace-nowrap text-left text-white !text-white"
                style={{ color: '#ffffff' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Profile & Integrated Logout */}
      <div className="h-16 px-4 flex items-center border-t border-blue-900/50 bg-[#06101f] shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          
          {/* Admin Avatar */}
          <img 
            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'} 
            className="h-9 w-9 rounded-xl border border-blue-800 object-cover shrink-0" 
            alt="Admin Avatar"
            title={user?.fullName || 'Super Admin'}
          />

          {/* Admin Info (Revealed on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-left min-w-0 flex-1">
            <span className="font-black text-xs block truncate text-white !text-white" style={{ color: '#ffffff' }}>
              {user?.fullName || 'Super Admin'}
            </span>
            <span className="text-[9px] font-bold block truncate" style={{ color: '#93c5fd' }}>
              {user?.email || 'admin@hustlepay.com'}
            </span>
          </div>

          {/* Logout Button (Revealed on Hover) */}
          <button
            onClick={handleAdminLogout}
            title="Log out of Admin Portal"
            className="hidden group-hover:flex p-2 rounded-xl bg-blue-950 hover:bg-rose-500/20 text-rose-400 border border-blue-900/60 transition-all cursor-pointer shrink-0 items-center justify-center"
          >
            <Logout size={16} color="#f87171" variant="Broken" className="shrink-0" />
          </button>

        </div>
      </div>

    </aside>
  );
};

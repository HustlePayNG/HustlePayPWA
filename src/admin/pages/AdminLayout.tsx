import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { AdminLoginGate } from './AdminLoginGate';
import { useAppStore } from '../../store';

export const AdminLayout: React.FC = () => {
  const { user } = useAppStore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const sessionAuth = sessionStorage.getItem('hp_admin_auth') === 'true';
    const isUserAdmin = user?.email?.toLowerCase().includes('admin') || false;
    return sessionAuth || isUserAdmin;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('hp_admin_auth') === 'true';
    const isUserAdmin = user?.email?.toLowerCase().includes('admin') || false;
    if (sessionAuth || isUserAdmin) {
      setIsAdminAuthenticated(true);
    }
  }, [user]);

  if (!isAdminAuthenticated) {
    return <AdminLoginGate onSuccess={() => setIsAdminAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 text-left">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

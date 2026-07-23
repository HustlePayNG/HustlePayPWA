import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { 
  Setting, Card, Danger, InfoCircle, 
  Refresh, ArrowRight2, Logout, NotificationBing
} from 'iconsax-react';
import { Switch } from '../components/ui';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Spinner, toast, Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

export const More: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeMode, switchMode, logout, notifications } = useAppStore();
  const [checking, setChecking] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const hasWalletNotification = notifications.some(
    n => !n.read && (
      n.title.toLowerCase().includes('payment') || 
      n.title.toLowerCase().includes('withdrawal') || 
      n.body.toLowerCase().includes('pay') || 
      n.body.toLowerCase().includes('refund') || 
      n.body.toLowerCase().includes('wallet')
    )
  );

  const hasDisputeNotification = notifications.some(
    n => !n.read && (
      n.title.toLowerCase().includes('dispute') || 
      n.body.toLowerCase().includes('dispute')
    )
  );

  const {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    permission,
    requestPermission
  } = usePushNotifications();

  const handleTogglePush = async () => {
    if (isLoading) return;
    
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission === 'default') {
        const perm = await requestPermission();
        if (perm === 'granted') {
          await subscribe();
        }
      } else {
        await subscribe();
      }
    }
  };

  if (!user) return null;

  const handleCheckForUpdates = () => {
    setChecking(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.update();
        })
        .then((registration) => {
          setChecking(false);
          if (registration?.waiting || registration?.installing) {
            toast.info('Update found! Downloading and updating...');
          } else {
            toast.success('HustlePay is up to date!', {
              description: 'You are using the latest version.'
            });
          }
        })
        .catch((err) => {
          setChecking(false);
          console.error('Update check failed:', err);
          toast.warning('Could not check for updates. Try again later.');
        });
    } else {
      setTimeout(() => {
        setChecking(false);
        toast.success('HustlePay is up to date!', {
          description: 'You are using the latest version.'
        });
      }, 800);
    }
  };

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
      {/* User Info Details Card */}
      <div className="glass border-none rounded-[28px] p-6 mb-5 flex flex-col items-center text-center">
        <img 
          src={user.avatarUrl} 
          className="h-20 w-20 rounded-full object-cover border-2 border-zinc-100 shadow-sm mb-3.5" 
          alt="Avatar" 
        />
        <h3 className="font-extrabold text-zinc-900 text-lg">{user.fullName}</h3>
        
        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-zinc-400 font-bold">
          <button 
            onClick={handleSwitchMode}
            className="text-brand-600 hover:text-brand-700 font-extrabold uppercase tracking-wider cursor-pointer transition-colors border-none bg-transparent p-0 outline-none"
            title="Click to switch profiles"
          >
            {activeMode === 'seeker' ? 'Service Seeker' : 'Professional Artisan'}
          </button>
          <span>•</span>
          <span>Lagos</span>
        </div>
      </div>

      {/* Menu Options Group 1 */}
      <div className="glass border-none rounded-[28px] overflow-hidden mb-5">
        <div className="flex flex-col">
          <button 
            onClick={() => navigate('/settings')} 
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Setting size={18} color="currentColor" variant="Broken" className="text-brand-500" />
              <span className="text-zinc-900 text-xs font-extrabold">Account Settings</span>
            </div>
            <ArrowRight2 size={14} color="currentColor" variant="Broken" className="text-zinc-400" />
          </button>

          <div className="mx-4 h-px bg-zinc-100" />

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between w-full p-4 transition-colors text-left">
            <div className="flex items-center gap-3.5">
              <NotificationBing size={18} color="currentColor" variant="Broken" className="text-brand-500" />
              <span className="text-zinc-900 text-xs font-extrabold">Push Notifications</span>
            </div>
            <Switch
              checked={isSubscribed}
              onValueChange={handleTogglePush}
              isDisabled={isLoading}
            />
          </div>

          <div className="mx-4 h-px bg-zinc-100" />

          <button 
            onClick={() => navigate('/wallet')} 
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center">
                  <Card size={18} color="currentColor" variant="Broken" className="text-brand-500" />
                  {hasWalletNotification && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                  )}
                </div>
                <span className="text-zinc-900 text-xs font-extrabold">My Wallet</span>
              </div>
              <ArrowRight2 size={14} color="currentColor" variant="Broken" className="text-zinc-400" />
            </div>
          </button>

          <div className="mx-4 h-px bg-zinc-100" />

          <button 
            onClick={() => navigate('/disputes')} 
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center">
                  <Danger size={18} color="currentColor" variant="Broken" className="text-brand-500" />
                  {hasDisputeNotification && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                  )}
                </div>
                <span className="text-zinc-900 text-xs font-extrabold">Disputes</span>
              </div>
              <ArrowRight2 size={14} color="currentColor" variant="Broken" className="text-zinc-400" />
            </div>
          </button>

          <div className="mx-4 h-px bg-zinc-100" />

          <button 
            onClick={() => navigate('/help')} 
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <InfoCircle size={18} color="currentColor" variant="Broken" className="text-brand-500" />
              <span className="text-zinc-900 text-xs font-extrabold">Help & Support</span>
            </div>
            <ArrowRight2 size={14} color="currentColor" variant="Broken" className="text-zinc-400" />
          </button>
        </div>
      </div>


      {/* Menu Options Group 2 */}
      <div className="glass border-none rounded-[28px] overflow-hidden">
        <div className="flex flex-col">
          <button 
            onClick={handleCheckForUpdates} 
            disabled={checking}
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left disabled:opacity-80 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Refresh size={18} color="currentColor" variant="Broken" className={`text-brand-500 ${checking ? 'animate-spin' : ''}`} />
              <span className="text-zinc-900 text-xs font-extrabold">Check for Updates</span>
            </div>
            {checking ? (
              <Spinner size="sm" color="current" className="text-brand-500 mr-1" />
            ) : (
              <span className="text-[9px] text-brand-600 bg-brand-50 border border-brand-100/50 px-2 py-0.5 rounded-md mr-1 font-bold">v1.3.0</span>
            )}
          </button>

          <div className="mx-4 h-px bg-zinc-100" />

          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-between w-full p-4 hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Logout size={18} color="currentColor" variant="Broken" className="text-red-500" />
              <span className="text-zinc-900 text-xs font-extrabold">Log Out</span>
            </div>
            <ArrowRight2 size={14} color="currentColor" variant="Broken" className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* HeroUI Logout Confirmation Modal */}
      <Modal isOpen={showLogoutConfirm} onOpenChange={(open) => { if (!open) setShowLogoutConfirm(false); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="glass border border-zinc-200 max-w-sm w-full rounded-[28px] p-6 text-zinc-900 bg-white/95">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-left">
                <span className="font-extrabold text-sm text-zinc-900">Confirm Log Out</span>
              </ModalHeader>
              <ModalBody className="text-xs text-zinc-500 mt-2 leading-relaxed text-left">
                Are you sure you want to log out of your HustlePay account? You will need to sign in again to access bookings.
              </ModalBody>
              <ModalFooter className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-9 border border-zinc-200 rounded-xl hover:bg-zinc-55 text-zinc-600 text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
                >
                  Log Out
                </button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>
    </div>
  );
};

export default More;

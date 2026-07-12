import React, { useState, useEffect } from 'react';
import { CloseCircle, ExportCurve, AddCircle } from 'iconsax-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // 1. Check if already installed/standalone
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Check dismissal cooldown
    const dismissed = localStorage.getItem('hp_install_prompt_dismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed, 10);
      const now = Date.now();
      // Wait 3 days before showing again
      if (now - dismissTime < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios/.test(userAgent) && !/fxios/.test(userAgent);
    
    if (isApple && isSafari) {
      setIsIOS(true);
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 6000);
      return () => clearTimeout(timer);
    }

    // 4. Capture native prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install Choice: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('hp_install_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col gap-2">
      {/* Mini banner */}
      <div className="bg-white/95 border border-zinc-150 rounded-[20px] p-3 shadow-lg flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center min-w-0">
          {/* App Icon */}
          <img 
            src="/pwa-192x192.png" 
            className="h-8 w-8 rounded-xl object-contain shrink-0 shadow-sm" 
            alt="HustlePay logo" 
          />
          <span className="text-xs font-extrabold text-zinc-900 ml-2.5 truncate">
            Install HustlePay
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={isIOS ? () => setShowIOSSteps(!showIOSSteps) : handleInstallClick}
            className="h-7 px-3 rounded-lg text-white text-[10px] font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center bg-brand-500 hover:bg-brand-600"
          >
            <span className="text-white text-white-force font-bold">Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-zinc-650 transition-colors p-1 flex items-center justify-center cursor-pointer"
          >
            <CloseCircle size={18} variant="Broken" color="currentColor" />
          </button>
        </div>
      </div>
      
      {/* iOS Steps Popover (Only visible when iOS user clicks Install) */}
      {isIOS && showIOSSteps && (
        <div className="bg-white/95 border border-zinc-150 rounded-2xl p-4 shadow-lg text-left text-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-2.5">Instructions for iPhone:</h4>
          <div className="flex flex-col gap-2.5 text-[11px] text-zinc-650">
            <div className="flex items-start gap-2.5">
              <span className="h-4.5 w-4.5 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center font-bold text-[9px] text-zinc-600 shrink-0 mt-0.5">1</span>
              <p className="leading-relaxed text-left text-zinc-650">Tap the share icon <ExportCurve size={13} variant="Broken" color="currentColor" className="inline-block text-indigo-500 mx-0.5 align-middle" /> in Safari's toolbar</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="h-4.5 w-4.5 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center font-bold text-[9px] text-zinc-600 shrink-0 mt-0.5">2</span>
              <p className="leading-relaxed text-left text-zinc-650">Choose <span className="font-extrabold text-zinc-900">Add to Home Screen</span> <AddCircle size={13} variant="Broken" color="currentColor" className="inline-block text-indigo-500 mx-0.5 align-middle" /></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallPWA;

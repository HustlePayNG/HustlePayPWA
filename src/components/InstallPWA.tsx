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
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass border border-zinc-800/80 rounded-3xl p-5 shadow-2xl relative text-left">
        
        {/* Close Button */}
        <button 
          onClick={handleDismiss} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <CloseCircle size={18} variant="Broken" />
        </button>

        {isIOS ? (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-6 w-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <span className="text-xs">📱</span>
              </div>
              <span className="text-[11px] font-bold tracking-wider text-brand-400 uppercase">
                Install PWA App
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mb-2">Add HustlePay to Home Screen</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Install the app directly on your iPhone for offline capabilities, push alerts, and true native fullscreen startup.
            </p>
            <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 bg-zinc-850 rounded-full flex items-center justify-center font-bold text-[10px] text-brand-300 shrink-0">1</span>
                <p>Tap the share icon <ExportCurve size={14} className="inline-block text-brand-400 mx-0.5" /> on Safari's toolbar</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 bg-zinc-850 rounded-full flex items-center justify-center font-bold text-[10px] text-brand-300 shrink-0">2</span>
                <p>Choose <span className="font-bold text-white">Add to Home Screen</span> <AddCircle size={14} className="inline-block text-brand-400 mx-0.5" /></p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-6 w-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <span className="text-xs">⚡</span>
              </div>
              <span className="text-[11px] font-bold tracking-wider text-brand-400 uppercase">
                PWA Application
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white mb-1.5">Install HustlePay on your device</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Download the application on your smartphone to get rapid access and premium app launch speeds.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs active:scale-98 transition-all"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 h-10 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white font-semibold text-xs active:scale-98 transition-all"
              >
                Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;

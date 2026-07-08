import React, { useState, useEffect } from 'react';
import DesktopBlocker from './DesktopBlocker';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  if (isDesktop) {
    return <DesktopBlocker />;
  }

  return (
    <div className="min-h-screen w-full lg:flex lg:items-center lg:justify-center lg:bg-zinc-50 lg:bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#cbd5e1_100%)] lg:p-6">
      {/* Desktop Helper Sidebar Description */}
      <div className="hidden lg:flex flex-col justify-center max-w-sm mr-12 text-left text-zinc-550 select-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-3 w-3 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-widest text-brand-400 font-bold">HustlePay PWA Preview</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Two-Sided Service Marketplace
        </h1>
        <p className="text-sm mb-6 leading-relaxed">
          This preview uses a simulated `localStorage` database. Open this URL on your mobile phone or install it as a PWA for the full native-like experience.
        </p>
        <div className="glass p-4 rounded-2xl flex flex-col gap-3 text-xs border-zinc-800">
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-300">Default Seeker:</span>
            <code>user@hustlepay.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-300">Default Artisan:</span>
            <code>artisan@hustlepay.com</code>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-300">Default Password:</span>
            <span>Any password works</span>
          </div>
        </div>
      </div>

      {/* Main Mockup Phone Frame */}
      <div className="w-full min-h-screen bg-zinc-950 flex flex-col relative lg:w-[410px] lg:h-[860px] lg:min-h-[860px] lg:max-h-[860px] lg:rounded-[48px] lg:border-[10px] lg:border-zinc-300 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] lg:overflow-hidden">
        {/* Smartphone Camera Notch / Dynamic Island */}
        <div className="hidden lg:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 rounded-full z-50 border border-zinc-200/30 flex items-center justify-between px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-200"></span>
          <span className="h-1 w-8 rounded-full bg-zinc-300/60"></span>
          <span className="h-2 w-2 rounded-full bg-blue-500/50"></span>
        </div>

        {/* Smartphone Bottom Speaker Bar */}
        <div className="hidden lg:block absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-1 bg-zinc-300/80 rounded-full z-50"></div>

        {/* PWA App Content Container */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full h-full lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};
export default MobileFrame;

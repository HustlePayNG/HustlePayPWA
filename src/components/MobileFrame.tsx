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
    <div className="w-full min-h-screen bg-zinc-955 flex flex-col overflow-x-hidden">
      {children}
    </div>
  );
};

export default MobileFrame;

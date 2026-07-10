import React from 'react';
import { Spinner } from '@heroui/react';

export const AppSplash: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-zinc-950 min-h-screen text-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Brand Logo */}
        <div className="relative h-48 w-48 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl animate-pulse"></div>
          <img
            src="/real logo.svg"
            className="h-44 w-44 object-contain relative z-10 animate-bounce-slow"
            alt="HustlePay Logo"
          />
        </div>

        {/* Spinner from HeroUI */}
        <div className="mt-12">
          <Spinner size="lg" color="current" style={{ color: '#33658a' }} />
        </div>
      </div>
    </div>
  );
};

export default AppSplash;

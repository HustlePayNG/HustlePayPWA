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
            src="/logo.png"
            className="h-44 w-44 object-contain relative z-10 animate-bounce-slow"
            alt="HustlePay Logo"
          />
        </div>

        {/* Tagline */}
        <h2 className="text-xl font-extrabold text-white tracking-wide">
          <span className="text-brand-400">Hustle</span>Pay
        </h2>
        <p className="text-sm text-zinc-400 font-light tracking-widest uppercase -mt-2">
          Your service marketplace
        </p>

        {/* Spinner from HeroUI */}
        <div className="mt-12">
          <Spinner size="lg" />
        </div>
      </div>
    </div>
  );
};

export default AppSplash;

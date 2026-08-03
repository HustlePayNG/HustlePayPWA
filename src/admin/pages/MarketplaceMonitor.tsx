import React from 'react';
import { Bag2 } from 'iconsax-react';

export const MarketplaceMonitor: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-in fade-in">
      <div>
        <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest block">Job Postings Supervision</span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Marketplace Job Monitor</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-850 rounded-[28px] p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-3">
        <Bag2 size={36} className="text-brand-400 mb-1" color="currentColor" variant="Broken" />
        <h3 className="font-extrabold text-white text-sm">Marketplace Supervision Active</h3>
        <p className="text-zinc-400 font-light max-w-sm">
          All client job postings and artisan proposals are continuously monitored for escrow compliance and safety.
        </p>
      </div>
    </div>
  );
};

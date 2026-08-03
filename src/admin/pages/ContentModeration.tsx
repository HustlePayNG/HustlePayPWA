import React from 'react';
import { Gallery } from 'iconsax-react';

export const ContentModeration: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-in fade-in">
      <div>
        <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest block">Feed Supervision</span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Content & Media Moderation</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-850 rounded-[28px] p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-3">
        <Gallery size={36} className="text-brand-400 mb-1" color="currentColor" variant="Broken" />
        <h3 className="font-extrabold text-white text-sm">Media Feed Clean & Monitored</h3>
        <p className="text-zinc-400 font-light max-w-sm">
          All artisan showcase images uploaded to the post-media storage bucket pass through content moderation checks.
        </p>
      </div>
    </div>
  );
};

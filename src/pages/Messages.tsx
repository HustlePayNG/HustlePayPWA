import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Booking } from '../services/mockDb';
import { MessageText, ArrowRight2 } from 'iconsax-react';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeMode } = useAppStore();
  const [chatThreads, setChatThreads] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      // Get all bookings for the current user and active mode
      const list = mockDb.getBookings(user.id, activeMode);
      // Sort bookings by creation date descending to show newest first
      const sorted = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setChatThreads(sorted);
    }
  }, [user, activeMode]);

  if (!user) return null;

  const getLastMessage = (bookingId: string) => {
    const msgs = mockDb.getMessages(bookingId);
    if (msgs.length > 0) {
      return msgs[msgs.length - 1].body;
    }
    return 'Tap to open chat thread';
  };

  const getOtherPartyDetails = (booking: Booking) => {
    const isSeeker = user.id === booking.seekerId;
    const name = isSeeker ? booking.artisanName : booking.seekerName;
    const avatar = isSeeker 
      ? booking.artisanAvatar 
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${booking.seekerName}`;
    return { name, avatar };
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      <div className="flex-1 flex flex-col">
        {chatThreads.length === 0 ? (
          <div className="glass border border-zinc-200 rounded-[28px] p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-3 bg-white/70">
            <MessageText size={32} color="#33658a" variant="Broken" className="text-brand-500" />
            <span>No message threads yet. Book an artisan or receive a job request to start chatting.</span>
          </div>
        ) : (
          <div className="glass border border-zinc-850 rounded-[28px] overflow-hidden">
            <div className="flex flex-col">
              {chatThreads.map((bk, idx) => {
                const { name, avatar } = getOtherPartyDetails(bk);
                const lastMsg = getLastMessage(bk.id);

                return (
                  <div key={bk.id} className="flex flex-col">
                    <div 
                      className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors"
                      onClick={() => navigate(`/chat/${bk.id}`)}
                    >
                      <img 
                        src={avatar} 
                        className="h-12 w-12 rounded-2xl object-cover shrink-0 border border-zinc-200 shadow-sm" 
                        alt="" 
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-sm text-zinc-900 truncate">{name}</h4>
                          <span className="text-[8px] border border-zinc-100 bg-zinc-50/50 text-zinc-500 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold shrink-0">
                            {bk.reference}
                          </span>
                        </div>
                        
                        <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-wider block mt-0.5">
                          {bk.serviceName}
                        </span>

                        <p className="text-xs text-zinc-500 truncate mt-1 leading-relaxed font-light">
                          {lastMsg}
                        </p>
                      </div>

                      <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-brand-500/70 shrink-0" />
                    </div>

                    {/* Separator line - not touching the edges */}
                    {idx < chatThreads.length - 1 && (
                      <div className="mx-4 h-px bg-zinc-100" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

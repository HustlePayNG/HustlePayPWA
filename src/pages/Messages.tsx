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
      <div className="mb-6">
        <span className="text-xs text-brand-400 uppercase tracking-widest font-bold flex items-center gap-1">
          <MessageText size={12} color="currentColor" variant="Broken" /> Chat Center
        </span>
        <h2 className="text-2xl font-extrabold text-white mt-0.5">My Messages</h2>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {chatThreads.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-3">
            <MessageText size={32} color="currentColor" variant="Broken" className="text-zinc-600" />
            <span>No message threads yet. Book an artisan or receive a job request to start chatting.</span>
          </div>
        ) : (
          chatThreads.map(bk => {
            const { name, avatar } = getOtherPartyDetails(bk);
            const lastMsg = getLastMessage(bk.id);

            return (
              <div 
                key={bk.id}
                className="glass border border-zinc-850 hover:border-zinc-750 transition-all rounded-[28px] cursor-pointer p-4 flex flex-row items-center gap-4"
                onClick={() => navigate(`/chat/${bk.id}`)}
              >
                <img 
                  src={avatar} 
                  className="h-12 w-12 rounded-2xl object-cover shrink-0" 
                  alt="" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-sm text-white truncate">{name}</h4>
                    <span className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold shrink-0">
                      {bk.reference}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-brand-300 font-semibold block truncate mt-0.5">
                    {bk.serviceName}
                  </span>

                  <p className="text-xs text-zinc-400 truncate mt-1 leading-relaxed font-light">
                    {lastMsg}
                  </p>
                </div>

                <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Messages;

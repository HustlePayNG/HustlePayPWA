import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import type { Booking } from '../types';
import { supabaseDb } from '../services/supabaseDb';
import { MessageText, ArrowRight2, SearchNormal1, CloseCircle, SecuritySafe } from 'iconsax-react';
import { Spinner } from '@heroui/react';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeMode, refreshNotifications } = useAppStore();
  
  const [chatThreads, setChatThreads] = useState<{ booking: Booking; lastMsg: string; lastTime: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      loadThreads();
    }
  }, [user, activeMode, refreshNotifications]);

  const loadThreads = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let bookingsToUse: Booking[] = [];
      const isArtisan = activeMode === 'artisan';
      const supaBookings = await supabaseDb.getBookings(user.id, isArtisan);
      
      if (supaBookings) {
        bookingsToUse = supaBookings.map((b: any) => ({
          id: b.id,
          seekerId: b.seeker_id,
          artisanId: b.artisan_id,
          seekerName: b.seeker_name || 'Seeker',
          artisanName: b.artisan_name || 'Artisan',
          artisanCategory: b.artisan_category || 'Service',
          serviceDescription: b.service_name || b.service_description || 'Service',
          address: b.address || { formattedAddress: 'Lagos', latitude: 6.5, longitude: 3.3 },
          scheduledDate: b.scheduled_date || '',
          scheduledTime: b.scheduled_time || '',
          calloutFeePaid: b.callout_fee || 0,
          status: b.status as Booking['status'],
          createdAt: b.created_at
        }));
      }

      // Fetch last message for each thread
      const threadsWithLastMsg = await Promise.all(
        bookingsToUse.map(async (bk) => {
          let lastMsg = 'Tap to open chat thread';
          let lastTime = bk.createdAt;

          try {
            const msgs = await supabaseDb.getMessages(bk.id);
            if (msgs && msgs.length > 0) {
              const last = msgs[msgs.length - 1];
              lastMsg = last.body || (last as any).text || 'Attachment/Message';
              lastTime = last.created_at;
            }
          } catch (err) {
            console.warn('Get messages note:', err);
          }

          return { booking: bk, lastMsg, lastTime };
        })
      );

      // Sort by newest activity descending
      threadsWithLastMsg.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      setChatThreads(threadsWithLastMsg);
    } catch (err) {
      console.error('loadThreads error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getOtherPartyDetails = (booking: Booking) => {
    const isSeeker = user.id === booking.seekerId;
    const name = isSeeker ? booking.artisanName : booking.seekerName;
    const avatar = isSeeker 
      ? booking.artisanAvatar 
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${booking.seekerName}`;
    return { name, avatar };
  };

  const filteredThreads = chatThreads.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const { name } = getOtherPartyDetails(t.booking);
    return (
      name.toLowerCase().includes(q) ||
      t.booking.reference.toLowerCase().includes(q) ||
      t.booking.serviceName.toLowerCase().includes(q) ||
      t.lastMsg.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-24 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest block">Direct Messaging</span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Messages</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-[10px] text-zinc-400 font-bold">
          <SecuritySafe size={13} className="text-brand-400 shrink-0" color="currentColor" variant="Broken" />
          <span>Escrow Protected</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2.5 px-3.5 h-11 bg-zinc-900 border border-zinc-850 rounded-2xl focus-within:border-brand-500 transition-all mb-4">
        <SearchNormal1 size={15} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
        <input
          type="text"
          placeholder="Search conversation threads..."
          className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <CloseCircle size={14} color="currentColor" variant="Broken" />
          </button>
        )}
      </div>

      {/* Threads List */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="glass border border-zinc-850 rounded-[28px] p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span>Loading active message threads...</span>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="glass border border-zinc-850 rounded-[28px] p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <MessageText size={32} color="currentColor" variant="Broken" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">No Message Threads Yet</p>
              <p className="text-zinc-500 font-light text-[11px] mt-1 max-w-xs">
                When you book an artisan or accept a job request, your live escrow chat thread will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass border border-zinc-850 rounded-[28px] overflow-hidden">
            <div className="flex flex-col">
              {filteredThreads.map(({ booking: bk, lastMsg, lastTime }, idx) => {
                const { name, avatar } = getOtherPartyDetails(bk);

                return (
                  <div key={bk.id} className="flex flex-col">
                    <div 
                      className="p-4 flex flex-row items-center gap-3.5 cursor-pointer hover:bg-zinc-900/60 active:bg-zinc-900 transition-all"
                      onClick={() => navigate(`/chat/${bk.id}`)}
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={avatar} 
                          className="h-12 w-12 rounded-2xl object-cover border border-zinc-800 bg-zinc-900" 
                          alt={name} 
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-sm text-white truncate">{name}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold truncate">
                            {bk.serviceName}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {bk.reference}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 truncate mt-1 leading-relaxed font-light">
                          {lastMsg}
                        </p>
                      </div>

                      <ArrowRight2 size={16} color="currentColor" variant="Broken" className="text-zinc-600 shrink-0" />
                    </div>

                    {idx < filteredThreads.length - 1 && (
                      <div className="mx-4 h-px bg-zinc-850/60" />
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

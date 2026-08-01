import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Message, type Booking } from '../services/mockDb';
import { supabaseDb } from '../services/supabaseDb';
import { ArrowLeft, Send2, MessageText, SecuritySafe, TickCircle } from 'iconsax-react';
import { Spinner } from '@heroui/react';

export const Chat: React.FC = () => {
  const bookingId = useParams<{ bookingId: string }>().bookingId;
  const navigate = useNavigate();
  const { user, refreshNotifications } = useAppStore();

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bookingId && user) {
      // Clear message notifications
      mockDb.markNotificationsByKeywordsAsRead(user.id, ['message', 'chat']);
      refreshNotifications();

      loadBookingAndMessages();
    }
  }, [bookingId, user]);

  // Realtime Supabase WebSockets Subscription
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = supabaseDb.subscribeToMessages(bookingId, (rawMsg) => {
      const newMsg: Message = {
        id: rawMsg.id,
        bookingId: rawMsg.booking_id,
        senderId: rawMsg.sender_id,
        body: rawMsg.body,
        createdAt: rawMsg.created_at
      };

      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadBookingAndMessages = async () => {
    if (!bookingId || !user) return;
    setLoading(true);

    try {
      const isArtisan = user.activeModePreference === 'artisan';
      const supaBookings = await supabaseDb.getBookings(user.id, isArtisan);
      const matchedB = supaBookings.find(b => b.id === bookingId);

      if (matchedB) {
        const mappedBooking: Booking = {
          id: matchedB.id,
          reference: matchedB.reference,
          seekerId: matchedB.seeker_id,
          artisanId: matchedB.artisan_id,
          artisanName: matchedB.service_name,
          artisanAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Artisan',
          seekerName: 'Client',
          seekerPhone: '',
          serviceName: matchedB.service_name,
          description: matchedB.description || '',
          photos: [],
          scheduledStartAt: matchedB.created_at,
          address: matchedB.address || '',
          calloutFee: matchedB.callout_fee,
          estimatedAmount: matchedB.estimated_amount,
          status: matchedB.status as Booking['status'],
          createdAt: matchedB.created_at,
          updatedAt: matchedB.updated_at || matchedB.created_at
        };
        setBooking(mappedBooking);
      } else {
        setBooking(mockDb.getBookingById(bookingId));
      }

      // Load messages
      const supaMsgs = await supabaseDb.getMessages(bookingId);
      if (supaMsgs && supaMsgs.length > 0) {
        const mappedMsgs: Message[] = supaMsgs.map(m => ({
          id: m.id,
          bookingId: m.booking_id,
          senderId: m.sender_id,
          body: m.body,
          createdAt: m.created_at
        }));
        setMessages(mappedMsgs);
      } else {
        setMessages(mockDb.getMessages(bookingId));
      }
    } catch (err) {
      setBooking(mockDb.getBookingById(bookingId));
      setMessages(mockDb.getMessages(bookingId));
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user || loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-zinc-955 text-zinc-400 text-xs min-h-screen">
        <Spinner size="lg" />
        <span className="mt-3 font-semibold">Connecting live chat thread...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-zinc-955 text-zinc-400 text-xs min-h-screen p-6 text-center">
        <MessageText size={40} className="text-zinc-600 mb-2" color="currentColor" variant="Broken" />
        <h3 className="text-base font-extrabold text-white">Conversation Not Found</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">This chat thread does not exist or has been archived.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-brand-500 text-white font-extrabold rounded-xl text-xs"
        >
          Return Back
        </button>
      </div>
    );
  }

  const otherPartyName = user.id === booking.seekerId ? booking.artisanName : booking.seekerName;
  const otherPartyAvatar = user.id === booking.seekerId 
    ? booking.artisanAvatar 
    : `https://api.dicebear.com/7.x/adventurer/svg?seed=${booking.seekerName}`;
  const targetId = user.id === booking.seekerId ? booking.artisanId : booking.seekerId;

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || !bookingId || !user) return;

    setInputVal('');
    setSending(true);

    try {
      await supabaseDb.sendMessage(bookingId, user.id, text, targetId);
    } catch (err) {
      console.warn('Supabase Realtime Send Fallback:', err);
      mockDb.sendMessage(bookingId, user.id, text);
      setMessages(mockDb.getMessages(bookingId));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-955 text-left h-screen relative overflow-hidden">
      
      {/* Top Glass Contact Bar */}
      <div className="flex items-center gap-3 px-4 h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-850/80 shrink-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={18} color="currentColor" variant="Broken" />
        </button>

        <div className="relative">
          <img src={otherPartyAvatar} className="h-9 w-9 rounded-xl border border-zinc-800 object-cover shrink-0" alt={otherPartyName} />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-white block truncate">{otherPartyName}</span>
            <SecuritySafe size={12} className="text-brand-400 shrink-0" color="currentColor" variant="Broken" />
          </div>
          <span className="text-[9px] text-brand-300 font-extrabold block uppercase tracking-wider">
            Ref: {booking.reference} • {booking.serviceName}
          </span>
        </div>
      </div>

      {/* Messages Scrollbox */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 pb-24">
        <div className="flex justify-center my-2">
          <span className="text-[9px] text-zinc-500 bg-zinc-900/80 border border-zinc-850 px-3 py-1 rounded-full font-mono uppercase tracking-widest">
            🔒 End-to-End Escrow Protected Chat
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3">
              <MessageText size={30} color="currentColor" variant="Broken" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Start the Conversation</h4>
            <p className="text-xs text-zinc-500 font-light mt-1 max-w-xs">
              Discuss service details, address instructions, or arrival timelines with <span className="text-zinc-300 font-bold">{otherPartyName}</span>.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div 
                key={msg.id} 
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isMe 
                    ? 'self-end bg-brand-500 text-white rounded-tr-none shadow-md shadow-brand-500/15' 
                    : 'self-start bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.body}</div>
                <div className={`text-[8px] mt-1.5 flex items-center justify-end gap-1 ${isMe ? 'text-brand-200' : 'text-zinc-500'}`}>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <TickCircle size={10} color="currentColor" variant="Broken" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-850 flex gap-2 items-center z-20">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2 border border-zinc-800 rounded-2xl bg-zinc-955 focus-within:border-brand-500 transition-colors">
          <input
            placeholder={`Message ${otherPartyName}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-zinc-600 h-8 min-h-8"
          />
        </div>
        <button
          className="bg-brand-500 hover:bg-brand-600 h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-md shadow-brand-500/20 disabled:opacity-50"
          onClick={handleSend}
          disabled={sending || !inputVal.trim()}
        >
          {sending ? <Spinner size="sm" /> : <Send2 size={16} color="currentColor" variant="Broken" />}
        </button>
      </div>

    </div>
  );
};

export default Chat;

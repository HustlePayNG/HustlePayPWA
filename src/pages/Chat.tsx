import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Message, type Booking } from '../services/mockDb';
import { ArrowLeft, Send2 } from 'iconsax-react';

export const Chat: React.FC = () => {
  const bookingId = useParams<{ bookingId: string }>().bookingId;
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bookingId) {
      const bk = mockDb.getBookingById(bookingId);
      setBooking(bk);
      loadMessages();
    }
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    if (bookingId) {
      setMessages(mockDb.getMessages(bookingId));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user || !booking) {
    return (
      <div className="flex-1 flex justify-center items-center bg-zinc-950 text-zinc-500 text-xs">
        Loading Chat thread...
      </div>
    );
  }

  const otherPartyName = user.id === booking.seekerId ? booking.artisanName : booking.seekerName;
  const otherPartyAvatar = user.id === booking.seekerId ? booking.artisanAvatar : `https://api.dicebear.com/7.x/adventurer/svg?seed=${booking.seekerName}`;

  const handleSend = () => {
    if (!inputVal.trim() || !bookingId) return;

    mockDb.sendMessage(bookingId, user.id, inputVal.trim());
    setInputVal('');
    loadMessages();

    setTimeout(() => {
      const mockReplies = [
        "Sounds good! I'll see you shortly.",
        "Understood. Let me know if there are any specific tools needed.",
        "Perfect. I am en route to your address now.",
        "Sure, let me check that for you once I arrive."
      ];
      const randReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
      
      const targetId = user.id === booking.seekerId ? booking.artisanId : booking.seekerId;
      mockDb.sendMessage(bookingId, targetId, randReply);
      mockDb.createNotification(user.id, 'New Message Received', `${otherPartyName}: "${randReply}"`);
      loadMessages();
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-left h-screen relative">
      
      {/* Top Contact Bar */}
      <div className="flex items-center gap-3 px-4 h-16 glass border-b border-zinc-850 shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} color="currentColor" variant="Broken" />
        </button>
        <img src={otherPartyAvatar} className="h-8 w-8 rounded-xl border border-zinc-800 object-cover shrink-0" alt="" />
        <div className="flex-1 min-w-0">
          <span className="font-bold text-xs text-white block truncate">{otherPartyName}</span>
          <span className="text-[9px] text-brand-300 font-bold block">Active Thread (Ref: {booking.reference})</span>
        </div>
      </div>

      {/* Messages Scrollbox */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 pb-20">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-650 text-xs py-8 font-light italic">
            Start chatting with {otherPartyName} about the booking.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div 
                key={msg.id} 
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'self-end bg-brand-500 text-white rounded-tr-none' : 'self-start bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'}`}
              >
                <div>{msg.body}</div>
                <div className={`text-[8px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-zinc-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 glass border-t border-zinc-850 flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2 border border-zinc-800 rounded-xl bg-zinc-950 focus-within:border-brand-500 transition-colors">
          <input
            placeholder={`Message ${otherPartyName}...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-zinc-600 h-7 min-h-7"
          />
        </div>
        <button
          className="bg-brand-500 hover:bg-brand-600 h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-white transition-colors"
          onClick={handleSend}
        >
          <Send2 size={14} color="currentColor" variant="Broken" />
        </button>
      </div>

    </div>
  );
};

export default Chat;

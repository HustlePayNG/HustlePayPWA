import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sms, Call, MessageText, ArrowDown2, ArrowUp2, ArrowLeft } from 'iconsax-react';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How does the call-out fee work?",
      a: "The call-out fee is charged upfront to secure the artisan's booking commitment. If the artisan declines the booking, it is fully refunded back to your wallet."
    },
    {
      q: "When is the final balance paid?",
      a: "Once the artisan completes the job assessment on-site, they will propose a final labor charge. You can review and authorize this payment from your wallet balance."
    },
    {
      q: "What is the HustlePay commission?",
      a: "HustlePay deducts a flat 5% commission from all payments received by the artisan for a completed service."
    }
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      {/* Top Circular Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="h-10 w-10 flex items-center justify-center bg-zinc-100/50 hover:bg-zinc-200/50 rounded-full text-zinc-600 mb-4 cursor-pointer transition-all active:scale-90"
      >
        <ArrowLeft size={18} color="currentColor" variant="Broken" />
      </button>

      <h2 className="text-2xl font-extrabold text-white mb-2">Help & Support</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Search answers to common questions or reach out to HustlePay support representatives.
      </p>

      {/* Support methods */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass border border-zinc-850 rounded-2xl text-center p-3 flex flex-col items-center gap-1 min-w-0">
          <Sms size={16} color="currentColor" variant="Broken" className="text-brand-400 shrink-0" />
          <span className="font-bold text-[9px] text-zinc-300 block">Email</span>
          <span className="text-[8px] text-zinc-550 truncate w-full block">support@hustlepay.com</span>
        </div>
        
        <div className="glass border border-zinc-850 rounded-2xl text-center p-3 flex flex-col items-center gap-1 min-w-0">
          <Call size={16} color="currentColor" variant="Broken" className="text-brand-400 shrink-0" />
          <span className="font-bold text-[9px] text-zinc-300 block">Call Support</span>
          <span className="text-[8px] text-zinc-550 truncate w-full block">+234 800 HUSTLE</span>
        </div>

        <div className="glass border border-zinc-850 rounded-2xl text-center p-3 flex flex-col items-center gap-1 min-w-0">
          <MessageText size={16} color="currentColor" variant="Broken" className="text-brand-400 shrink-0" />
          <span className="font-bold text-[9px] text-zinc-300 block">Live Chat</span>
          <span className="text-[8px] text-zinc-550 truncate w-full block">24/7 Agent</span>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Frequently Asked Questions</h3>
        <div className="glass border border-zinc-850 rounded-[28px] p-2 flex flex-col gap-1">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border-b border-zinc-900 last:border-b-0">
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
                >
                  <span className="text-xs font-bold text-white leading-normal pr-4">{faq.q}</span>
                  {isOpen ? <ArrowUp2 size={14} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" /> : <ArrowDown2 size={14} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 text-[11px] text-zinc-450 leading-relaxed font-light animate-in fade-in slide-in-from-top-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Help;

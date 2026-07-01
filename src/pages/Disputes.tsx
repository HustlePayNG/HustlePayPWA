import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { mockDb, type Dispute } from '../services/mockDb';
// lucide-react imports removed

export const Disputes: React.FC = () => {
  const { user } = useAppStore();
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    if (user) {
      setDisputes(mockDb.getDisputes(user.id));
    }
  }, [user]);

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'under_review': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'resolved': return 'bg-success-500/10 text-success-400 border border-success-500/20';
      default: return 'bg-zinc-800 text-zinc-550';
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in">
      <h2 className="text-2xl font-extrabold text-white mb-2">Disputes Dashboard</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Track the status of disputed bookings. HustlePay administration moderates claims manually.
      </p>

      <div className="flex-1 flex flex-col gap-4">
        {disputes.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500 text-xs">
            No active disputes found. You can file a dispute from the details panel of any active request.
          </div>
        ) : (
          disputes.map(disp => (
            <div key={disp.id} className="glass border border-zinc-850 rounded-[28px] p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="text-left min-w-0">
                  <span className="font-extrabold text-sm text-white block truncate">{disp.reason}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Booking Ref: {disp.bookingRef}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold shrink-0 ${getStatusColor(disp.status)}`}>
                  {disp.status.replace('_', ' ')}
                </span>
              </div>

              <div className="h-px bg-zinc-850/60 my-1"></div>

              <div className="text-xs text-zinc-400 text-left leading-relaxed font-light">
                <span className="font-bold text-zinc-300 block mb-1 text-[10px] uppercase">My Claim:</span>
                {disp.description}
              </div>

              {disp.status === 'resolved' && (
                <div className="p-3 border border-success-500/20 bg-success-500/5 rounded-2xl text-[11px] text-zinc-300 leading-relaxed">
                  <span className="font-bold text-success-400 block mb-0.5">Resolution Outcome:</span>
                  {disp.resolution || 'Admin release of escrow payments.'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Disputes;

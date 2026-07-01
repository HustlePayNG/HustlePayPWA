import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { mockDb, type Booking } from '../services/mockDb';
import { Calendar, TickCircle } from 'iconsax-react';

export const History: React.FC = () => {
  const { user, refreshBookings } = useAppStore();
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);

  useEffect(() => {
    refreshBookings();
    if (user) {
      const all = mockDb.getBookings(user.id, 'artisan');
      setCompletedJobs(all.filter(b => b.status === 'seeker_confirmed'));
    }
  }, [user]);

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in">
      <h2 className="text-2xl font-extrabold text-white mb-2">Job History</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Review your completed services and ratings received from seekers.
      </p>

      <div className="flex-1 flex flex-col gap-4">
        {completedJobs.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500 text-xs">
            No completed jobs in your history record yet.
          </div>
        ) : (
          completedJobs.map(bk => (
            <div key={bk.id} className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-row items-start gap-4">
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${bk.seekerName}`} className="h-12 w-12 border border-zinc-800 rounded-2xl bg-zinc-900/50 object-cover shrink-0" alt="" />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-extrabold text-xs text-white block truncate">{bk.seekerName}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-success-500/10 text-success-400 border border-success-500/20 flex items-center gap-1 shrink-0">
                    <TickCircle size={10} color="currentColor" variant="Broken" /> Completed
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400 block mt-0.5">{bk.serviceName}</span>
                
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1 font-semibold text-zinc-400">
                    <Calendar size={10} color="currentColor" variant="Broken" className="text-brand-400" />
                    <span>{new Date(bk.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-white">Payout: ₦{(bk.finalAmount ? bk.finalAmount * 0.95 : bk.estimatedAmount * 0.95).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;

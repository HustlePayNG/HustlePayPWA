import React, { useState, useEffect } from 'react';
import type { Dispute } from '../../types';
import { supabase } from '../../services/supabase';
import { ShieldSecurity, Eye, CloseCircle, Refresh, Gallery } from 'iconsax-react';
import { Button, Spinner, toast } from '@heroui/react';

export const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'under_review' | 'resolved'>('open');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('disputes').select('*');
      if (data) {
        setDisputes(data as any);
      }
    } catch (err) {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string, outcome: 'refund_seeker' | 'payout_artisan') => {
    setResolving(true);
    try {
      const resolutionText = outcome === 'refund_seeker' 
        ? 'Full refund processed back to seeker wallet after moderation review.'
        : 'Dispute closed in favor of artisan. Escrow funds released minus platform fee.';
      
      await supabase.from('disputes').update({ status: 'resolved', resolution_notes: resolutionText }).eq('id', disputeId);

      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'resolved', resolutionNotes: resolutionText } : d));

      toast.success(`Dispute claim resolved: ${outcome.replace('_', ' ').toUpperCase()}`);
      setSelectedDispute(null);
    } catch (err) {
      toast.danger('Failed to resolve dispute claim.');
    } finally {
      setResolving(false);
    }
  };

  const filtered = disputes.filter(d => {
    if (activeTab === 'all') return true;
    return d.status === activeTab;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest block">Escrow Moderation</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Disputes Settlement Portal</h1>
        </div>
        <Button onClick={loadDisputes} className="bg-white border border-slate-200 text-slate-900 font-extrabold text-xs h-9 px-4 rounded-xl cursor-pointer hover:bg-slate-50 shadow-xs flex items-center gap-1.5">
          <Refresh size={14} color="#0f172a" variant="Broken" />
          <span>Refresh Claims</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'open', label: 'Open Disputes' },
          { id: 'under_review', label: 'Under Review' },
          { id: 'resolved', label: 'Resolved' },
          { id: 'all', label: 'All Claims' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Disputes Table */}
      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-700 text-xs flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="font-extrabold">Loading claims history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <ShieldSecurity size={36} color="#3b82f6" variant="Broken" className="mb-1" />
            <p className="font-black text-slate-900 text-sm">No Active Disputes</p>
            <p className="text-slate-500 font-medium">There are no open claims in this status queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Evidence Photos</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-slate-900">{d.bookingRef}</td>
                    <td className="px-6 py-4 font-black text-brand-600">{d.reason}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 font-bold">
                        <Gallery size={14} color="#3b82f6" variant="Broken" />
                        {d.evidenceUrls?.length || 0} photo(s)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        d.status === 'resolved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setSelectedDispute(d)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-black text-xs h-8 px-3 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs"
                      >
                        <Eye size={14} color="#ffffff" variant="Broken" />
                        <span>Inspect & Settle</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispute Audit & Settlement Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-[28px] max-w-xl w-full p-6 text-left space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-wider block">Escrow Dispute Case</span>
                <h3 className="text-lg font-black text-slate-900">Ref: {selectedDispute.bookingRef}</h3>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <CloseCircle size={22} color="#0f172a" variant="Broken" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reason for Dispute</span>
                <p className="text-xs text-brand-600 font-black mt-0.5">{selectedDispute.reason}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Statement of Claim</span>
                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.evidenceUrls && selectedDispute.evidenceUrls.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Attached Photo Evidence</span>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDispute.evidenceUrls.map((url, i) => (
                      <img key={i} src={url} className="h-16 w-16 rounded-xl border border-slate-200 object-cover" alt="Evidence" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedDispute.status !== 'resolved' && (
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <Button
                  onClick={() => handleResolve(selectedDispute.id, 'refund_seeker')}
                  isDisabled={resolving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs h-10 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {resolving ? <Spinner size="sm" /> : 'Refund Seeker'}
                </Button>
                <Button
                  onClick={() => handleResolve(selectedDispute.id, 'payout_artisan')}
                  isDisabled={resolving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {resolving ? <Spinner size="sm" /> : 'Release to Artisan'}
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

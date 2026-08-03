import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import type { Dispute, Booking } from '../types';
import { supabaseDb } from '../services/supabaseDb';
import { uploadDisputeEvidence } from '../services/supabase';
import { ArrowLeft, ShieldSecurity, Gallery, CloseCircle, TickCircle } from 'iconsax-react';
import { Button, Spinner, toast } from '@heroui/react';

export const Disputes: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshNotifications } = useAppStore();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'under_review' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  // File Dispute Modal State
  const [showFileModal, setShowFileModal] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [reason, setReason] = useState('Service Not Delivered');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<{ file: File; url: string }[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      loadDisputes();
      loadEligibleBookings();
    }
  }, [user]);

  const loadDisputes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supaDisputes = await supabaseDb.getDisputes(user.id);
      if (supaDisputes && supaDisputes.length > 0) {
        const mapped: Dispute[] = supaDisputes.map(d => ({
          id: d.id,
          bookingId: d.booking_id,
          raisedByUserId: d.complainant_id || d.raised_by_user_id || '',
          reason: d.reason,
          description: d.description,
          evidenceUrls: d.evidence_urls || [],
          status: d.status as Dispute['status'],
          createdAt: d.created_at
        }));
        setDisputes(mapped);
      }
    } catch (err) {
      console.warn('loadDisputes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleBookings = async () => {
    if (!user) return;
    const mode = user.activeModePreference || 'seeker';
    const isArtisan = mode === 'artisan';
    try {
      const bkList = await supabaseDb.getBookings(user.id, isArtisan);
      if (bkList && bkList.length > 0) {
        const mapped: Booking[] = bkList.map(b => ({
          id: b.id,
          reference: b.reference,
          seekerId: b.seeker_id,
          artisanId: b.artisan_id,
          artisanName: b.service_name,
          artisanAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Artisan',
          seekerName: 'Client',
          seekerPhone: '',
          serviceName: b.service_name,
          description: b.description || '',
          photos: [] as string[],
          scheduledStartAt: b.created_at,
          address: b.address || '',
          calloutFee: b.callout_fee,
          estimatedAmount: b.estimated_amount,
          status: b.status as Booking['status'],
          createdAt: b.created_at,
          updatedAt: b.updated_at || b.created_at
        }));
        setUserBookings(mapped);
      }
    } catch (err) {
      console.warn('loadEligibleBookings note:', err);
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingEvidence(true);
    try {
      const newFiles: { file: File; url: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await uploadDisputeEvidence(user.id, file);
          newFiles.push({ file, url: res.publicUrl });
        } catch (err) {
          newFiles.push({ file, url: URL.createObjectURL(file) });
        }
      }
      setEvidenceFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} evidence photo(s) attached!`);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleFileDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBookingId || !description.trim()) {
      toast.danger('Please select a booking and describe the issue.');
      return;
    }

    const booking = userBookings.find(b => b.id === selectedBookingId);
    if (!booking) return;

    setSubmitting(true);
    const evidenceUrls = evidenceFiles.map(f => f.url);

    try {
      const respondentId = user.id === booking.seekerId ? booking.artisanId : booking.seekerId;
      await supabaseDb.createDispute({
        bookingId: booking.id,
        bookingRef: (booking as any).reference || 'REF-BOOKING',
        complainantId: user.id,
        respondentId,
        reason,
        description: description.trim(),
        evidenceUrls
      });
      toast.success('Dispute claim filed successfully! Operations team will review.');
    } catch (err: any) {
      toast.danger(err.message || 'Failed to file dispute claim.');
    } finally {
      setSubmitting(false);
      setShowFileModal(false);
      setDescription('');
      setEvidenceFiles([]);
      setSelectedBookingId('');
      loadDisputes();
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (activeTab === 'all') return true;
    return d.status === activeTab;
  });

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'under_review': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-zinc-800 text-zinc-550';
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-24 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 flex items-center justify-center bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-full text-zinc-400 hover:text-white cursor-pointer transition-all active:scale-90"
        >
          <ArrowLeft size={18} color="currentColor" variant="Broken" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <ShieldSecurity size={24} className="text-brand-400 shrink-0" color="currentColor" variant="Broken" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Disputes Center</h2>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Track submitted claims and escrow dispute resolutions moderated by HustlePay Compliance.
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-850 pb-3 mb-5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Disputes' },
          { id: 'open', label: 'Open' },
          { id: 'under_review', label: 'Under Review' },
          { id: 'resolved', label: 'Resolved' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              activeTab === t.id
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div className="flex-1 flex flex-col gap-4">
        {loading ? (
          <div className="glass border border-zinc-850 rounded-[28px] p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span>Loading claims history...</span>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="glass border border-zinc-850 rounded-[28px] p-10 text-center text-zinc-400 text-xs flex flex-col items-center gap-3">
            <ShieldSecurity size={36} className="text-zinc-600" color="currentColor" variant="Broken" />
            <div>
              <p className="font-bold text-white text-sm">No disputes found</p>
              <p className="text-zinc-500 font-light text-[11px] mt-1">You have no active claims in this category.</p>
            </div>
            <Button
              onClick={() => setShowFileModal(true)}
              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-white px-4 h-9 rounded-xl mt-2 cursor-pointer"
            >
              File a Claim
            </Button>
          </div>
        ) : (
          filteredDisputes.map(disp => (
            <div key={disp.id} className="glass border border-zinc-850 rounded-[28px] p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="text-left min-w-0">
                  <span className="font-extrabold text-sm text-white block truncate">{disp.reason}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">Booking Ref: {disp.bookingRef}</span>
                </div>
                <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold shrink-0 ${getStatusColor(disp.status)}`}>
                  {disp.status.replace('_', ' ')}
                </span>
              </div>

              <div className="h-px bg-zinc-850/60 my-0.5"></div>

              <div className="text-xs text-zinc-300 text-left leading-relaxed font-light">
                <span className="font-bold text-zinc-400 block mb-1 text-[10px] uppercase tracking-wider">Statement of Claim:</span>
                <p className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-850/80 text-zinc-300 text-xs">
                  {disp.description}
                </p>
              </div>

              {/* Evidence Photos Grid */}
              {disp.evidenceUrls && disp.evidenceUrls.length > 0 && (
                <div className="mt-1">
                  <span className="font-bold text-zinc-400 block mb-1.5 text-[10px] uppercase tracking-wider">Attached Evidence ({disp.evidenceUrls.length}):</span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {disp.evidenceUrls.map((url, i) => (
                      <img key={i} src={url} className="h-16 w-16 object-cover rounded-xl border border-zinc-800 shrink-0" alt="Evidence" />
                    ))}
                  </div>
                </div>
              )}

              {disp.status === 'resolved' && (
                <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl text-[11px] text-zinc-200 leading-relaxed mt-1">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold mb-0.5 text-xs">
                    <TickCircle size={14} color="currentColor" variant="Broken" />
                    <span>Resolution Outcome:</span>
                  </div>
                  {disp.resolution || 'Escrow funds refunded to Seeker wallet after audit.'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* File New Dispute Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-left shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShieldSecurity size={20} className="text-brand-400" color="currentColor" variant="Broken" />
                <h3 className="text-lg font-extrabold text-white">File Dispute Claim</h3>
              </div>
              <button onClick={() => setShowFileModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <CloseCircle size={20} color="currentColor" variant="Broken" />
              </button>
            </div>

            <form onSubmit={handleFileDisputeSubmit} className="flex flex-col gap-4">
              {/* Select Booking */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Select Booking Ref</label>
                <select
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-955 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select a booking...</option>
                  {userBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.reference} — {b.serviceName} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispute Reason */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Dispute Category</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full h-11 px-3 bg-zinc-955 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Service Not Delivered">Service Not Delivered</option>
                  <option value="Incomplete / Subpar Work">Incomplete / Subpar Work</option>
                  <option value="Unprofessional Conduct">Unprofessional Conduct</option>
                  <option value="Price & Billing Discrepancy">Price & Billing Discrepancy</option>
                  <option value="Other Issue">Other Issue</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Detailed Explanation</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain what transpired and why escrow payment should be refunded or adjusted..."
                  className="w-full p-3 bg-zinc-955 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Attach Evidence Photos */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Attach Photo Evidence</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-zinc-955 hover:bg-zinc-850 border border-zinc-800 rounded-xl px-3 py-2.5 text-center text-xs text-zinc-300 font-semibold transition-all flex items-center justify-center gap-2">
                    {uploadingEvidence ? <Spinner size="sm" /> : <Gallery size={16} color="currentColor" variant="Broken" />}
                    <span>{uploadingEvidence ? 'Uploading...' : '📷 Select Evidence Files'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingEvidence}
                      onChange={handleEvidenceUpload}
                    />
                  </label>
                </div>
                {evidenceFiles.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2">
                    {evidenceFiles.map((ef, idx) => (
                      <img key={idx} src={ef.url} className="h-14 w-14 object-cover rounded-xl border border-zinc-800 shrink-0" alt="Preview" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="flex-1 h-11 border border-zinc-800 text-zinc-300 font-bold rounded-xl bg-transparent hover:bg-zinc-850 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isDisabled={submitting || !selectedBookingId || !description.trim()}
                  className="flex-1 h-11 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-500/20"
                >
                  {submitting && <Spinner size="sm" />}
                  <span>Submit Dispute</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disputes;

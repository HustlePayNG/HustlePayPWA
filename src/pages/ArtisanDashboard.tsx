import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import type { Booking, ArtisanProfile } from '../types';
import { supabase } from '../services/supabase';
import { supabaseDb } from '../services/supabaseDb';
import { 
  Calendar, Star, Money, ArrowRight, TrendUp, Award,
  Edit2, Eye, Danger, SearchNormal1
} from 'iconsax-react';
import { 
  Button, TextField, Label, 
  Spinner, toast, Input
} from '@heroui/react';
import CustomCheckbox from '../components/CustomCheckbox';

export const ArtisanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, wallet, bookings, refreshWallet, refreshBookings } = useAppStore();
  const [profile, setProfile] = useState<ArtisanProfile | undefined>(undefined);
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [directRequests, setDirectRequests] = useState<Booking[]>([]);

  // Open Jobs State
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [searchCategory, setSearchCategory] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Bid form state
  const [activeBidJobId, setActiveBidJobId] = useState<string | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  // Active inline management panel
  const [activeInlinePanel, setActiveInlinePanel] = useState<'pricing' | 'availability' | 'schedule' | 'none'>('none');
  const [editBaseRate, setEditBaseRate] = useState(15000);
  const [editCalloutFee, setEditCalloutFee] = useState(3000);
  const [editRateType, setEditRateType] = useState<'hourly' | 'fixed'>('hourly');
  const [editAvailability, setEditAvailability] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  
  const [isOnline, setIsOnline] = useState(true);
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  const fetchOpenJobs = async () => {
    try {
      const { data } = await supabase.from('jobs').select('*').eq('status', 'open');
      if (data) setOpenJobs(data);
    } catch (e) {
      console.warn('fetchOpenJobs note:', e);
    }
  };

  useEffect(() => {
    refreshWallet();
    refreshBookings();
    fetchOpenJobs();

    if (user) {
      supabaseDb.getProfile(user.id).then(p => {
        if (p) {
          setProfile(p as any);
          setEditBaseRate(p.base_rate || 15000);
          setEditCalloutFee(p.callout_fee || 3000);
          setEditRateType(p.rate_type || 'hourly');
        }
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const artisanBookings = bookings.filter(b => b.artisanId === user.id);
    const activeUpcoming = artisanBookings.find(b => ['accepted', 'in_progress'].includes(b.status));
    setNextBooking(activeUpcoming || null);

    const pendingRequests = artisanBookings.filter(b => b.status === 'requested');
    setDirectRequests(pendingRequests);
  }, [bookings, user]);

  useEffect(() => {
    if (!nextBooking) {
      setCountdown('');
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(nextBooking.createdAt).getTime()) / 1000));
      const hours = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBooking]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJob) return;

    const priceNum = parseFloat(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.warning('Please enter a valid bid amount.');
      return;
    }

    setSubmittingBid(true);
    try {
      await supabase.from('bids').insert({
        job_id: selectedJob.id,
        artisan_id: user.id,
        price: priceNum,
        note: bidNote
      });
      toast.success('Bid submitted successfully!');
      setBidNote('');
      setBidPrice('');
      setActiveBidJobId(null);
      fetchOpenJobs();
    } catch (err: any) {
      toast.danger(err.message || 'Failed to submit bid.');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptRequest = async (bk: Booking) => {
    await supabase.from('bookings').update({ status: 'accepted' }).eq('id', bk.id);
    refreshBookings();
    toast.success('Job request accepted!', { description: 'Client has been notified.' });
  };

  const handleDeclineRequest = async (bk: Booking) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bk.id);
    refreshBookings();
    toast.info('Job request declined.');
  };

  const handleSavePricing = async () => {
    if (!user) return;
    try {
      await supabaseDb.updateProfile(user.id, {
        base_rate: editBaseRate,
        callout_fee: editCalloutFee,
        rate_type: editRateType
      } as any);
      setActiveInlinePanel('none');
      toast.success('Services & pricing updated successfully!');
    } catch (e: any) {
      toast.danger(e.message || 'Failed to update pricing.');
    }
  };

  const handleSaveAvailability = () => {
    setActiveInlinePanel('none');
    toast.success('Working schedule updated successfully!');
  };

  const categories = [
    { id: 'cat-1', name: 'Electrical & Power' },
    { id: 'cat-2', name: 'Plumbing & Water' },
    { id: 'cat-3', name: 'HVAC & AC Repairs' },
    { id: 'cat-4', name: 'Carpentry & Woodwork' },
    { id: 'cat-5', name: 'Painting & Decorating' }
  ];
  const filteredOpenJobs = openJobs.filter(j => {
    const matchesCat = selectedCategoryFilter === 'all' || j.categoryId === selectedCategoryFilter;
    const matchesQuery = !jobSearchQuery || 
      j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
      j.description.toLowerCase().includes(jobSearchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  if (!user || !profile) return null;

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in pb-20">
      
      {/* Profile Header Bar */}
      <div className="glass border border-zinc-855 rounded-[28px] p-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <img src={user.avatarUrl} className="h-13 w-13 rounded-2xl object-cover border-2 border-brand-500/40" alt="" />
            <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-955 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest">Artisan Mode</span>
            </div>
            <h2 className="text-base font-extrabold text-white truncate">{profile.businessName}</h2>
            <span className="text-[11px] text-zinc-400 font-medium block truncate">Owner: {user.fullName}</span>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !isOnline;
            setIsOnline(next);
            toast.info(next ? 'You are now Online — Accepting direct calls' : 'Status set to Offline');
          }}
          className={`px-3 py-1.5 rounded-2xl text-[10px] font-extrabold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Quick Action Control Strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => setActiveInlinePanel(activeInlinePanel === 'pricing' ? 'none' : 'pricing')}
          className={`glass border p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group ${
            activeInlinePanel === 'pricing' ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-850 hover:border-brand-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <Edit2 size={16} color="currentColor" variant="Broken" />
          </div>
          <span className="text-[9px] font-bold text-zinc-300">Pricing</span>
        </button>

        <button
          onClick={() => setActiveInlinePanel(activeInlinePanel === 'schedule' ? 'none' : 'schedule')}
          className={`glass border p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group ${
            activeInlinePanel === 'schedule' ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-850 hover:border-brand-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <Calendar size={16} color="currentColor" variant="Broken" />
          </div>
          <span className="text-[9px] font-bold text-zinc-300">Schedule</span>
        </button>

        <button
          onClick={() => navigate(`/artisan/${user.id}`)}
          className="glass border border-zinc-850 hover:border-brand-500/40 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <Eye size={16} color="currentColor" variant="Broken" />
          </div>
          <span className="text-[9px] font-bold text-zinc-300">Profile</span>
        </button>

        <button
          onClick={() => navigate('/wallet')}
          className="glass border border-zinc-850 hover:border-brand-500/40 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <Money size={16} color="currentColor" variant="Broken" />
          </div>
          <span className="text-[9px] font-bold text-zinc-300">Payouts</span>
        </button>
      </div>

      {/* Inline Section: Pricing Setup */}
      {activeInlinePanel === 'pricing' && (
        <div className="glass border border-brand-500/30 bg-zinc-900/60 rounded-[28px] p-5 mb-6 text-left animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-extrabold text-brand-400 uppercase tracking-widest block">Artisan Settings</span>
              <h3 className="text-base font-extrabold text-white">Manage Services & Pricing</h3>
            </div>
            <button 
              onClick={() => setActiveInlinePanel('none')} 
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Rate Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditRateType('fixed')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    editRateType === 'fixed' ? 'bg-brand-500 text-white border-brand-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Fixed Per Job
                </button>
                <button
                  type="button"
                  onClick={() => setEditRateType('hourly')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    editRateType === 'hourly' ? 'bg-brand-500 text-white border-brand-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Hourly Wage
                </button>
              </div>
            </div>

            <TextField className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Base Rate (₦)</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-955 focus-within:border-brand-500 h-11 transition-colors">
                <Input
                  type="number"
                  value={editBaseRate.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBaseRate(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Call-out Fee (₦)</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-955 focus-within:border-brand-500 h-11 transition-colors">
                <Input
                  type="number"
                  value={editCalloutFee.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCalloutFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-zinc-500">Callout commitment fee collected before travel.</span>
            </TextField>

            <div className="glass border border-brand-500/20 bg-brand-500/5 p-3.5 rounded-2xl flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Base Labor Rate:</span>
                <span>₦{editBaseRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>HustlePay 5% Fee:</span>
                <span>-₦{Math.round(editBaseRate * 0.05).toLocaleString()}</span>
              </div>
              <div className="h-px bg-zinc-800 my-0.5"></div>
              <div className="flex justify-between font-extrabold text-brand-300">
                <span>You Receive:</span>
                <span>₦{Math.round(editBaseRate * 0.95).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => setActiveInlinePanel('none')}
                className="flex-1 h-10 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs bg-transparent cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePricing}
                className="flex-1 h-10 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-500/20 cursor-pointer"
              >
                Save Pricing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Section: Schedule Setup */}
      {activeInlinePanel === 'schedule' && (
        <div className="glass border border-brand-500/30 bg-zinc-900/60 rounded-[28px] p-5 mb-6 text-left animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-extrabold text-brand-400 uppercase tracking-widest block">Schedule Setup</span>
              <h3 className="text-base font-extrabold text-white">Working Days & Hours</h3>
            </div>
            <button 
              onClick={() => setActiveInlinePanel('none')} 
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {editAvailability.map((day, idx) => (
              <div key={day.weekday} className="flex items-center justify-between p-2.5 border border-zinc-850 rounded-xl bg-zinc-955/60">
                <CustomCheckbox
                  isSelected={day.enabled}
                  onChange={(checked) => {
                    const updated = [...editAvailability];
                    updated[idx].enabled = checked;
                    setEditAvailability(updated);
                  }}
                  className="text-xs font-semibold text-white cursor-pointer"
                >
                  {day.weekday}
                </CustomCheckbox>
                {day.enabled && (
                  <div className="flex items-center gap-1 text-[10px]">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => {
                        const updated = [...editAvailability];
                        updated[idx].startTime = e.target.value;
                        setEditAvailability(updated);
                      }}
                      className="bg-zinc-900 text-white border border-zinc-800 rounded p-1"
                    />
                    <span className="text-zinc-500">-</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => {
                        const updated = [...editAvailability];
                        updated[idx].endTime = e.target.value;
                        setEditAvailability(updated);
                      }}
                      className="bg-zinc-900 text-white border border-zinc-800 rounded p-1"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-3">
              <Button
                onClick={() => setActiveInlinePanel('none')}
                className="flex-1 h-10 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs bg-transparent cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAvailability}
                className="flex-1 h-10 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-500/20 cursor-pointer"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Required Direct Requests */}
      {directRequests.length > 0 && (
        <div className="mb-6 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Danger size={14} color="currentColor" variant="Broken" className="animate-bounce" /> Action Required ({directRequests.length})
            </h3>
            <span className="text-[10px] text-zinc-500">Direct Call-outs</span>
          </div>

          <div className="flex flex-col gap-3">
            {directRequests.map(req => (
              <div key={req.id} className="glass border border-amber-500/30 bg-amber-500/5 rounded-[24px] p-4 flex flex-col gap-3 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Direct Request
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1.5">{req.serviceName}</h4>
                    <span className="text-[11px] text-zinc-450 block mt-0.5">Requested by: {req.seekerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Callout Fee</span>
                    <span className="text-sm font-black text-amber-400">₦{req.estimatedAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-px bg-zinc-855/60 my-0.5"></div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDeclineRequest(req)}
                    size="sm"
                    className="flex-1 h-9 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-xs bg-transparent hover:bg-zinc-900 cursor-pointer"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleAcceptRequest(req)}
                    size="sm"
                    className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-xs shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Accept Job
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Balance Widget */}
      <div className="glass border border-zinc-855 rounded-[28px] p-4 mb-6 flex justify-between items-center bg-zinc-900/30">
        <div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Artisan Earnings Ledger</span>
          <span className="text-xl font-black text-white">₦{(wallet?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>
        <Button
          onClick={() => navigate('/wallet')}
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-2xl text-xs h-9 px-4 cursor-pointer"
        >
          Withdraw
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Money size={10} color="currentColor" variant="Broken" className="text-brand-400" /> Pending Payouts
          </span>
          <div className="font-black text-white text-base">
            ₦{bookings
              .filter(b => b.artisanId === user.id && ['in_progress', 'price_proposed', 'price_accepted'].includes(b.status))
              .reduce((acc, curr) => acc + (curr.finalAmount || curr.estimatedAmount), 0)
              .toLocaleString()}
          </div>
          <span className="text-[9px] text-zinc-550 font-semibold block">In active jobs</span>
        </div>

        <div className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Star size={10} color="currentColor" variant="Broken" className="text-warning-400" /> Rating Average
          </span>
          <div className="font-black text-white text-base flex items-baseline gap-1">
            <span>{profile.ratingAverage.toFixed(1)}</span>
            <span className="text-[10px] text-zinc-550 font-bold">/5.0</span>
          </div>
          <span className="text-[9px] text-zinc-550 font-semibold block">
            {profile.completedJobsCount} completed jobs
          </span>
        </div>
      </div>

      {/* Next Upcoming Job */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Next Upcoming Job</h3>
        {nextBooking ? (
          <div 
            className="glass border border-brand-500/20 bg-brand-500/5 hover:border-brand-500/30 transition-all rounded-[28px] p-4 flex flex-col gap-3 cursor-pointer"
            onClick={() => navigate('/bookings')}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="text-left min-w-0 flex-1">
                <span className="font-extrabold text-sm text-white block truncate">{nextBooking.serviceName}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 truncate">Booked by: {nextBooking.seekerName}</span>
              </div>
              
              <div className="glass border border-brand-500/30 px-3 py-1 rounded-xl text-center shrink-0">
                <span className="text-[8px] font-bold text-brand-300 uppercase tracking-wider block">Starts In</span>
                <span className="text-xs font-black text-white block mt-0.5">{countdown || nextBooking.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="h-px bg-zinc-855/60 my-1"></div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">{typeof nextBooking.address === 'string' ? nextBooking.address : nextBooking.address?.formattedAddress || ''}</span>
              <span className="font-extrabold text-brand-300 flex items-center gap-1">
                Details <ArrowRight size={12} color="currentColor" variant="Broken" />
              </span>
            </div>
          </div>
        ) : (
          <div className="glass border border-zinc-855 rounded-[28px] p-6 text-center text-zinc-500 text-xs">
            No active jobs in your pipeline right now.
          </div>
        )}
      </div>

      {/* Marketplace Openings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Marketplace Job Openings</h3>
          <span className="text-[10px] text-brand-400 font-extrabold">{filteredOpenJobs.length} Available</span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 py-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            All Openings
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border shrink-0 cursor-pointer ${
                selectedCategoryFilter === c.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 h-10 border border-zinc-800 rounded-2xl bg-zinc-900/60 mb-3 focus-within:border-brand-500">
          <SearchNormal1 size={14} color="currentColor" variant="Broken" className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search job titles or description..."
            value={jobSearchQuery}
            onChange={e => setJobSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {/* Open Jobs List */}
        {filteredOpenJobs.length === 0 ? (
          <div className="glass border border-zinc-855 rounded-[28px] p-6 text-center text-zinc-500 text-xs">
            No open marketplace jobs found matching your filter.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOpenJobs.map(job => {
              const alreadyBidded = job.proposals?.some((p: any) => p.artisanId === user.id);
              const isBiddingActive = activeBidJobId === job.id;

              return (
                <div key={job.id} className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                          {job.category}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold">{job.proposals?.length || 0} bids</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white leading-snug">{job.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-zinc-450">Posted by: {job.seekerName}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Budget</span>
                      <span className="text-sm font-black text-white">₦{job.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed text-left break-words">{job.description}</p>
                  
                  <div className="h-px bg-zinc-855/60"></div>
                  
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] text-zinc-500 font-semibold">{job.address}</span>
                    <Button
                      onClick={() => {
                        if (isBiddingActive) {
                          setActiveBidJobId(null);
                        } else {
                          setActiveBidJobId(job.id);
                          setSelectedJob(job);
                          setBidPrice(String(job.budget));
                        }
                      }}
                      isDisabled={alreadyBidded}
                      size="sm"
                      className={`h-8 px-4 rounded-xl text-[10px] font-bold border-0 transition-all cursor-pointer ${
                        alreadyBidded 
                          ? 'bg-zinc-800 text-zinc-500' 
                          : isBiddingActive
                            ? 'bg-zinc-800 text-white'
                            : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                      }`}
                    >
                      {alreadyBidded ? 'Bid Submitted' : isBiddingActive ? 'Close' : 'Place Bid'}
                    </Button>
                  </div>

                  {/* Inline Proposal Form */}
                  {isBiddingActive && (
                    <form onSubmit={(e) => {
                      handlePlaceBid(e);
                    }} className="glass border border-brand-500/30 bg-zinc-950 p-4 rounded-2xl flex flex-col gap-3 mt-2 animate-in fade-in">
                      <span className="text-xs font-extrabold text-white">Submit Proposal for {job.title}</span>
                      <TextField className="flex flex-col gap-1">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400">Your Bid Price (₦)</Label>
                        <input
                          type="number"
                          placeholder="e.g. 12000"
                          required
                          value={bidPrice}
                          onChange={e => setBidPrice(e.target.value)}
                          className="h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </TextField>

                      <TextField className="flex flex-col gap-1">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400">Proposal Cover Note</Label>
                        <textarea
                          placeholder="Explain why you are the best fit for this job..."
                          required
                          rows={2}
                          value={bidNote}
                          onChange={e => setBidNote(e.target.value)}
                          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                        />
                      </TextField>

                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          onClick={() => setActiveBidJobId(null)}
                          className="flex-1 h-9 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs bg-transparent cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          isDisabled={submittingBid}
                          className="flex-1 h-9 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          {submittingBid ? <Spinner size="sm" color="current" /> : 'Submit Proposal'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div>
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Performance Overview</h3>
        <div className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <TrendUp size={12} color="currentColor" variant="Broken" className="text-brand-400" /> Completion Rate:
            </span>
            <span className="font-bold text-white">98.5%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Calendar size={12} color="currentColor" variant="Broken" className="text-brand-400" /> Active Service Days:
            </span>
            <span className="font-bold text-white">
              {profile.availability.filter(d => d.enabled).length} days / week
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Award size={12} color="currentColor" variant="Broken" className="text-brand-400" /> Experience Level:
            </span>
            <span className="font-bold text-white">{profile.yearsExperience} Years Verified Veteran</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ArtisanDashboard;

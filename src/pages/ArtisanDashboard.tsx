import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Booking, type ArtisanProfile } from '../services/mockDb';
import { Calendar, Star, Money, ArrowRight, TrendUp, Award } from 'iconsax-react';
import { 
  Button, Modal, ModalBackdrop, ModalContainer, ModalDialog, 
  ModalBody, ModalHeader, ModalFooter, TextField, Label, 
  Spinner, toast 
} from '@heroui/react';

export const ArtisanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, wallet, bookings, refreshWallet, refreshBookings } = useAppStore();
  const [profile, setProfile] = useState<ArtisanProfile | undefined>(undefined);
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [countdown, setCountdown] = useState('');

  // Bidding State
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchOpenJobs = () => {
    const list = mockDb.getJobOpenings();
    setOpenJobs(list.filter(j => j.status === 'open'));
  };

  useEffect(() => {
    fetchOpenJobs();
  }, []);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJob) return;

    const priceNum = parseFloat(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.warning('Please enter a valid bid amount.');
      return;
    }

    setSubmittingBid(true);
    setTimeout(() => {
      const ok = mockDb.submitJobProposal(selectedJob.id, user.id, priceNum, bidNote);
      if (ok) {
        toast.success('Bid submitted successfully!', {
          description: 'The client has been notified of your proposal.'
        });
        setBidNote('');
        setBidPrice('');
        setShowBidModal(false);
        fetchOpenJobs();
      } else {
        toast.warning('You have already submitted a bid for this job.');
        setShowBidModal(false);
      }
      setSubmittingBid(false);
    }, 1000);
  };

  useEffect(() => {
    refreshWallet();
    refreshBookings();
    if (user) {
      const artProfile = mockDb.getArtisanById(user.id);
      setProfile(artProfile);
    }
  }, [user]);

  // Set next upcoming active booking
  useEffect(() => {
    const upcoming = bookings.filter(b => ['requested', 'accepted', 'in_progress', 'price_proposed', 'price_accepted'].includes(b.status));
    if (upcoming.length > 0) {
      setNextBooking(upcoming[upcoming.length - 1]);
    } else {
      setNextBooking(null);
    }
  }, [bookings]);

  // Countdown timer for next booking
  useEffect(() => {
    if (!nextBooking) return;
    
    const interval = setInterval(() => {
      const targetTime = new Date(nextBooking.createdAt).getTime() + 24 * 60 * 60 * 1000;
      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setCountdown('Ongoing');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextBooking]);

  if (!user || !profile) return null;

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in pb-20">
      
      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src={user.avatarUrl} className="h-14 w-14 rounded-2xl object-cover border-2 border-brand-500/30" alt="" />
        <div>
          <span className="text-[10px] text-zinc-555 uppercase tracking-widest font-bold">Artisan Mode</span>
          <h2 className="text-xl font-extrabold text-white">{profile.businessName}</h2>
          <span className="text-xs text-brand-300 font-medium block">Owner: {user.fullName}</span>
        </div>
      </div>

      {/* Grid: Wallet & Ratings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Wallet Balance (ART-17) */}
        <div className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Money size={10} color="currentColor" variant="Broken" className="text-brand-400" /> Wallet Balance
          </span>
          <div className="font-black text-white text-base">
            ₦{wallet?.balance.toLocaleString() || '0'}
          </div>
          <Button 
            onClick={() => navigate('/wallet')}
            size="sm"
            className="text-[10px] text-left text-brand-400 font-bold flex items-center gap-0.5 hover:underline mt-1 p-0 h-auto min-w-0 bg-transparent justify-start"
          >
            Withdraw Payout <ArrowRight size={10} color="currentColor" variant="Broken" />
          </Button>
        </div>

        {/* Ratings Summary (ART-18) */}
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

      {/* Upcoming Pinned Booking Card (ART-15) */}
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
              
              {/* Countdown indicator */}
              <div className="glass border border-brand-500/30 px-3 py-1 rounded-xl text-center shrink-0">
                <span className="text-[8px] font-bold text-brand-300 uppercase tracking-wider block">Starts In</span>
                <span className="text-xs font-black text-white block mt-0.5">{countdown}</span>
              </div>
            </div>

            <div className="h-px bg-zinc-855/60 my-1"></div>

            <div className="flex justify-between items-center text-[10px] text-zinc-500">
              <span className="font-medium">Job Reference:</span>
              <span className="font-bold text-white">{nextBooking.reference}</span>
            </div>
          </div>
        ) : (
          <div className="glass border border-zinc-900 rounded-3xl p-8 text-center text-zinc-500 text-xs">
            No upcoming bookings. Go to the Bookings tab to review client requests.
          </div>
        )}
      </div>

      {/* Available Job Openings near you */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Available Job Openings</h3>
        {openJobs.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-3xl p-6 text-center text-zinc-500 text-xs">
            No open jobs in your area currently. Check back later!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {openJobs.map(job => {
              const alreadyBidded = job.proposals.some((p: any) => p.artisanId === user.id);
              return (
                <div 
                  key={job.id} 
                  className="glass border border-zinc-855 rounded-[28px] p-4 flex flex-col gap-3.5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="text-left">
                      <span className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{job.category}</span>
                      <h4 className="font-extrabold text-sm text-white mt-1.5 leading-snug">{job.title}</h4>
                      <span className="text-[10px] text-zinc-450 block mt-0.5">Posted by: {job.seekerName}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Budget</span>
                      <span className="text-sm font-black text-white">₦{job.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed text-left">{job.description}</p>
                  
                  <div className="h-px bg-zinc-855/60"></div>
                  
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] text-zinc-500 font-semibold">{job.address}</span>
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                        setBidPrice(String(job.budget));
                        setShowBidModal(true);
                      }}
                      isDisabled={alreadyBidded}
                      size="sm"
                      className={`h-8 px-4 rounded-xl text-[10px] font-bold border-0 transition-all ${
                        alreadyBidded 
                          ? 'bg-zinc-800 text-zinc-500' 
                          : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                      }`}
                    >
                      {alreadyBidded ? 'Bid Submitted' : 'Place Bid'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Stats & Analytics Summary */}
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
            <span className="font-bold text-white">Verified Veteran</span>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Modal isOpen={showBidModal} onOpenChange={setShowBidModal}>
        <ModalBackdrop className="bg-black/60 backdrop-blur-sm" />
        <ModalContainer className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDialog className="bg-zinc-900 border border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden rounded-[28px] animate-in zoom-in-95 duration-200">
            {selectedJob && (
              <form onSubmit={handlePlaceBid}>
                <ModalHeader className="px-6 pt-6 pb-2 border-b border-zinc-800/80">
                  <h3 className="text-base font-extrabold text-white">Place a Bid</h3>
                </ModalHeader>
                <ModalBody className="px-6 py-4 flex flex-col gap-4 text-left">
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-3.5 text-left mb-1">
                    <span className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{selectedJob.category}</span>
                    <h4 className="text-xs font-bold text-white mt-1.5">{selectedJob.title}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Client's Budget: ₦{selectedJob.budget.toLocaleString()}</p>
                  </div>

                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Your Bid Price (₦)</Label>
                    <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                      <input
                        type="number"
                        placeholder="e.g. 12000"
                        required
                        value={bidPrice}
                        onChange={e => setBidPrice(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </TextField>

                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Proposal Details / Cover Note</Label>
                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-start transition-colors">
                      <textarea
                        placeholder="Explain why you are the best fit for this job..."
                        required
                        rows={3}
                        value={bidNote}
                        onChange={e => setBidNote(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600 resize-none min-h-[75px]"
                      />
                    </div>
                  </TextField>
                </ModalBody>
                <ModalFooter className="px-6 pb-6 pt-2 flex gap-3">
                  <Button
                    onClick={() => setShowBidModal(false)}
                    variant="outline"
                    className="flex-1 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold h-11 rounded-2xl text-xs transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isDisabled={submittingBid}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold h-11 rounded-2xl text-xs shadow-xl shadow-brand-500/10 border-0 transition-all flex items-center justify-center gap-1.5"
                  >
                    {submittingBid ? <Spinner size="sm" color="current" /> : 'Submit Bid'}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalDialog>
        </ModalContainer>
      </Modal>
    </div>
  );
};

export default ArtisanDashboard;

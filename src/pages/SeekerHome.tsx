import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type ArtisanProfile } from '../services/mockDb';
import {
  SearchNormal1, Setting4, Star, Location, CloseCircle,
  Heart, MessageText
} from 'iconsax-react';
import { 
  Modal, ModalBackdrop, ModalContainer, ModalDialog, 
  ModalBody, ModalHeader, ModalFooter, Button, TextField, 
  Label, toast, Spinner 
} from '@heroui/react';
import { Requests } from './Requests';

// ── Greeting helpers ──────────────────────────────────────────────
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const greetingSubtitles = [
  'Ready to get something done today?',
  'Find trusted professionals near you.',
  'Your next great hire is a tap away.',
  'Quality service, right at your door.',
];

// ── Filters ───────────────────────────────────────────────────────
const RATING_OPTIONS = [4.0, 4.5, 4.8];
const DISTANCE_OPTIONS = [2, 5, 10];

// ── Component ─────────────────────────────────────────────────────
export const SeekerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const subtitle = greetingSubtitles[new Date().getMinutes() % greetingSubtitles.length];

  const [recommended, setRecommended] = useState<ArtisanProfile[]>([]);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractedRef = useRef(false);

  // Job Openings State
  const [openings, setOpenings] = useState<any[]>([]);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobBudget, setJobBudget] = useState('');
  const [jobAddress, setJobAddress] = useState(user?.address?.formattedAddress || '');
  const [postingJob, setPostingJob] = useState(false);

  // Categories list
  const categories = mockDb.getServiceCategories();

  const fetchOpenings = () => {
    if (user) {
      setOpenings(mockDb.getJobOpenings(user.id));
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, [user]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!jobTitle || !jobCategory || !jobDescription || !jobBudget || !jobAddress) {
      toast.warning('Please fill in all details.');
      return;
    }

    const budgetNum = parseFloat(jobBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.warning('Please enter a valid budget amount.');
      return;
    }

    setPostingJob(true);
    setTimeout(() => {
      mockDb.createJobOpening(
        user.id,
        user.fullName,
        jobTitle,
        jobCategory,
        jobDescription,
        budgetNum,
        jobAddress
      );
      toast.success('Job opening posted successfully!', {
        description: 'Artisans will notify you with proposals soon.'
      });
      setPostingJob(false);
      setShowCreateJobModal(false);
      
      // Reset form fields
      setJobTitle('');
      setJobCategory('');
      setJobDescription('');
      setJobBudget('');
      
      fetchOpenings();
    }, 1000);
  };

  const handleAcceptBid = (proposalId: string) => {
    if (!selectedJob) return;
    const booking = mockDb.acceptJobProposal(selectedJob.id, proposalId);
    if (booking) {
      toast.success('Bid accepted!', {
        description: `Booking reference: ${booking.reference}`
      });
      setShowJobDetailsModal(false);
      setSelectedJob(null);
      fetchOpenings();
      navigate('/history');
    } else {
      toast.warning('Could not accept proposal. Please try again.');
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      if (clientWidth > 0) {
        const childWidth = clientWidth * 0.78 + 12;
        const index = Math.round(scrollLeft / childWidth);
        if (index !== selectedIndex && index >= 0 && index < recommended.length) {
          setSelectedIndex(index);
        }
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      const childWidth = clientWidth * 0.78 + 12;
      containerRef.current.scrollTo({
        left: index * childWidth,
        behavior: 'smooth'
      });
      setSelectedIndex(index);
    }
  };

  useEffect(() => {
    if (recommended.length === 0) return;
    const interval = setInterval(() => {
      if (isInteractedRef.current) return;
      setSelectedIndex(prev => {
        const next = (prev + 1) % recommended.length;
        scrollToSlide(next);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [recommended.length]);

  useEffect(() => {
    const all = mockDb.getArtisans(undefined, query, { minRating, maxDistance });
    const sorted = [...all].sort((a, b) => b.ratingAverage - a.ratingAverage);
    setRecommended(sorted.slice(0, 8));
  }, [query, minRating, maxDistance]);

  const clearFilters = () => {
    setMinRating(undefined);
    setMaxDistance(undefined);
    setQuery('');
    setShowFilters(false);
  };

  const hasActiveFilters = minRating !== undefined || maxDistance !== undefined;

  // Fake engagement counts seeded from artisan id for variety
  const fakeCount = (id: string, base: number) =>
    base + (id.charCodeAt(id.length - 1) % 50);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-left animate-in fade-in pb-20">

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-[11px] text-brand-400 uppercase tracking-widest font-bold mb-0.5">
          {getGreeting()}, {firstName} 👋
        </p>
        <h1 className="text-2xl font-medium text-white leading-tight">{subtitle}</h1>
      </div>

      {/* ── Search + Filter ──────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 h-11 border border-zinc-800 rounded-2xl bg-zinc-900/60 focus-within:border-brand-500/70 transition-colors">
            <SearchNormal1 size={16} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Search plumbing, wiring, cleaning…"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-white transition-colors">
                <CloseCircle size={14} color="currentColor" variant="Broken" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`h-11 w-11 flex items-center justify-center rounded-2xl border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-brand-500 border-brand-400 text-white'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
            }`}
          >
            <Setting4 size={18} color="currentColor" variant="Broken" />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 glass border border-zinc-800/80 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-white">Filters</span>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[10px] text-brand-400 font-bold hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <div className="mb-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Min. Rating</p>
              <div className="flex gap-2">
                {RATING_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? undefined : r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      minRating === r ? 'bg-brand-500 border-brand-400 text-white' : 'border-zinc-800 text-zinc-400 bg-transparent'
                    }`}
                  >★ {r}+</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">Max. Distance</p>
              <div className="flex gap-2">
                {DISTANCE_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setMaxDistance(maxDistance === d ? undefined : d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      maxDistance === d ? 'bg-brand-500 border-brand-400 text-white' : 'border-zinc-800 text-zinc-400 bg-transparent'
                    }`}
                  >{d} km</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Job Openings Trigger & List ── */}
      <div className="px-5 mb-6">
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-[22px] p-4 flex justify-between items-center">
          <div className="flex-1 pr-3">
            <h3 className="text-sm font-bold text-white mb-0.5">Need an Artisan?</h3>
            <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
              Post an open job request and get custom bids from local vetted professionals.
            </p>
          </div>
          <Button
            onClick={() => {
              setJobAddress(user?.address?.formattedAddress || '');
              setShowCreateJobModal(true);
            }}
            size="sm"
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/15 border-0"
          >
            Post Job
          </Button>
        </div>
      </div>

      {/* Active Openings list */}
      {openings.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">Your Posted Openings</span>
          </div>
          <div className="flex flex-col gap-3">
            {openings.map(job => (
              <div 
                key={job.id} 
                onClick={() => {
                  setSelectedJob(job);
                  setShowJobDetailsModal(true);
                }}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-[22px] p-4 cursor-pointer hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{job.category}</span>
                    <h4 className="text-sm font-bold text-white mt-2 leading-tight">{job.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}>
                    {job.status === 'open' ? `${job.proposals.length} Bids` : 'Assigned'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-light mb-3">{job.description}</p>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold border-t border-zinc-800/40 pt-2.5">
                  <span>Budget: ₦{job.budget.toLocaleString()}</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ── Recommended For You ──────────────────────────────────── */}
      <div className="mb-6">

        {/* Section header */}
        <div className="flex items-center justify-between px-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Recommended for You</span>
          </div>
          <button
            onClick={() => navigate('/discover')}
            className="text-xs text-brand-400 font-semibold bg-brand-500/10 px-3 py-1 rounded-full hover:bg-brand-500/20 transition-colors"
          >
            See all
          </button>
        </div>

        {/* Scroll Snap Carousel — peek ~15% of next card */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={() => { isInteractedRef.current = true; }}
          onMouseDown={() => { isInteractedRef.current = true; }}
          className="flex overflow-x-auto gap-3 pl-5 pr-5 snap-x snap-mandatory no-scrollbar scroll-smooth w-full"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {recommended.map((art, idx) => (
            <div
              key={art.id}
              className="flex-[0_0_78%] shrink-0 snap-start flex flex-col"
            >
              {/* ── Card header: avatar + name (above image) ── */}
              <div className="flex items-center gap-2 mb-2 px-0.5">
                <img
                  src={art.avatarUrl}
                  alt={art.fullName}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-brand-500/30"
                />
                <span className="text-xs font-semibold text-zinc-200 truncate">{art.businessName}</span>
                {idx === 0 && (
                  <span className="ml-auto text-[9px] font-bold bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full shrink-0">
                    Top Pick
                  </span>
                )}
              </div>

              {/* ── Image card ── */}
              <div
                className="relative rounded-[22px] overflow-hidden cursor-pointer group"
                style={{ height: '320px' }}
                onClick={() => navigate(`/artisan/${art.id}`)}
              >
                {/* Portrait image */}
                <img
                  src={art.avatarUrl}
                  alt={art.fullName}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Flat black tint ── ensures white text always readable regardless of image */}
                <div className="absolute inset-0 bg-black/30" />
                {/* Gradient deepens toward bottom for caption legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* ── Bottom-left: caption + @handle ── */}
                <div className="absolute bottom-4 left-4 right-14 pr-1">
                  <p
                    className="text-xs font-semibold leading-snug line-clamp-2"
                    style={{ color: 'white' }}
                  >
                    {art.bio}
                  </p>
                  <span
                    className="text-[10px] font-bold mt-0.5 block"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    @{art.businessName.toLowerCase().replace(/\s+/g, '')}
                  </span>
                </div>

                {/* ── Bottom-right: stats stack ── */}
                <div className="absolute bottom-3 right-3 flex flex-col items-center gap-3">
                  {/* Rating */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Star size={15} color="white" variant="Broken" />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'white' }}>{art.ratingAverage.toFixed(1)}</span>
                  </div>

                  {/* Reviews */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <MessageText size={15} color="white" variant="Broken" />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'white' }}>{art.ratingCount}</span>
                  </div>

                  {/* Saves/Hearts */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Heart size={15} color="white" variant="Broken" />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'white' }}>{fakeCount(art.id, 200)}</span>
                  </div>

                  {/* Distance */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Location size={15} color="white" variant="Broken" />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'white' }}>{art.distanceKm}km</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {recommended.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? 'bg-brand-400 w-5' : 'bg-zinc-700 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Top Categories ──────────────────────────────────────── */}
      {(() => {
        const cats = mockDb.getServiceCategories().slice(0, 4);
        return (
          <div className="px-5 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Top Categories</span>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="text-xs text-brand-400 font-semibold bg-brand-500/10 px-3 py-1 rounded-full hover:bg-brand-500/20 transition-colors"
              >
                See all
              </button>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {cats.map(cat => {
                const catArtisans = mockDb.getArtisans(cat.id, '', {});
                const preview = catArtisans.slice(0, 2);
                const count = catArtisans.length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/discover?cat=${cat.id}`)}
                    className="bg-zinc-50 border border-zinc-200/60 rounded-[22px] p-4 text-left hover:border-brand-500/30 transition-all active:scale-95"
                  >
                    {/* Category name — no emoji */}
                    <p className="text-sm font-extrabold mb-3 leading-tight" style={{ color: '#09090b' }}>
                      {cat.name}
                    </p>

                    {/* Overlapping avatars + count badge */}
                    <div className="flex items-center">
                      {preview.map((art, i) => (
                        <img
                          key={art.id}
                          src={art.avatarUrl}
                          alt={art.fullName}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-50"
                          style={{ marginLeft: i === 0 ? 0 : -14, zIndex: i + 1, position: 'relative' }}
                        />
                      ))}
                      <div
                        className="h-11 w-11 rounded-full bg-brand-500 flex items-center justify-center ring-2 ring-zinc-50"
                        style={{ marginLeft: preview.length > 0 ? -14 : 0, zIndex: preview.length + 1, position: 'relative' }}
                      >
                        <span className="text-[10px] font-extrabold" style={{ color: 'white' }}>+{count}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── My Requests ──────────────────────────────────────────── */}
      <div className="px-5 flex-1 flex flex-col">
        <Requests />
      </div>

      {/* Create Opening Modal */}
      <Modal isOpen={showCreateJobModal} onOpenChange={setShowCreateJobModal}>
        <ModalBackdrop className="bg-black/60 backdrop-blur-sm" />
        <ModalContainer className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDialog className="bg-zinc-900 border border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden rounded-[28px] animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateJob}>
              <ModalHeader className="px-6 pt-6 pb-2 border-b border-zinc-800/80">
                <h3 className="text-base font-extrabold text-white">Post a Job Opening</h3>
              </ModalHeader>
              <ModalBody className="px-6 py-4 flex flex-col gap-4 text-left">
                <TextField className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Job Title</Label>
                  <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                    <input
                      type="text"
                      placeholder="e.g. Fit kitchen sink pipes"
                      required
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600"
                    />
                  </div>
                </TextField>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Category</Label>
                  <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                    <select
                      required
                      value={jobCategory}
                      onChange={e => setJobCategory(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" disabled className="bg-zinc-900">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Budget (₦)</Label>
                    <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        required
                        value={jobBudget}
                        onChange={e => setJobBudget(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </TextField>

                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Location Address</Label>
                    <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                      <input
                        type="text"
                        placeholder="e.g. Yaba, Lagos"
                        required
                        value={jobAddress}
                        onChange={e => setJobAddress(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600"
                      />
                    </div>
                  </TextField>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Job Description</Label>
                  <div className="p-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-start transition-colors">
                    <textarea
                      placeholder="Describe what needs to be done..."
                      required
                      rows={3}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600 resize-none min-h-[70px]"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="px-6 pb-6 pt-2 flex gap-3">
                <Button
                  onClick={() => setShowCreateJobModal(false)}
                  variant="outline"
                  className="flex-1 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold h-11 rounded-2xl text-xs transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isDisabled={postingJob}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold h-11 rounded-2xl text-xs shadow-xl shadow-brand-500/10 border-0 transition-all flex items-center justify-center gap-1.5"
                >
                  {postingJob ? <Spinner size="sm" color="current" /> : 'Post Opening'}
                </Button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </ModalContainer>
      </Modal>

      {/* Job Details & Bids Modal */}
      <Modal isOpen={showJobDetailsModal} onOpenChange={setShowJobDetailsModal}>
        <ModalBackdrop className="bg-black/60 backdrop-blur-sm" />
        <ModalContainer className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDialog className="bg-zinc-900 border border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden rounded-[28px] animate-in zoom-in-95 duration-200">
            {selectedJob && (
              <div className="flex flex-col max-h-[85vh]">
                <ModalHeader className="px-6 pt-6 pb-2 border-b border-zinc-800/80 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{selectedJob.category}</span>
                    <h3 className="text-base font-extrabold text-white mt-2.5 leading-snug">{selectedJob.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedJob.status === 'open' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {selectedJob.status === 'open' ? 'Open' : 'Assigned'}
                  </span>
                </ModalHeader>
                <ModalBody className="px-6 py-4 flex flex-col gap-4 overflow-y-auto no-scrollbar text-left">
                  {/* Job Details Card */}
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 text-left">
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-light mb-3">{selectedJob.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-500 font-semibold border-t border-zinc-800/40 pt-3">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-0.5">Budget</span>
                        <span className="text-zinc-200 font-bold">₦{selectedJob.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mb-0.5">Location</span>
                        <span className="text-zinc-200 font-bold truncate block">{selectedJob.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bids List Header */}
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                      <span>Proposals Received</span>
                      <span className="h-5 px-1.5 text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full flex items-center justify-center font-extrabold">{selectedJob.proposals.length}</span>
                    </h4>
                    
                    {selectedJob.proposals.length === 0 ? (
                      <div className="text-center py-8 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-xs text-zinc-550 font-light">No bids received yet.</p>
                        <p className="text-[10px] text-zinc-650 font-light mt-0.5">Local artisans are being notified.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedJob.proposals.map((prop: any) => (
                          <div key={prop.id} className="border border-zinc-800/80 rounded-2xl p-4 bg-zinc-950 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={prop.artisanAvatar} className="h-9 w-9 rounded-full object-cover ring-1 ring-brand-500/20" alt="" />
                              <div className="flex-1 min-w-0 text-left">
                                <h5 className="text-xs font-bold text-white truncate">{prop.artisanName}</h5>
                                <p className="text-[9px] text-zinc-500 font-semibold">{new Date(prop.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Bid Price</span>
                                <span className="text-xs font-black text-brand-400">₦{prop.price.toLocaleString()}</span>
                              </div>
                            </div>
                            {prop.note && (
                              <p className="text-[11px] text-zinc-400 italic bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-left leading-relaxed font-light">
                                "{prop.note}"
                              </p>
                            )}
                            {selectedJob.status === 'open' && (
                              <Button
                                onClick={() => handleAcceptBid(prop.id)}
                                size="sm"
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold h-9 rounded-xl text-[10px] border-0 transition-all flex items-center justify-center gap-1 shadow-md shadow-brand-500/10"
                              >
                                Accept Bid & Hire
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter className="px-6 pb-6 pt-2 border-t border-zinc-800/80">
                  <Button
                    onClick={() => setShowJobDetailsModal(false)}
                    variant="outline"
                    className="w-full border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold h-11 rounded-2xl text-xs transition-colors"
                  >
                    Close
                  </Button>
                </ModalFooter>
              </div>
            )}
          </ModalDialog>
        </ModalContainer>
      </Modal>
    </div>
  );
};

export default SeekerHome;

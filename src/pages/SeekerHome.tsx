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
  Label, toast, Spinner,
  Select, SelectTrigger, SelectValue, SelectPopover, ListBox, ListBoxItem,
  Popover, PopoverTrigger, PopoverContent
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

// ── Helpers ───────────────────────────────────────────────────────
const getArtisanOccupation = (artisan: ArtisanProfile) => {
  const name = artisan.businessName.toLowerCase();
  const bio = artisan.bio.toLowerCase();
  if (name.includes('plumb') || bio.includes('plumb')) return 'Plumber';
  if (name.includes('elect') || bio.includes('elect')) return 'Electrician';
  if (name.includes('carpen') || bio.includes('carpen') || name.includes('wood')) return 'Carpenter';
  if (name.includes('clean') || bio.includes('clean')) return 'Cleaner';
  if (name.includes('paint') || bio.includes('paint')) return 'Painter';
  if (name.includes('mechanic') || name.includes('auto') || bio.includes('mechanic')) return 'Mechanic';
  return 'Artisan';
};

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
  const [recentlyViewed, setRecentlyViewed] = useState<ArtisanProfile[]>([]);
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
  const [jobImage, setJobImage] = useState('');

  // Editing Fields
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobCategory, setEditJobCategory] = useState('');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobBudget, setEditJobBudget] = useState('');
  const [editJobAddress, setEditJobAddress] = useState('');
  const [editJobImage, setEditJobImage] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditJobImage(reader.result as string);
      } else {
        setJobImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Categories list
  const categories = mockDb.getServiceCategories();

  const startEditingJob = () => {
    if (!selectedJob) return;
    setEditJobTitle(selectedJob.title);
    setEditJobCategory(selectedJob.categoryId);
    setEditJobDescription(selectedJob.description);
    setEditJobBudget(String(selectedJob.budget));
    setEditJobAddress(selectedJob.address);
    setEditJobImage(selectedJob.imageUrl || '');
    setIsEditingJob(true);
  };

  const handleSaveChanges = () => {
    if (!selectedJob || !user) return;
    const budgetNum = parseFloat(editJobBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.warning('Please enter a valid budget.');
      return;
    }

    const success = mockDb.updateJobOpening(selectedJob.id, {
      title: editJobTitle,
      categoryId: editJobCategory,
      budget: budgetNum,
      address: editJobAddress,
      description: editJobDescription,
      imageUrl: editJobImage || undefined
    });

    if (success) {
      toast.success('Job details updated successfully!');
      fetchOpenings();
      setSelectedJob(mockDb.getJobOpeningById(selectedJob.id) || null);
      setIsEditingJob(false);
    } else {
      toast.warning('Failed to update job details.');
    }
  };

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
        jobAddress,
        jobImage || undefined
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
      setJobImage('');
      
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
    try {
      let stored = localStorage.getItem('hp_recently_viewed');
      if (!stored) {
        // Seed with first 3 mock profiles for presentation
        const seedIds = mockDb.getArtisans(undefined, '', {}).slice(0, 3).map(a => a.id);
        localStorage.setItem('hp_recently_viewed', JSON.stringify(seedIds));
        stored = JSON.stringify(seedIds);
      }
      const ids: string[] = JSON.parse(stored);
      const list = ids
        .map(id => mockDb.getArtisanById(id))
        .filter((art): art is ArtisanProfile => art !== undefined);
      setRecentlyViewed(list);
    } catch (e) {
      console.error('Failed to load recently viewed:', e);
    }
  }, []);

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
          <Popover 
            isOpen={showFilters} 
            onOpenChange={setShowFilters}
          >
            <PopoverTrigger>
              <button
                className={`h-11 w-11 flex items-center justify-center rounded-2xl border transition-all cursor-pointer ${
                  showFilters || hasActiveFilters
                    ? 'bg-brand-500 border-brand-400 text-white'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Setting4 size={18} color="currentColor" variant="Broken" />
              </button>
            </PopoverTrigger>
            <PopoverContent placement="bottom end" className="p-0 border-none bg-transparent shadow-none">
              <div className="glass border border-zinc-800/80 rounded-2xl p-4 w-72 text-left animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">Filters</span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-[10px] text-brand-400 font-bold hover:underline cursor-pointer">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          maxDistance === d ? 'bg-brand-500 border-brand-400 text-white' : 'border-zinc-800 text-zinc-400 bg-transparent'
                        }`}
                      >{d} km</button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Job Openings Trigger & List ── */}
      <div className="px-5 mb-6">
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-[22px] p-4 flex justify-between items-center">
          <div className="flex-1 pr-3">
            <h3 className="text-sm font-bold text-white mb-0.5">Need an Artisan?</h3>
            <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
              Post a request and get bids from vetted local pros.
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
                  setIsDescExpanded(false);
                  setShowJobDetailsModal(true);
                }}
                className="bg-white border border-zinc-150 rounded-[24px] p-4 cursor-pointer hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-extrabold text-zinc-900 leading-tight text-left">
                    {job.title}
                  </h4>
                  <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                    job.status === 'open' ? 'bg-emerald-500' : job.status === 'assigned' ? 'bg-blue-500' : 'bg-zinc-400'
                  }`} />
                </div>
                
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-light text-left break-words break-all">
                  {job.description}
                </p>
                
                <div className="border-t border-zinc-100/60 pt-3 flex justify-between items-center text-[10px] text-zinc-500 font-bold">
                  <span className="text-zinc-650">Budget: <strong className="text-zinc-800 font-extrabold">₦{job.budget.toLocaleString()}</strong></span>
                  <div className="flex items-center gap-2">
                    {job.status === 'open' && (
                      <span className="text-brand-600 font-extrabold bg-brand-50 border border-brand-100/50 px-2 py-0.5 rounded-full text-[9px]">{job.proposals.length} Bids</span>
                    )}
                    <span className="text-zinc-400 font-semibold">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
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
          className="flex overflow-x-auto gap-3 pl-5 pr-5 scroll-pl-5 scroll-pr-5 snap-x snap-mandatory no-scrollbar scroll-smooth w-full"
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
                <div className="relative shrink-0">
                  <img
                    src={art.avatarUrl}
                    alt={art.fullName}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-brand-500/30"
                  />
                  {idx === 0 && (
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-amber-450 text-white rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.15)] ring-1 ring-white">
                      {/* Premium Crown SVG */}
                      <svg 
                        className="h-2 w-2 text-zinc-950 fill-current" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                        <path d="M2 20h20v2H2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-zinc-200 truncate">{art.businessName}</span>
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

      {/* ── Recently Viewed ──────────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <div className="mb-6">
          {/* Header */}
          <div className="px-5 mb-3">
            <span className="text-sm font-bold text-white">Recently Viewed</span>
          </div>

          {/* Horizontal List */}
          <div 
            className="flex overflow-x-auto gap-3.5 pl-5 pr-5 scroll-pl-5 scroll-pr-5 no-scrollbar w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recentlyViewed.map(art => (
              <button
                key={art.id}
                onClick={() => navigate(`/artisan/${art.id}`)}
                className="flex flex-col items-center shrink-0 w-[72px] hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
              >
                {/* Avatar with gradient outline */}
                <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-brand-500/30 to-brand-500/10 p-[1.5px] shrink-0">
                  <img
                    src={art.avatarUrl}
                    alt={art.fullName}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
                {/* Name */}
                <span className="text-[10px] font-extrabold text-zinc-200 truncate w-full mt-1.5 leading-snug">
                  {art.fullName.split(' ')[0]}
                </span>
                {/* Occupation */}
                <span className="text-[8px] text-zinc-500 truncate w-full">
                  {getArtisanOccupation(art)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
      <Modal isOpen={showCreateJobModal} onOpenChange={(open) => { if (!open) setShowCreateJobModal(false); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-900 border border-zinc-800 w-full max-w-md shadow-2xl overflow-hidden rounded-[28px] animate-in zoom-in-95 duration-200 text-white outline-none h-fit">
            <ModalDialog className="outline-none w-full">
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
                  <Select 
                    selectedKey={jobCategory} 
                    onSelectionChange={(key) => setJobCategory(key as string)}
                    placeholder="Select category"
                  >
                    <SelectTrigger className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl h-11 px-3.5 text-xs text-white flex justify-between items-center transition-colors focus-within:border-brand-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1 text-white z-50 max-h-64 overflow-y-auto no-scrollbar outline-none">
                      <ListBox items={categories} className="outline-none">
                        {(cat) => (
                          <ListBoxItem
                            key={cat.id}
                            textValue={cat.name}
                            className="p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-brand-500/20 rounded-xl cursor-pointer outline-none transition-colors"
                          >
                            {cat.name}
                          </ListBoxItem>
                        )}
                      </ListBox>
                    </SelectPopover>
                  </Select>
                </div>

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

                {/* Picture of the problem */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Picture of the problem</Label>
                  <div className="border border-dashed border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 transition-colors relative overflow-hidden h-24 text-center">
                    {jobImage ? (
                      <>
                        <img src={jobImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setJobImage(''); }}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
                        >
                          <CloseCircle size={12} color="currentColor" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-zinc-450 font-bold">Tap to upload issue photo</span>
                        <span className="text-[8px] text-zinc-400">PNG, JPG up to 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
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
      </ModalBackdrop>
      </Modal>

      {/* Job Details & Bids Modal */}
      <Modal isOpen={showJobDetailsModal} onOpenChange={(open) => { if (!open) { setShowJobDetailsModal(false); setIsEditingJob(false); setIsDescExpanded(false); } }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-white border border-zinc-150 w-full max-w-md shadow-2xl overflow-hidden rounded-[28px] animate-in zoom-in-95 duration-200 text-zinc-800 outline-none h-fit">
            <ModalDialog className="outline-none w-full">
            {selectedJob && (
              <div className="flex flex-col max-h-[85vh] overflow-hidden">
                {selectedJob.imageUrl && !isEditingJob && (
                  <div className="w-full h-48 shrink-0 relative overflow-hidden">
                    <img src={selectedJob.imageUrl} className="w-full h-full object-cover" alt="Problem description" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
                <ModalHeader className="px-6 pt-6 pb-3 border-b border-zinc-100 flex justify-between items-start text-left gap-4">
                  <h3 className="text-base font-extrabold text-zinc-900 leading-snug">{selectedJob.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedJob.status === 'open' && !isEditingJob && (
                      <Button
                        onClick={startEditingJob}
                        size="sm"
                        className="h-7 px-3 rounded-lg text-[9px] font-bold border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 flex items-center gap-1 transition-all"
                      >
                        Edit Details
                      </Button>
                    )}
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      selectedJob.status === 'open' ? 'bg-emerald-500' : selectedJob.status === 'assigned' ? 'bg-blue-500' : 'bg-zinc-400'
                    }`} />
                  </div>
                </ModalHeader>
                <ModalBody className="px-6 py-4 flex flex-col gap-4 overflow-y-auto no-scrollbar text-left">
                  {isEditingJob ? (
                    <div className="flex flex-col gap-4">
                      <TextField className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Job Title</Label>
                        <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                          <input
                            type="text"
                            required
                            value={editJobTitle}
                            onChange={e => setEditJobTitle(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                      </TextField>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Category</Label>
                        <Select 
                          selectedKey={editJobCategory} 
                          onSelectionChange={(key) => setEditJobCategory(key as string)}
                          placeholder="Select category"
                        >
                          <SelectTrigger className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl h-11 px-3.5 text-xs text-white flex justify-between items-center transition-colors focus-within:border-brand-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectPopover className="bg-zinc-950 border border-zinc-800 rounded-2xl p-1 text-white z-50 max-h-64 overflow-y-auto no-scrollbar outline-none">
                            <ListBox items={categories} className="outline-none">
                              {(cat) => (
                                <ListBoxItem
                                  key={cat.id}
                                  textValue={cat.name}
                                  className="p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-brand-500/20 rounded-xl cursor-pointer outline-none transition-colors"
                                >
                                  {cat.name}
                                </ListBoxItem>
                              )}
                            </ListBox>
                          </SelectPopover>
                        </Select>
                      </div>

                      <TextField className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Budget (₦)</Label>
                        <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                          <input
                            type="number"
                            required
                            value={editJobBudget}
                            onChange={e => setEditJobBudget(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                      </TextField>

                      <TextField className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Location Address</Label>
                        <div className="h-11 px-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-center transition-colors">
                          <input
                            type="text"
                            required
                            value={editJobAddress}
                            onChange={e => setEditJobAddress(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                      </TextField>

                      {/* Edit Picture of the problem */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Picture of the problem</Label>
                        <div className="border border-dashed border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 transition-colors relative overflow-hidden h-24 text-center">
                          {editJobImage ? (
                            <>
                              <img src={editJobImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditJobImage(''); }}
                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
                              >
                                <CloseCircle size={12} color="currentColor" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-zinc-450 font-bold">Tap to upload issue photo</span>
                              <span className="text-[8px] text-zinc-400">PNG, JPG up to 5MB</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Job Description</Label>
                        <div className="p-3.5 bg-zinc-950 border border-zinc-800 focus-within:border-brand-500 rounded-2xl flex items-start transition-colors">
                          <textarea
                            required
                            rows={3}
                            value={editJobDescription}
                            onChange={e => setEditJobDescription(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none resize-none min-h-[70px]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Job Details Card */}
                      <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-left shadow-sm">
                        <p className="text-xs text-zinc-650 leading-relaxed font-light mb-4 block whitespace-pre-line break-words break-all">
                          {(() => {
                            const desc = selectedJob.description.trim();
                            if (desc.length <= 150 || isDescExpanded) {
                              return (
                                <>
                                  {desc}
                                  {desc.length > 150 && (
                                    <button
                                      type="button"
                                      onClick={() => setIsDescExpanded(false)}
                                      className="text-brand-500 hover:text-brand-600 font-bold ml-1 transition-colors text-[10px] focus:outline-none"
                                    >
                                      See Less
                                    </button>
                                  )}
                                </>
                              );
                            }
                            return (
                              <>
                                {desc.slice(0, 150)}...
                                <button
                                  type="button"
                                  onClick={() => setIsDescExpanded(true)}
                                  className="text-brand-500 hover:text-brand-600 font-bold ml-1 transition-colors text-[10px] focus:outline-none"
                                >
                                  See More
                                </button>
                              </>
                            );
                          })()}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-500 font-bold border-t border-zinc-200/60 pt-3">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-extrabold mb-0.5">Budget</span>
                            <span className="text-zinc-800 font-extrabold text-xs block mt-0.5">₦{selectedJob.budget.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-extrabold mb-0.5">Location</span>
                            <span className="text-zinc-700 font-extrabold text-xs block mt-0.5 leading-snug">{selectedJob.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bids List Header */}
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-800 mb-3 flex items-center gap-1.5">
                          <span>Proposals Received</span>
                          <span className="h-5 px-2 text-[9px] bg-zinc-100 border border-zinc-200/80 text-zinc-600 rounded-full flex items-center justify-center font-extrabold">{selectedJob.proposals.length}</span>
                        </h4>
                        
                        {selectedJob.proposals.length === 0 ? (
                          <div className="text-center py-8 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl shadow-inner-sm">
                            <p className="text-xs text-zinc-500 font-bold">No bids received yet</p>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Local artisans are being notified.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {selectedJob.proposals.map((prop: any) => (
                              <div key={prop.id} className="border border-zinc-200/70 rounded-2xl p-4 bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-3">
                                  <img src={prop.artisanAvatar} className="h-9 w-9 rounded-full object-cover ring-1 ring-brand-500/20" alt="" />
                                  <div className="flex-1 min-w-0 text-left">
                                    <h5 className="text-xs font-extrabold text-zinc-900 truncate">{prop.artisanName}</h5>
                                    <p className="text-[9px] text-zinc-400 font-bold">{new Date(prop.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold block mb-0.5">Bid Price</span>
                                    <span className="text-xs font-extrabold text-brand-600">₦{prop.price.toLocaleString()}</span>
                                  </div>
                                </div>
                                {prop.note && (
                                  <p className="text-xs text-zinc-650 italic bg-zinc-50 border border-zinc-150 p-2.5 rounded-xl text-left leading-relaxed font-light break-words break-all">
                                    "{prop.note}"
                                  </p>
                                )}
                                {selectedJob.status === 'open' && (
                                  <Button
                                    onClick={() => handleAcceptBid(prop.id)}
                                    size="sm"
                                    className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold h-9 rounded-xl text-[10px] border border-brand-200/50 transition-all flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    Accept Bid & Hire
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </ModalBody>
                <ModalFooter className="px-6 pb-6 pt-3 border-t border-zinc-100 flex gap-3">
                  {isEditingJob ? (
                    <>
                      <Button
                        onClick={() => setIsEditingJob(false)}
                        variant="outline"
                        className="flex-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold h-11 rounded-2xl text-xs transition-all"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold h-11 rounded-2xl text-xs shadow-md shadow-brand-500/10 border-0 transition-all"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setShowJobDetailsModal(false)}
                      variant="outline"
                      className="w-full border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold h-11 rounded-2xl text-xs transition-all"
                    >
                      Close
                    </Button>
                  )}
                </ModalFooter>
              </div>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
      </Modal>
    </div>
  );
};

export default SeekerHome;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockDb, type ArtisanProfile, type ServiceCategory } from '../services/mockDb';
import { SearchNormal1, Star, Setting4, Flash, CloseCircle, Setting, Designtools, Brush, Paintbucket, Car } from 'iconsax-react';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// ── Category Icon Helper ──────────────────────────────────────────
const getCategoryIcon = (key: string, isSelected: boolean) => {
  const size = 16;
  const variant = "Broken";
  const color = "currentColor";
  const className = isSelected ? "text-white shrink-0" : "text-brand-400 shrink-0";

  switch (key.toLowerCase()) {
    case 'plumbing':
      return <Setting size={size} variant={variant} color={color} className={className} />;
    case 'electrical':
      return <Flash size={size} variant={variant} color={color} className={className} />;
    case 'carpentry':
      return <Designtools size={size} variant={variant} color={color} className={className} />;
    case 'cleaning':
      return <Brush size={size} variant={variant} color={color} className={className} />;
    case 'painting':
      return <Paintbucket size={size} variant={variant} color={color} className={className} />;
    case 'mechanic':
    case 'auto repair':
      return <Car size={size} variant={variant} color={color} className={className} />;
    default:
      return <Setting size={size} variant={variant} color={color} className={className} />;
  }
};

// ── Artisan Occupation Helper ─────────────────────────────────────
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

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('cat')
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter settings
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCategories(mockDb.getServiceCategories());
    loadArtisans();
  }, [selectedCategory, searchQuery, minRating, maxDistance]);

  const loadArtisans = () => {
    const list = mockDb.getArtisans(
      selectedCategory || undefined,
      searchQuery,
      { minRating, maxDistance }
    );
    setArtisans(list);
  };

  const handleCategorySelect = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
  };

  const clearFilters = () => {
    setMinRating(undefined);
    setMaxDistance(undefined);
    setSelectedCategory(null);
    setSearchQuery('');
    setShowFilters(false);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 animate-in fade-in pb-20">

      {/* Search and Filters Section */}
      <div className="flex gap-2 mb-6 items-center">
        <div className="flex-1 flex items-center gap-2.5 px-3.5 h-11 border border-zinc-800 rounded-2xl bg-zinc-900/60 focus-within:border-brand-500/70 transition-colors">
          <SearchNormal1 size={16} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search plumbing, wiring, cleaning…"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
              <CloseCircle size={14} color="currentColor" variant="Broken" />
            </button>
          )}
        </div>
        
        <Popover isOpen={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger>
            <button
              className={`h-11 w-11 flex items-center justify-center rounded-2xl border transition-all cursor-pointer ${
                showFilters || minRating !== undefined || maxDistance !== undefined
                  ? 'bg-brand-500 border-brand-400 text-white'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
            >
              <Setting4 size={18} color="currentColor" variant="Broken" />
            </button>
          </PopoverTrigger>
          <PopoverContent placement="bottom end" className="p-0 border-none bg-transparent shadow-none">
            <div className="glass border border-zinc-800/80 rounded-2xl p-4 w-72 text-left animate-in fade-in slide-in-from-top-2 duration-150 text-white flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white">Search Filters</span>
                {(minRating !== undefined || maxDistance !== undefined) && (
                  <button 
                    onClick={clearFilters} 
                    className="text-[10px] text-brand-400 font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Rating Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Minimum Rating</span>
                <div className="flex gap-2">
                  {[4.0, 4.5, 4.8].map(stars => (
                    <button 
                      key={stars}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${minRating === stars ? 'bg-brand-500 border-brand-400 text-white' : 'glass border-zinc-800 text-zinc-400 bg-transparent'}`}
                      onClick={() => setMinRating(minRating === stars ? undefined : stars)}
                    >
                      ★ {stars}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Maximum Distance</span>
                <div className="flex gap-2">
                  {[2, 5, 10].map(dist => (
                    <button 
                      key={dist}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${maxDistance === dist ? 'bg-brand-500 border-brand-400 text-white' : 'glass border-zinc-800 text-zinc-400 bg-transparent'}`}
                      onClick={() => setMaxDistance(maxDistance === dist ? undefined : dist)}
                    >
                      Within {dist}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Categories Row */}
      <div className="text-left mb-6">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Service Categories</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all h-9 cursor-pointer ${
                  isSelected 
                    ? 'bg-brand-500 border-brand-400 text-white scale-105 shadow-md shadow-brand-500/20' 
                    : 'glass border-zinc-850 text-zinc-300 hover:border-zinc-700 bg-transparent'
                }`}
              >
                {getCategoryIcon(cat.key, isSelected)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artisans List */}
      <div className="text-left flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Nearby Professionals</h3>
          <span className="text-[10px] text-zinc-500 font-semibold">{artisans.length} found</span>
        </div>

        <div className="glass border border-zinc-850 rounded-[28px] overflow-hidden">
          {artisans.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No artisans found matching your query/filters.
            </div>
          ) : (
            <div className="flex flex-col">
              {artisans.map((art, idx) => (
                <div key={art.id} className="flex flex-col animate-in fade-in duration-200">
                  <div 
                    className="p-4 flex flex-row items-center justify-between cursor-pointer hover:bg-zinc-50/40 active:bg-zinc-100/40 transition-colors"
                    onClick={() => navigate(`/artisan/${art.id}`)}
                  >
                    {/* Far Left: Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={art.avatarUrl} 
                        className="h-13 w-13 rounded-2xl object-cover border border-zinc-200 shadow-sm" 
                        alt={art.fullName} 
                      />
                      {/* Gold Crown badge */}
                      {idx === 0 && (
                        <div className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 rounded-full flex items-center justify-center shadow-md ring-1 ring-white z-20">
                          <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                            <path d="M2 20h20v2H2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Center Section: Name, occupation & distance beside that */}
                    <div className="flex-1 min-w-0 ml-3.5 flex flex-col justify-center text-left">
                      <h4 className="font-extrabold text-sm text-zinc-900 truncate">
                        {art.fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-brand-600 font-extrabold uppercase tracking-wider truncate max-w-[100px]">
                          {getArtisanOccupation(art)}
                        </span>
                        <span className="text-[10px] text-zinc-300 font-bold">•</span>
                        <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                          {art.distanceKm} km away
                        </span>
                      </div>
                    </div>

                    {/* Far Right Section: Price & Rating under that */}
                    <div className="shrink-0 text-right flex flex-col items-end justify-center pl-2">
                      <span className="font-extrabold text-sm text-zinc-900">
                        ₦{art.pricing.calloutFee.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-0.5 mt-0.5 text-amber-600 text-[10px] font-bold">
                        <Star size={10} color="#eab308" variant="Bold" className="text-amber-500" />
                        <span>{art.ratingAverage.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Separator line - not touching the edges */}
                  {idx < artisans.length - 1 && (
                    <div className="mx-4 h-px bg-zinc-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;

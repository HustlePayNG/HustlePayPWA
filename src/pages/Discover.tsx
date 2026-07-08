import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockDb, type ArtisanProfile, type ServiceCategory } from '../services/mockDb';
import { SearchNormal1, Star, Location, Setting4, Flash } from 'iconsax-react';
import { Input, Button } from '@heroui/react';

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
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="text-left mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs text-brand-400 uppercase tracking-widest font-bold flex items-center gap-1">
            <Flash size={12} color="currentColor" variant="Broken" /> Explore Services
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">Discover Professionals</h2>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="flex gap-2 mb-6 items-center">
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 transition-colors h-11">
          <SearchNormal1 size={18} color="currentColor" variant="Broken" className="text-zinc-500 shrink-0" />
          <Input
            type="text"
            placeholder="Search plumbing, wiring, cleaning..."
            className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          className={`h-11 w-11 flex items-center justify-center border border-zinc-800 rounded-xl transition-all ${showFilters ? 'bg-brand-500 border-brand-400 text-white' : 'text-zinc-300 hover:bg-zinc-900 bg-transparent'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Setting4 size={18} color="currentColor" variant="Broken" />
        </Button>
      </div>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <div className="glass border border-zinc-800/80 p-4 mb-6 rounded-2xl animate-in slide-in-from-top duration-150">
          <div className="p-0 text-left flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white">Search Filters</span>
              <Button 
                onClick={clearFilters} 
                className="text-[10px] text-brand-400 font-bold hover:underline p-0 h-auto min-w-0 bg-transparent inline"
              >
                Clear All
              </Button>
            </div>
            
            {/* Rating Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Minimum Rating</span>
              <div className="flex gap-2">
                {[4.0, 4.5, 4.8].map(stars => (
                  <Button 
                    key={stars}
                    size="sm"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${minRating === stars ? 'bg-brand-500 border-brand-400 text-white' : 'glass border-zinc-800 text-zinc-400 bg-transparent'}`}
                    onClick={() => setMinRating(stars)}
                  >
                    ★ {stars}+
                  </Button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Maximum Distance</span>
              <div className="flex gap-2">
                {[2, 5, 10].map(dist => (
                  <Button 
                    key={dist}
                    size="sm"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${maxDistance === dist ? 'bg-brand-500 border-brand-400 text-white' : 'glass border-zinc-800 text-zinc-400 bg-transparent'}`}
                    onClick={() => setMaxDistance(dist)}
                  >
                    Within {dist}km
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Row */}
      <div className="text-left mb-6">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">Service Categories</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all h-9 ${isSelected ? 'bg-brand-500 border-brand-400 text-white scale-105 shadow-md shadow-brand-500/20' : 'glass border-zinc-850 text-zinc-300 hover:border-zinc-700 bg-transparent'}`}
              >
                <span>{cat.name}</span>
              </Button>
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

        <div className="flex flex-col gap-4">
          {artisans.length === 0 ? (
            <div className="glass border border-zinc-900 rounded-3xl p-8 text-center text-zinc-500 text-xs">
              No artisans found matching your query/filters.
            </div>
          ) : (
            artisans.map(art => (
              <div 
                key={art.id} 
                className="glass border border-zinc-850 hover:border-zinc-750 transition-all rounded-[28px] cursor-pointer p-4 flex flex-row items-center gap-4"
                onClick={() => navigate(`/artisan/${art.id}`)}
              >
                <img src={art.avatarUrl} className="h-16 w-16 border-2 border-brand-500/20 rounded-2xl object-cover shrink-0" alt="" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <h4 className="font-extrabold text-sm text-white truncate">{art.fullName}</h4>
                    <div className="flex items-center gap-0.5 text-warning-400 text-xs font-bold shrink-0">
                      <Star size={12} color="currentColor" variant="Broken" className="fill-warning-400 text-warning-400" />
                      <span>{art.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <span className="text-[11px] text-brand-300 font-bold block truncate mt-0.5">
                    {art.businessName}
                  </span>

                  <p className="text-xs text-zinc-400 truncate mt-1 leading-relaxed font-light">
                    {art.bio}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-1 text-zinc-400 font-semibold">
                      <Location size={10} color="currentColor" variant="Broken" className="text-brand-400" />
                      <span>{art.distanceKm} km away</span>
                    </div>
                    <div className="font-bold text-white bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                      Call-out: ₦{art.pricing.calloutFee.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;

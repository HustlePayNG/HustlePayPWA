import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDb, type ArtisanProfile, type ArtisanPost } from '../services/mockDb';
import { Star, Location, Award, Calendar, ArrowLeft, TickCircle, Heart } from 'iconsax-react';
import { Button, toast } from '@heroui/react';

export const ArtisanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artisan, setArtisan] = useState<ArtisanProfile | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customRequest, setCustomRequest] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [posts, setPosts] = useState<ArtisanPost[]>([]);

  useEffect(() => {
    if (id) {
      setArtisan(mockDb.getArtisanById(id));
      setPosts(mockDb.getPostsByArtisan(id));
      try {
        const stored = localStorage.getItem('hp_recently_viewed');
        let list: string[] = stored ? JSON.parse(stored) : [];
        list = [id, ...list.filter(item => item !== id)].slice(0, 5);
        localStorage.setItem('hp_recently_viewed', JSON.stringify(list));
      } catch (e) {
        console.error('Failed to track recently viewed:', e);
      }
    }
  }, [id]);

  if (!artisan) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-zinc-955 p-6">
        <span className="text-zinc-400 text-xs">Loading profile...</span>
      </div>
    );
  }

  const handleBook = () => {
    if (useCustom) {
      if (!customRequest.trim()) {
        toast.warning('Please describe your custom request before booking.');
        return;
      }
      navigate(`/booking-flow/${artisan.id}?custom=${encodeURIComponent(customRequest.trim())}`);
      return;
    }
    if (!selectedServiceId) {
      toast.warning('Please select a service before booking.');
      return;
    }
    navigate(`/booking-flow/${artisan.id}?serviceId=${selectedServiceId}`);
  };

  const canBook = useCustom ? customRequest.trim().length > 0 : !!selectedServiceId;

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-24">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="h-10 w-10 flex items-center justify-center bg-zinc-100/50 hover:bg-zinc-200/50 rounded-full text-zinc-600 mb-5 cursor-pointer transition-all active:scale-90 shrink-0"
      >
        <ArrowLeft size={18} color="currentColor" variant="Broken" />
      </button>

      {/* Single unified profile card */}
      <div className="glass border-none rounded-[28px] overflow-hidden mb-5">

        {/* Profile header */}
        <div className="p-5 flex items-center gap-4">
          <img
            src={artisan.avatarUrl}
            className="h-16 w-16 rounded-2xl object-cover shrink-0 shadow-sm"
            alt={artisan.fullName}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-zinc-900 truncate">{artisan.fullName}</h2>
            <span className="text-xs text-brand-600 font-bold block">{artisan.businessName}</span>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star size={11} color="currentColor" variant="Bold" />
                <span>{artisan.ratingAverage.toFixed(1)}</span>
                <span className="text-zinc-400 font-normal">({artisan.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Location size={11} color="currentColor" variant="Broken" className="text-brand-400" />
                <span>{artisan.distanceKm} km away</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={11} color="currentColor" variant="Broken" className="text-brand-400" />
                <span>{artisan.yearsExperience} yrs exp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-zinc-100" />

        {/* Bio */}
        <div className="px-5 py-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">{artisan.bio}</p>
        </div>

        <div className="mx-5 h-px bg-zinc-100" />

        {/* Pricing callout */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-500">Commitment Call-out Fee</span>
            <span className="font-extrabold text-zinc-900 text-sm">₦{artisan.pricing.calloutFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-zinc-500">Base Billing Model</span>
            <span className="text-[11px] font-semibold text-zinc-700 capitalize">
              {artisan.pricing.rateType === 'hourly' ? 'Hourly Rate' : 'Fixed Rate'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
            * Call-out fee is paid now to confirm the booking. Final balance is agreed on-site and confirmed upon job completion.
          </p>
        </div>

        <div className="mx-5 h-px bg-zinc-100" />

        {/* Services */}
        <div className="px-5 py-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Select a Service</h3>
          <div className="flex flex-col gap-2">
          {artisan.services.map(srv => {
              const isSelected = !useCustom && selectedServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setUseCustom(false);
                    setCustomRequest('');
                  }}
                  className={`p-3.5 border rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/60'
                      : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <TickCircle size={13} color="currentColor" variant="Bold" className="text-brand-500 shrink-0" />
                        )}
                        <span className={`font-bold text-xs block ${isSelected ? 'text-brand-700' : 'text-zinc-800'}`}>
                          {srv.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-normal block mt-0.5 font-light">
                        {srv.description}
                      </span>
                    </div>
                    <span className={`font-extrabold text-xs shrink-0 ${isSelected ? 'text-brand-600' : 'text-zinc-600'}`}>
                      ₦{srv.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Custom service request */}
            <div
              onClick={() => {
                setUseCustom(true);
                setSelectedServiceId(null);
              }}
              className={`p-3.5 border rounded-2xl cursor-pointer transition-all ${
                useCustom
                  ? 'border-brand-500 bg-brand-50/60'
                  : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                {useCustom && (
                  <TickCircle size={13} color="currentColor" variant="Bold" className="text-brand-500 shrink-0" />
                )}
                <span className={`font-bold text-xs ${useCustom ? 'text-brand-700' : 'text-zinc-800'}`}>
                  Custom Request
                </span>
                <span className="ml-auto text-[10px] text-zinc-400 font-normal">Describe your job</span>
              </div>
              {useCustom && (
                <textarea
                  value={customRequest}
                  onChange={e => setCustomRequest(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="e.g. I need my kitchen ceiling replastered and painted white, approx 3m × 4m area…"
                  rows={3}
                  maxLength={300}
                  className="w-full text-[11px] text-zinc-700 bg-white/70 border border-zinc-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-brand-400 placeholder:text-zinc-300 leading-relaxed"
                />
              )}
              {useCustom && (
                <p className="text-[10px] text-zinc-400 mt-1.5">{customRequest.length}/300 characters</p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-zinc-100" />

        {/* Availability */}
        <div className="px-5 py-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Calendar size={12} color="currentColor" variant="Broken" className="text-brand-400" />
            Weekly Availability
          </h3>
          <div className="flex flex-col gap-2">
            {artisan.availability.map(day => (
              <div key={day.weekday} className="flex justify-between items-center text-[11px]">
                <span className={`font-semibold ${day.enabled ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  {day.weekday}
                </span>
                <span className={day.enabled ? 'text-zinc-500' : 'text-zinc-300'}>
                  {day.enabled ? `${day.startTime} – ${day.endTime}` : 'Not available'}
                </span>
              </div>
            ))}
          </div>
        </div>

          {/* Book button inside card */}
          <div className="px-5 pb-5">
            <Button
              className={`w-full font-bold h-11 rounded-2xl text-white transition-all shadow-md ${
                canBook
                  ? 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
              }`}
              onClick={handleBook}
              isDisabled={!canBook}
            >
              {useCustom
                ? (customRequest.trim() ? 'Book · Custom Request' : 'Describe your request to book')
                : (selectedServiceId
                    ? `Book · ₦${artisan.pricing.calloutFee.toLocaleString()} call-out`
                    : 'Select a service to book')}
            </Button>
          </div>

      </div>

      {/* Posts section */}
      {posts.length > 0 && (
        <div className="glass border-none rounded-[28px] overflow-hidden mb-5">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Posts</h3>
            <span className="text-[10px] text-zinc-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100">
            {posts.map(post => (
              <div key={post.id} className="px-5 py-4">
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-3 bg-zinc-100">
                    <img
                      src={post.imageUrl}
                      alt={post.category}
                      className="w-full h-44 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full border border-brand-100">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-auto">
                    {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">{post.caption}</p>
                <div className="flex items-center gap-1 mt-2 text-zinc-400">
                  <Heart size={12} color="currentColor" variant="Broken" />
                  <span className="text-[10px]">{post.likesCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ArtisanDetail;

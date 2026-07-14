import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockDb, type ArtisanProfile } from '../services/mockDb';
import { Star, Location, Award, Calendar, ArrowLeft } from 'iconsax-react';
import { Button, toast } from '@heroui/react';

export const ArtisanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [artisan, setArtisan] = useState<ArtisanProfile | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setArtisan(mockDb.getArtisanById(id));
      // Track recently viewed
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
      <div className="flex-1 flex flex-col justify-center items-center bg-zinc-950 p-6">
        <span className="text-zinc-500 text-xs">Loading Artisan profile...</span>
      </div>
    );
  }

  const handleBook = () => {
    if (!selectedServiceId) {
      toast.warning('Please select a service before booking.');
      return;
    }
    navigate(`/booking-flow/${artisan.id}?serviceId=${selectedServiceId}`);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in pb-20">
      {/* Header back button */}
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} color="currentColor" variant="Broken" />
        </Link>
        <span className="text-sm font-bold text-zinc-400">Back to Discovery</span>
      </div>

      {/* Main Profile Info */}
      <div className="flex gap-4 items-center mb-6">
        <img src={artisan.avatarUrl} className="h-20 w-20 border-2 border-brand-500/30 rounded-2xl shrink-0 object-cover" alt="" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold text-white truncate">{artisan.fullName}</h2>
          <span className="text-xs text-brand-300 font-bold block">{artisan.businessName}</span>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            <div className="flex items-center gap-0.5 font-bold text-warning-400">
              <Star size={12} color="currentColor" variant="Broken" className="fill-warning-400 text-warning-400" />
              <span>{artisan.ratingAverage.toFixed(1)}</span>
              <span className="text-[10px] text-zinc-500">({artisan.ratingCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Location size={12} color="currentColor" variant="Broken" className="text-brand-400" />
              <span>{artisan.distanceKm} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Award size={12} color="currentColor" variant="Broken" className="text-brand-400" />
              <span>{artisan.yearsExperience} yrs exp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio section */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">About The Artisan</h3>
        <p className="text-xs text-zinc-300 leading-relaxed font-light glass border border-zinc-900 rounded-2xl p-4">
          {artisan.bio}
        </p>
      </div>

      {/* Booking Rate and Callout Banner */}
      <div className="glass border border-brand-500/20 bg-brand-500/5 p-4 rounded-2xl flex flex-col gap-1.5 mb-6 text-xs leading-relaxed border">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Commitment Call-out Fee:</span>
          <span className="font-extrabold text-white text-sm">₦{artisan.pricing.calloutFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Base Billing Model:</span>
          <span className="font-semibold text-zinc-300 capitalize">{artisan.pricing.rateType === 'hourly' ? 'Hourly rate' : 'Fixed rate'}</span>
        </div>
        <div className="h-px bg-zinc-800 my-1"></div>
        <div className="text-[10px] text-zinc-500 text-left">
          * Note: You will pay the call-out fee now to book. The final balance will be proposed by the artisan on-site and confirmed by you upon job completion.
        </div>
      </div>

      {/* Selectable Services */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select a Service Offered</h3>
        <div className="flex flex-col gap-3">
          {artisan.services.map(srv => {
            const isSelected = selectedServiceId === srv.id;
            return (
              <div 
                key={srv.id}
                onClick={() => setSelectedServiceId(srv.id)}
                className={`p-4 border rounded-3xl cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-500/10 shadow-lg' : 'glass border border-zinc-850 hover:border-zinc-800'}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="text-left">
                    <span className="font-bold text-xs text-white block">{srv.name}</span>
                    <span className="text-[10px] text-zinc-400 leading-normal block mt-1 font-light">{srv.description}</span>
                  </div>
                  <span className="font-extrabold text-xs text-brand-300 shrink-0">
                    ₦{srv.price.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability schedule */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Calendar size={14} color="currentColor" variant="Broken" className="text-brand-400" /> Weekly Availability Schedule
        </h3>
        <div className="glass border border-zinc-900 rounded-3xl p-4 flex flex-col gap-2">
          {artisan.availability.map(day => (
            <div key={day.weekday} className="flex justify-between items-center text-xs">
              <span className={`font-semibold ${day.enabled ? 'text-zinc-300' : 'text-zinc-650'}`}>{day.weekday}</span>
              <span className="text-[10px]">
                {day.enabled ? `${day.startTime} - ${day.endTime}` : <span className="text-zinc-700">Not Available</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Book CTA button */}
      <div className="sticky bottom-20 z-10 py-3 bg-zinc-950/80 backdrop-blur-md">
        <Button
          className="w-full font-bold h-11 bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/20 text-white transition-all"
          onClick={handleBook}
          isDisabled={!selectedServiceId}
        >
          {selectedServiceId ? 'Book & Pay Call-out Fee' : 'Select a Service to Book'}
        </Button>
      </div>
    </div>
  );
};

export default ArtisanDetail;

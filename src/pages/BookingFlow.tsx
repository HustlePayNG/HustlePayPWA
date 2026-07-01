import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { mockDb, type ArtisanProfile } from '../services/mockDb';
import { useAppStore } from '../store';
import { ArrowLeft, Gallery, Flash, TickCircle } from 'iconsax-react';
import { TextArea, Button, Spinner } from '@heroui/react';

export const BookingFlow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const navigate = useNavigate();

  const { user, wallet, refreshWallet, refreshBookings } = useAppStore();
  const [artisan, setArtisan] = useState<ArtisanProfile | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<{ id: string; name: string; price: number } | null>(null);
  
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Inputs, 2: Confirmation Success

  useEffect(() => {
    if (id) {
      const art = mockDb.getArtisanById(id);
      setArtisan(art);
      if (art && serviceId) {
        const srv = art.services.find(s => s.id === serviceId);
        if (srv) {
          setSelectedService(srv);
        }
      }
    }
    refreshWallet();
  }, [id, serviceId]);

  const handleAddMockPhoto = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60'
    ];
    const randomUrl = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setPhotos([...photos, randomUrl]);
  };

  const handleConfirmBooking = () => {
    if (!artisan || !selectedService) return;
    
    // Check wallet balance
    if (!wallet || wallet.balance < artisan.pricing.calloutFee) {
      alert(`Insufficient funds. Your balance is ₦${wallet?.balance.toLocaleString()} but this booking requires a ₦${artisan.pricing.calloutFee.toLocaleString()} call-out fee. Please fund your wallet.`);
      navigate('/wallet');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Create actual booking record in state store
      mockDb.createBooking(
        user?.id || 'unknown',
        artisan.id,
        selectedService.name,
        description,
        photos,
        new Date(Date.now() + 24*60*60*1000).toISOString()
      );

      // Update global store
      refreshBookings();
      refreshWallet();

      setLoading(false);
      setStep(2);
    }, 1500);
  };

  if (!artisan || !selectedService) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-white p-6">
        <span className="text-zinc-500 text-xs">Invalid service selection.</span>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-zinc-950 text-center animate-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-500/10 text-success-500 mb-6">
          <TickCircle size={36} color="currentColor" variant="Broken" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Booking Confirmed!</h2>
        <p className="mt-2.5 text-xs text-zinc-400 max-w-xs leading-relaxed font-light">
          Your commitment fee of ₦{artisan.pricing.calloutFee.toLocaleString()} has been locked in escrow. 
          The artisan has been notified to proceed.
        </p>

        <div className="w-full max-w-xs flex flex-col gap-2.5 mt-8">
          <Button
            className="w-full font-bold h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all"
            onClick={() => navigate('/requests')}
          >
            Track Request Status
          </Button>
          <Button
            className="w-full font-bold text-zinc-400 hover:text-white transition-all bg-transparent py-2.5 h-11"
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-950 text-left animate-in fade-in pb-24">
      {/* Header back button */}
      <div className="flex items-center gap-2 mb-6">
        <Link to={`/artisan/${artisan.id}`} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} color="currentColor" variant="Broken" />
        </Link>
        <span className="text-sm font-bold text-zinc-400">Back to Profile</span>
      </div>

      <h2 className="text-2xl font-extrabold text-white mb-2">Book Service</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Provide details about the issue and confirm payment of the commitment call-out fee.
      </p>

      {/* Booking Summary Box */}
      <div className="glass border border-zinc-900 p-4 mb-6 rounded-2xl flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider">Artisan:</span>
          <span className="font-bold text-white">{artisan.fullName}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider">Selected Service:</span>
          <span className="font-bold text-brand-300">{selectedService.name}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider">Estimated Labor Price:</span>
          <span className="font-extrabold text-white">₦{selectedService.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Description Inputs */}
      <div className="flex flex-col gap-4 mb-6 text-left">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Describe the problem</label>
          <TextArea
            placeholder="Tell the artisan what is wrong (e.g. toilet sink is leaking brown water from the piping underneath)..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full text-xs text-white bg-zinc-900 border border-zinc-850 rounded-xl p-3.5 focus:border-brand-500 outline-none min-h-[100px]"
          />
        </div>

        {/* Photos attachments */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Upload Job Photos</label>
          <div className="flex gap-3 flex-wrap">
            {photos.map((src, index) => (
              <div key={index} className="h-16 w-16 rounded-xl border border-zinc-800 overflow-hidden relative animate-in zoom-in">
                <img src={src} className="h-full w-full object-cover" alt="" />
                <button 
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-zinc-950/80 rounded-full h-4 w-4 text-[10px] text-white flex items-center justify-center font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddMockPhoto}
              className="h-16 w-16 rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              <Gallery size={18} color="currentColor" variant="Broken" />
              <span className="text-[8px] font-bold">Add Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escrow Commitment Fee Notice */}
      <div className="glass border border-brand-500/20 bg-brand-500/5 p-4 rounded-2xl flex flex-col gap-3 text-left mb-6">
        <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
          <Flash size={14} color="currentColor" variant="Broken" />
          Escrow Guarantee commitment
        </span>
        <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
          HustlePay secures your ₦{artisan.pricing.calloutFee.toLocaleString()} call-out fee in a multi-sig smart escrow account. 
          The funds are only released to the artisan once they arrive at your service location and confirm the job assessment.
        </p>

        <div className="h-px bg-zinc-800 my-1"></div>

        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-zinc-400">Your Wallet Balance:</span>
          <span className={wallet && wallet.balance >= artisan.pricing.calloutFee ? 'text-success-400 font-bold' : 'text-danger-400 font-bold'}>
            ₦{wallet?.balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="fixed bottom-20 left-4 right-4 lg:absolute lg:bottom-20 z-10">
        <Button
          isDisabled={loading || !description}
          className="w-full font-bold h-11 bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/20 text-white transition-all flex items-center justify-center gap-2"
          onClick={handleConfirmBooking}
        >
          {loading && <Spinner size="sm" />}
          Pay ₦{artisan.pricing.calloutFee.toLocaleString()} & Confirm
        </Button>
      </div>
    </div>
  );
};

export default BookingFlow;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { User as UserIcon, Sms, Call, Location } from 'iconsax-react';
import { TextField, Label, Button, Spinner, RadioGroup, Radio, Checkbox } from '@heroui/react';
import BackgroundVideo from '../components/BackgroundVideo';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAppStore(state => state.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'seeker' | 'artisan'>('seeker');
  
  // NDPR compliance unbundled consents (GEN-7)
  const [termsConsent, setTermsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !address) {
      setError('Please fill in all details');
      return;
    }

    if (!termsConsent) {
      setError('You must accept the privacy policy terms to register');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      signup(name, email, phone, address, role);
      setLoading(false);
      navigate('/verify-email');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 bg-zinc-955/10 animate-in fade-in duration-300 pb-20 relative overflow-hidden min-h-screen">
      <BackgroundVideo />

      {/* Top Header Navigation */}
      <div className="flex justify-between items-center w-full mb-6">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="h-10 px-4 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-1.5"
          aria-label="Back to login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-xs font-bold">Login</span>
        </Button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center gap-4">
        {/* Brand Logo */}
        <img 
          src="/logo.png" 
          className="h-12 w-auto object-contain mb-1" 
          alt="HustlePay Logo" 
        />
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Create Account</h2>
          <p className="mt-1 text-xs text-zinc-555 font-light">Register to find certified artisans or offer services</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass border border-zinc-200 shadow-sm rounded-[32px] p-6 text-left">
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            
            {/* Role Selector */}
            <div className="flex flex-col gap-2 w-full text-left">
              <span className="text-zinc-500 text-xs font-semibold block">Choose your primary role</span>
              <RadioGroup
                value={role}
                onChange={(val) => setRole(val as 'seeker' | 'artisan')}
                orientation="horizontal"
              >
                <Radio value="seeker" className="text-xs text-zinc-800">Seeker (Customer)</Radio>
                <Radio value="artisan" className="text-xs text-zinc-800">Artisan (Provider)</Radio>
              </RadioGroup>
            </div>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-500 text-xs font-semibold text-left">Full Name</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-200 rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12">
                <UserIcon className="text-zinc-455 shrink-0 mr-1" size={18} color="currentColor" variant="Broken" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-500 text-xs font-semibold text-left">Email Address</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-200 rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12">
                <Sms className="text-zinc-455 shrink-0 mr-1" size={18} color="currentColor" variant="Broken" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-500 text-xs font-semibold text-left">Phone Number</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-200 rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12">
                <Call className="text-zinc-455 shrink-0 mr-1" size={18} color="currentColor" variant="Broken" />
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-500 text-xs font-semibold text-left">Home Address</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-200 rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12">
                <Location className="text-zinc-455 shrink-0 mr-1" size={18} color="currentColor" variant="Broken" />
                <input
                  type="text"
                  placeholder="Street address, City, State"
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </TextField>

            {/* NDPR compliance unbundled consent options (GEN-7) */}
            <div className="flex flex-col gap-3.5 mt-2">
              <Checkbox
                isSelected={termsConsent}
                onChange={setTermsConsent}
                className="text-zinc-500 text-xs leading-relaxed cursor-pointer select-none text-left"
              >
                I consent to the collection, processing, and storage of my personal details (N NIN, ID, Address) in accordance with the HustlePay Privacy Policy. (Required)
              </Checkbox>
              
              <Checkbox
                isSelected={marketingConsent}
                onChange={setMarketingConsent}
                className="text-zinc-500 text-xs leading-relaxed cursor-pointer select-none text-left"
              >
                Opt-in to receiving marketing and promotional newsletters. (Optional)
              </Checkbox>
            </div>

            {error && (
              <span className="text-[10px] text-danger font-semibold -mt-2 block">{error}</span>
            )}

            <Button
              type="submit"
              isDisabled={loading}
              className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/10 transition-all flex items-center justify-center gap-2 text-white-force"
            >
              {loading && <Spinner size="sm" />}
              <span>Sign Up</span>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

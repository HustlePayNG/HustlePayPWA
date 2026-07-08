import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { User as UserIcon, Sms, Call, Location } from 'iconsax-react';
import { TextField, Label, Button, Spinner, RadioGroup, Radio, Checkbox, Fieldset, Card } from '@heroui/react';
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
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [consentError, setConsentError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let hasError = false;

    if (!name) {
      setNameError('Please enter your full name.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!email) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!phone) {
      setPhoneError('Please enter your phone number.');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!address) {
      setAddressError('Please enter your home address.');
      hasError = true;
    } else {
      setAddressError('');
    }

    if (!termsConsent) {
      setConsentError('You must accept the privacy policy terms to register');
      hasError = true;
    } else {
      setConsentError('');
    }

    if (hasError) return;

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
      <div className="relative z-10 flex justify-between items-center w-full mb-6">
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

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center gap-4">
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

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="glass border-0 rounded-[32px] p-6 text-left bg-zinc-950/40">
          <form onSubmit={handleSignup}>
            <Fieldset>
              <Fieldset.Legend className="sr-only">Create Account details</Fieldset.Legend>
              
              <Fieldset.Group className="flex flex-col gap-5">
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
                  <Label className={`text-xs font-semibold text-left transition-colors ${nameError ? 'text-danger' : 'text-zinc-505'}`}>Full Name</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${nameError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <UserIcon className={`shrink-0 mr-1 transition-colors ${nameError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (e.target.value) setNameError('');
                      }}
                    />
                  </div>
                  {nameError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{nameError}</span>
                  )}
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className={`text-xs font-semibold text-left transition-colors ${emailError ? 'text-danger' : 'text-zinc-505'}`}>Email Address</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${emailError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <Sms className={`shrink-0 mr-1 transition-colors ${emailError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value) setEmailError('');
                      }}
                    />
                  </div>
                  {emailError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{emailError}</span>
                  )}
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className={`text-xs font-semibold text-left transition-colors ${phoneError ? 'text-danger' : 'text-zinc-505'}`}>Phone Number</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${phoneError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <Call className={`shrink-0 mr-1 transition-colors ${phoneError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (e.target.value) setPhoneError('');
                      }}
                    />
                  </div>
                  {phoneError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{phoneError}</span>
                  )}
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className={`text-xs font-semibold text-left transition-colors ${addressError ? 'text-danger' : 'text-zinc-505'}`}>Home Address</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${addressError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <Location className={`shrink-0 mr-1 transition-colors ${addressError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                    <input
                      type="text"
                      placeholder="Street address, City, State"
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (e.target.value) setAddressError('');
                      }}
                    />
                  </div>
                  {addressError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{addressError}</span>
                  )}
                </TextField>

                {/* NDPR compliance unbundled consent options (GEN-7) */}
                <div className="flex flex-col gap-3.5 mt-2">
                  <Checkbox
                    isSelected={termsConsent}
                    onChange={(val) => {
                      setTermsConsent(val);
                      if (val) setConsentError('');
                    }}
                    className="text-zinc-500 text-xs leading-relaxed cursor-pointer select-none text-left text-zinc-505"
                  >
                    I consent to the collection, processing, and storage of my personal details (N NIN, ID, Address) in accordance with the HustlePay Privacy Policy. (Required)
                  </Checkbox>
                  {consentError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{consentError}</span>
                  )}
                  
                  <Checkbox
                    isSelected={marketingConsent}
                    onChange={setMarketingConsent}
                    className="text-zinc-500 text-xs leading-relaxed cursor-pointer select-none text-left text-zinc-555"
                  >
                    Opt-in to receiving marketing and promotional newsletters. (Optional)
                  </Checkbox>
                </div>
              </Fieldset.Group>

              {error && (
                <span className="text-[10px] text-danger font-semibold mt-2 block">{error}</span>
              )}

              <Fieldset.Actions className="mt-5">
                <Button
                  type="submit"
                  isDisabled={loading}
                  className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-white-force"
                >
                  {loading && <Spinner size="sm" />}
                  <span>Sign Up</span>
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Signup;

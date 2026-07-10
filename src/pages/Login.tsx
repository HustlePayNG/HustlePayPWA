import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Eye, EyeSlash, Lock, Sms } from 'iconsax-react';
import { TextField, Label, Button, Spinner, Fieldset } from '@heroui/react';
import BackgroundVideo from '../components/BackgroundVideo';
import { liquidGlass } from '../components/liquidGlass';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tempRole: 'seeker' | 'artisan' = 'seeker';
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const instance = liquidGlass(cardRef.current, {
      scale: -112,
      chroma: 6,
      border: 0.07,
      mapBlur: 12,
      blur: 3,
      saturate: 1.5,
      fallbackBlur: 16
    });
    return () => {
      instance.destroy();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!email) {
      setEmailError('Please enter your email.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setLoading(true);
    setError('');

    // Wait a brief simulated time
    setTimeout(() => {
      const success = login(email, tempRole);
      setLoading(false);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email.');
      }
    }, 800);
  };



  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 bg-zinc-955/10 animate-in fade-in duration-300 relative overflow-hidden min-h-screen">
      <BackgroundVideo />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center gap-4">
        {/* Brand Logo */}
        <img
          src="/real logo.svg"
          className="h-5 w-auto object-contain mb-1"
          alt="HustlePay Logo"
        />
        <div>
          <p className="mt-1 text-xs text-zinc-555 font-light">Sign in to book artisans or manage jobs</p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div ref={cardRef} className="liquid-glass-auth rounded-[32px] p-6 text-left relative overflow-hidden">
          <form onSubmit={handleSubmit}>
            <Fieldset>
              <Fieldset.Legend className="sr-only">Sign In Credentials</Fieldset.Legend>

              <Fieldset.Group className="flex flex-col gap-5">

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className={`text-xs font-semibold text-left transition-colors ${emailError ? 'text-danger' : 'text-zinc-505'}`}>Email Address</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${emailError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <Sms className={`shrink-0 mr-1 transition-colors ${emailError ? 'text-danger' : 'text-zinc-450'}`} size={18} color="currentColor" variant="Broken" />
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
                  <Label className={`text-xs font-semibold text-left transition-colors ${passwordError ? 'text-danger' : 'text-zinc-505'}`}>Password</Label>
                  <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${passwordError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                    <Lock className={`shrink-0 mr-1 transition-colors ${passwordError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value) setPasswordError('');
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none text-zinc-400 hover:text-zinc-650 shrink-0">
                      {showPassword ? <EyeSlash size={18} color="currentColor" variant="Broken" /> : <Eye size={18} color="currentColor" variant="Broken" />}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="text-[10px] text-danger font-semibold text-left">{passwordError}</span>
                  )}
                  <div className="flex justify-end text-[10px] mt-0.5">
                    <Link to="/password-reset" className="text-brand-500 hover:text-brand-600 font-semibold hover:underline">Forgot password?</Link>
                  </div>
                </TextField>
              </Fieldset.Group>

              {error && (
                <span className="text-[10px] text-danger font-semibold mt-2 block">{error}</span>
              )}

              <Fieldset.Actions className="mt-5">
                <Button
                  type="submit"
                  isDisabled={loading}
                  className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white-force rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Spinner size="sm" />}
                  <span>Sign In</span>
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </form>

          {/* Social Sign-In Buttons */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200"></div></div>
              <div className="relative flex justify-center text-[10px]"><span className="px-2 bg-white text-zinc-550 uppercase tracking-widest font-bold">Or continue with</span></div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-1">
              <Button
                variant="outline"
                className="h-10 w-10 p-0 min-w-0 border-0 hover:bg-zinc-50 rounded-full flex items-center justify-center bg-transparent"
                aria-label="Sign in with Google"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </Button>

              <div className="w-px h-5 bg-zinc-200"></div>

              <Button
                variant="outline"
                className="h-10 w-10 p-0 min-w-0 border-0 hover:bg-zinc-50 rounded-full flex items-center justify-center bg-transparent"
                aria-label="Sign in with Apple"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.12.01.24.02.36.02.9 0 2.01-.58 2.46-1.35z" fill="#000000" />
                </svg>
              </Button>
            </div>
          </div>



          <p className="mt-6 text-center text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-500 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

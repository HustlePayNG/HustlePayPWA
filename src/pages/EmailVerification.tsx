import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sms, TickCircle, Refresh, ArrowLeft, DirectInbox } from 'iconsax-react';
import { Button, Spinner, toast } from '@heroui/react';
import BackgroundVideo from '../components/BackgroundVideo';
import { liquidGlass } from '../components/liquidGlass';
import { supabase } from '../services/supabase';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, syncSupabaseUserSession } = useAppStore();

  const targetEmail = location.state?.email || localStorage.getItem('hp_pending_signup_email') || localStorage.getItem('hp_pending_email') || user?.email || 'your email';
  const cardRef = useRef<HTMLDivElement>(null);

  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(60);

  // Store pending email for persistence on page reload
  useEffect(() => {
    if (location.state?.email) {
      localStorage.setItem('hp_pending_email', location.state.email);
    }
  }, [location.state?.email]);

  // Initialize liquid glass background styling
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

  // Resend countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatically detect when user verifies via Magic Link in email
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        syncSupabaseUserSession(session.user);
        setVerified(true);
        toast.success('Magic link verified successfully!');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, syncSupabaseUserSession]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter a 6-digit code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otpCode.trim(),
        type: 'signup'
      });

      if (error) {
        // Retry with type 'email'
        const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: otpCode.trim(),
          type: 'email'
        });

        if (error2) {
          throw error2;
        }

        if (data2.user) {
          syncSupabaseUserSession(data2.user);
        }
      } else if (data.user) {
        syncSupabaseUserSession(data.user);
      }

      setVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendMagicLink = async () => {
    if (!targetEmail || targetEmail === 'your email') {
      toast.danger('Email address not found. Please try signing up again.');
      return;
    }

    setResending(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        // Fallback to magic link OTP flow if resend type signup fails
        const { error: otpErr } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (otpErr) throw otpErr;
      }

      toast.success('New verification link sent to your email!');
      setTimer(60);
    } catch (err: any) {
      toast.danger(err.message || 'Failed to resend magic link');
    } finally {
      setResending(false);
    }
  };

  const handleOpenMailApp = () => {
    window.location.href = targetEmail.includes('@') ? `mailto:${targetEmail}` : 'mailto:';
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-zinc-955/10 relative overflow-hidden min-h-screen text-center animate-in fade-in duration-300">
      <BackgroundVideo />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {verified ? (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-500/10 text-success-500 border border-success-500/30">
              <TickCircle size={44} color="currentColor" variant="Broken" />
            </div>
            <h2 className="text-2xl font-medium text-zinc-900 tracking-tight">Account Verified!</h2>
            <p className="text-zinc-550 text-xs font-light">Redirecting you to your HustlePay dashboard...</p>
          </div>
        ) : (
          <>
            {/* Top Back Nav */}
            <div className="flex justify-start mb-4">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="h-10 px-4 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-1.5 bg-white/80 backdrop-blur-md cursor-pointer"
                aria-label="Back to login"
              >
                <ArrowLeft size={16} color="currentColor" variant="Broken" />
                <span className="text-xs font-semibold">Login</span>
              </Button>
            </div>

            <div className="flex justify-center mb-4">
              <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-500 animate-pulse">
                <Sms size={40} color="currentColor" variant="Broken" />
              </div>
            </div>

            <h2 className="text-2xl font-medium text-zinc-900 tracking-tight">Verify Your Email</h2>
            <p className="mt-2 text-xs text-zinc-555 font-light max-w-sm mx-auto">
              We sent a verification link & 6-digit code to{' '}
              <span className="text-brand-500 font-bold break-all">{targetEmail}</span>
            </p>

            <div ref={cardRef} className="liquid-glass-auth rounded-[32px] p-6 mt-6 relative overflow-hidden text-left">
              <div className="flex flex-col gap-4">
                {/* OTP Code Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <label className="text-[11px] text-zinc-700 font-bold block">
                    Enter 6-Digit Code (or click email link)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-white/80 border border-zinc-300 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold text-zinc-900 focus:outline-none focus:border-brand-500 tracking-widest shadow-inner"
                  />
                  {otpError && <p className="text-xs text-danger-500 font-medium">{otpError}</p>}

                  <Button
                    type="submit"
                    isDisabled={verifyingOtp || otpCode.length < 6}
                    className="w-full font-bold h-11 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {verifyingOtp ? <Spinner size="sm" /> : 'Confirm Code'}
                  </Button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] uppercase text-zinc-400 font-bold">OR</span>
                  <div className="flex-grow border-t border-zinc-200"></div>
                </div>

                <Button
                  onClick={handleOpenMailApp}
                  variant="outline"
                  className="w-full font-bold h-11 border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/60"
                >
                  <DirectInbox size={18} color="currentColor" variant="Broken" />
                  <span>Open Mail App</span>
                </Button>

                <div className="pt-2 border-t border-zinc-200/60 flex flex-col items-center gap-3">
                  <span className="text-[11px] text-zinc-500">Didn't receive the email? Check spam folder or</span>

                  {timer > 0 ? (
                    <span className="text-xs font-semibold text-zinc-500">
                      Resend link in <span className="text-brand-500 font-bold">{timer}s</span>
                    </span>
                  ) : (
                    <Button
                      onClick={handleResendMagicLink}
                      isDisabled={resending}
                      className="text-xs font-bold text-brand-500 hover:text-brand-600 bg-brand-500/10 hover:bg-brand-500/20 px-4 h-9 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {resending ? (
                        <Spinner size="sm" />
                      ) : (
                        <Refresh size={14} color="currentColor" variant="Broken" />
                      )}
                      <span>Resend Verification Link</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

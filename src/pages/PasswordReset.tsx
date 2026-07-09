import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sms, Danger, Key, TickCircle } from 'iconsax-react';
import { TextField, Label, Button, Spinner, Fieldset } from '@heroui/react';
import BackgroundVideo from '../components/BackgroundVideo';
import { liquidGlass } from '../components/liquidGlass';

export const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email address is required.');
      return;
    }
    setEmailError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setCodeError('Please enter the verification code.');
      return;
    }
    setCodeError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-zinc-955/10 relative overflow-hidden min-h-screen animate-in fade-in duration-300 pb-20">
      <BackgroundVideo />

      {/* Top Header Navigation */}
      <div className="relative z-10 flex justify-between items-center w-full mb-6">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="h-10 px-4 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl flex items-center justify-center gap-1.5 bg-transparent"
          aria-label="Back to login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-xs font-bold">Login</span>
        </Button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        {step === 1 && (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
                <Danger size={32} color="currentColor" variant="Broken" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Reset Password</h2>
            <p className="mt-1 text-xs text-zinc-555 font-light">Request a secure code to reset your password</p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
                <Key size={32} color="currentColor" variant="Broken" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Enter Reset Code</h2>
            <p className="mt-1 text-xs text-zinc-555 font-light">Check your email for the 6-digit verification code</p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
                <Key size={32} color="currentColor" variant="Broken" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">New Password</h2>
            <p className="mt-1 text-xs text-zinc-555 font-light">Set a strong password for security</p>
          </>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-500/10 text-success-500">
              <TickCircle size={36} color="currentColor" variant="Broken" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900">Password Updated!</h2>
            <p className="text-zinc-555 text-xs font-light">Your password has been changed successfully.</p>
            <Button
              className="w-full font-bold mt-4 h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all text-white-force"
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </Button>
          </div>
        )}

        {step < 4 && (
          <div ref={cardRef} className="liquid-glass-nav rounded-[32px] p-6 text-left mt-8 relative overflow-hidden">
            {step === 1 && (
              <form onSubmit={handleRequestCode}>
                <Fieldset>
                  <Fieldset.Legend className="sr-only">Request Reset Code</Fieldset.Legend>
                  <Fieldset.Group>
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
                  </Fieldset.Group>

                  <Fieldset.Actions className="mt-5">
                    <Button
                      type="submit"
                      isDisabled={loading}
                      className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-white-force"
                    >
                      {loading && <Spinner size="sm" />}
                      Send Verification Code
                    </Button>
                  </Fieldset.Actions>
                </Fieldset>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode}>
                <Fieldset>
                  <Fieldset.Legend className="sr-only">Verify Code</Fieldset.Legend>
                  <Fieldset.Group>
                    <TextField className="flex flex-col gap-1.5 w-full">
                      <Label className={`text-xs font-semibold text-left transition-colors ${codeError ? 'text-danger' : 'text-zinc-505'}`}>Verification Code</Label>
                      <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${codeError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                        <Key className={`shrink-0 mr-1 transition-colors ${codeError ? 'text-danger' : 'text-zinc-455'}`} size={18} color="currentColor" variant="Broken" />
                        <input
                          type="text"
                          placeholder="123456"
                          className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value);
                            if (e.target.value) setCodeError('');
                          }}
                        />
                      </div>
                      {codeError && (
                        <span className="text-[10px] text-danger font-semibold text-left">{codeError}</span>
                      )}
                    </TextField>
                  </Fieldset.Group>

                  <Fieldset.Actions className="mt-5">
                    <Button
                      type="submit"
                      isDisabled={loading}
                      className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-white-force"
                    >
                      {loading && <Spinner size="sm" />}
                      Confirm Code
                    </Button>
                  </Fieldset.Actions>
                </Fieldset>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSetPassword}>
                <Fieldset>
                  <Fieldset.Legend className="sr-only">Set New Password</Fieldset.Legend>
                  <Fieldset.Group className="flex flex-col gap-5">
                    <TextField className="flex flex-col gap-1.5 w-full">
                      <Label className={`text-xs font-semibold text-left transition-colors ${passwordError ? 'text-danger' : 'text-zinc-505'}`}>New Password</Label>
                      <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${passwordError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (e.target.value) setPasswordError('');
                          }}
                        />
                      </div>
                      {passwordError && (
                        <span className="text-[10px] text-danger font-semibold text-left">{passwordError}</span>
                      )}
                    </TextField>

                    <TextField className="flex flex-col gap-1.5 w-full">
                      <Label className={`text-xs font-semibold text-left transition-colors ${confirmPasswordError ? 'text-danger' : 'text-zinc-505'}`}>Confirm New Password</Label>
                      <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-2xl bg-zinc-50/50 focus-within:border-brand-500 transition-all h-12 ${confirmPasswordError ? 'border-danger focus-within:border-danger' : 'border-zinc-200'}`}>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (e.target.value) setConfirmPasswordError('');
                          }}
                        />
                      </div>
                      {confirmPasswordError && (
                        <span className="text-[10px] text-danger font-semibold text-left">{confirmPasswordError}</span>
                      )}
                    </TextField>
                  </Fieldset.Group>

                  <Fieldset.Actions className="mt-5">
                    <Button
                      type="submit"
                      isDisabled={loading}
                      className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-white-force"
                    >
                      {loading && <Spinner size="sm" />}
                      Update Password
                    </Button>
                  </Fieldset.Actions>
                </Fieldset>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;

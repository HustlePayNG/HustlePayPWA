import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sms, TickCircle } from 'iconsax-react';
import { Button, Spinner, Fieldset, Card } from '@heroui/react';
import BackgroundVideo from '../components/BackgroundVideo';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Focus next input
    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 1000);
  };

  const handleResend = () => {
    setTimer(60);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-zinc-955/10 relative overflow-hidden min-h-screen text-center animate-in fade-in duration-300">
      <BackgroundVideo />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {verified ? (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-500/10 text-success-500">
              <TickCircle size={36} color="currentColor" variant="Broken" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900">Email Verified!</h2>
            <p className="text-zinc-550 text-xs font-light">Redirecting you to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 text-brand-500">
                <Sms size={32} color="currentColor" variant="Broken" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Verify Your Email</h2>
            <p className="mt-2 text-xs text-zinc-555 font-light">
              We sent a verification code to <span className="text-brand-500 font-bold">{user?.email}</span>.
            </p>

            <Card className="glass border-0 rounded-[32px] p-6 mt-8 bg-zinc-950/40">
              <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                <Fieldset>
                  <Fieldset.Legend className="sr-only">Enter Verification Code</Fieldset.Legend>
                  
                  <Fieldset.Group className="flex flex-col gap-2.5 items-center justify-center">
                    <div className="flex gap-2.5 justify-center">
                      {code.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`digit-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            handleChange(idx, e.target.value);
                            if (codeError) setCodeError('');
                          }}
                          className={`w-11 h-14 bg-zinc-50/50 border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-900 rounded-2xl text-center font-black text-lg focus:outline-none transition-all ${codeError ? 'border-danger focus:border-danger' : 'border-zinc-200'}`}
                        />
                      ))}
                    </div>
                    {codeError && (
                      <span className="text-[10px] text-danger font-semibold text-center">{codeError}</span>
                    )}
                  </Fieldset.Group>

                  <Fieldset.Actions className="flex flex-col gap-4 mt-6">
                    <Button
                      type="submit"
                      className="w-full font-bold h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-white-force"
                      isDisabled={loading || code.some(d => d === '')}
                    >
                      {loading && <Spinner size="sm" />}
                      Verify Code
                    </Button>

                    <div className="text-xs text-zinc-500 text-center">
                      Didn't receive code?{' '}
                      {timer > 0 ? (
                        <span className="font-semibold text-zinc-700">Resend in {timer}s</span>
                      ) : (
                        <Button 
                          onClick={handleResend} 
                          className="text-brand-500 hover:text-brand-600 font-bold hover:underline p-0 h-auto min-w-0 bg-transparent inline"
                        >
                          Resend Now
                        </Button>
                      )}
                    </div>
                  </Fieldset.Actions>
                </Fieldset>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

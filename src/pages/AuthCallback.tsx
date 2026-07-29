import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store';
import { Spinner } from '@heroui/react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const syncSupabaseUserSession = useAppStore(state => state.syncSupabaseUserSession);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          syncSupabaseUserSession(session.user);
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, syncSupabaseUserSession]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-955 text-white p-6 text-center">
      <Spinner size="lg" color="current" className="text-brand-400 mb-4" />
      <h2 className="text-lg font-extrabold text-white">Completing Sign-In...</h2>
      <p className="text-xs text-zinc-400 mt-1">Authenticating your account credentials with HustlePay</p>
    </div>
  );
};

export default AuthCallback;

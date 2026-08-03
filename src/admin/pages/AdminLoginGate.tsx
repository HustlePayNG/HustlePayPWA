import React, { useState } from 'react';
import { Lock, Sms, Eye, EyeSlash, ShieldSecurity } from 'iconsax-react';
import { Button, Spinner, toast } from '@heroui/react';
import { useAppStore } from '../../store';
import { supabase } from '../../services/supabase';

interface AdminLoginGateProps {
  onSuccess: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@hustlepay.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.danger('Please enter admin credentials.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        await useAppStore.getState().syncSupabaseUserSession(data.user);
      }

      sessionStorage.setItem('hp_admin_auth', 'true');
      toast.success('Admin Security Clearance Verified!', {
        description: 'Welcome to HustlePay Operations Portal.'
      });
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      toast.danger('Invalid Admin Security Clearance', {
        description: err.message || 'Access denied. Incorrect email or secret security key.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-955 flex items-center justify-center p-4 text-left font-sans animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6">

        {/* Shield Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-1 shadow-lg shadow-brand-500/10">
            <ShieldSecurity size={36} color="currentColor" variant="Broken" />
          </div>
          <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-widest bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Restricted System Access
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">HustlePay Backdoor Portal</h2>
          <p className="text-xs text-zinc-400 font-light max-w-xs">
            Authenticate with verified Admin security credentials to access compliance, escrow, and user management controls.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminAuth} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">
              Admin Identification Email
            </label>
            <div className="flex items-center gap-2.5 px-3.5 h-11 bg-zinc-955 border border-zinc-800 rounded-2xl focus-within:border-brand-500 transition-all">
              <Sms size={16} className="text-zinc-500 shrink-0" color="currentColor" variant="Broken" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@hustlepay.com"
                className="bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">
              Secret Security Clearance Key
            </label>
            <div className="flex items-center gap-2.5 px-3.5 h-11 bg-zinc-955 border border-zinc-800 rounded-2xl focus-within:border-brand-500 transition-all">
              <Lock size={16} className="text-zinc-500 shrink-0" color="currentColor" variant="Broken" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin clearance key..."
                className="bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeSlash size={16} color="currentColor" variant="Broken" /> : <Eye size={16} color="currentColor" variant="Broken" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isDisabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs h-11 rounded-2xl shadow-lg shadow-brand-500/20 cursor-pointer disabled:opacity-50 transition-all mt-2"
          >
            {loading ? <Spinner size="sm" /> : 'Authenticate Admin Access'}
          </Button>

        </form>
      </div>
    </div>
  );
};

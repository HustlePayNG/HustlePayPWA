import { create } from 'zustand';
import type { User, Booking, Wallet, Notification } from '../types';
import { supabase } from '../services/supabase';
import { supabaseDb } from '../services/supabaseDb';

interface AppState {
  user: User | null;
  activeMode: 'seeker' | 'artisan';
  bookings: Booking[];
  wallet: Wallet | null;
  notifications: Notification[];
  unreadCount: number;
  isLiveSupabase: boolean;
  isAuthInitializing: boolean;
  
  // Actions
  login: (email: string, role: 'seeker' | 'artisan') => boolean;
  signup: (name: string, email: string, phone: string, address: string, initialRole: 'seeker' | 'artisan') => void;
  logout: () => void;
  switchMode: () => void;
  refreshUser: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  syncSupabaseUserSession: (supabaseUser: any) => Promise<void>;
  setAuthInitializing: (initializing: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  return {
    user: null,
    activeMode: 'seeker',
    bookings: [],
    wallet: null,
    notifications: [],
    unreadCount: 0,
    isLiveSupabase: true,
    isAuthInitializing: true,

    setAuthInitializing: (initializing: boolean) => set({ isAuthInitializing: initializing }),

    login: () => {
      // Deprecated mock method, handled via Supabase Auth in Login component
      return false;
    },

    signup: () => {
      // Deprecated mock method, handled via Supabase Auth in Signup component
    },

    syncSupabaseUserSession: async (supabaseUser: any) => {
      if (!supabaseUser) {
        set({ user: null, isAuthInitializing: false });
        return;
      }

      localStorage.setItem('hp_session_user_id', supabaseUser.id);
      
      try {
        const profile = await supabaseDb.getProfile(supabaseUser.id);
        if (profile) {
          const userObj: User = {
            id: profile.id,
            email: profile.email || supabaseUser.email || '',
            fullName: profile.full_name || supabaseUser.user_metadata?.full_name || 'HustlePay User',
            phone: profile.phone_number || supabaseUser.user_metadata?.phone_number || '',
            avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.id}`,
            role: profile.role || 'seeker',
            activeModePreference: profile.active_mode_preference || 'seeker',
            address: profile.address || { formattedAddress: 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792 },
            kycStatus: profile.kyc_status || 'unverified',
            businessName: profile.business_name,
            categoryId: profile.category_id,
            bio: profile.bio,
            yearsExperience: profile.years_experience,
            baseRate: profile.base_rate,
            calloutFee: profile.callout_fee,
            rateType: profile.rate_type,
            rating: profile.rating || 5.0,
            completedJobsCount: profile.completed_jobs_count || 0,
            verifiedBadge: profile.verified_badge || false,
            createdAt: profile.created_at || new Date().toISOString()
          };

          set({ user: userObj, activeMode: userObj.activeModePreference, isAuthInitializing: false });
          get().refreshWallet();
          get().refreshBookings();
          get().refreshNotifications();
          return;
        }
      } catch (err) {
        console.warn('Profile fetch note:', err);
      }

      // Fallback profile object constructed from Supabase User Auth metadata
      const fallbackUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'HustlePay User',
        phone: supabaseUser.phone || supabaseUser.user_metadata?.phone_number || '',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${supabaseUser.id}`,
        role: supabaseUser.user_metadata?.role || 'seeker',
        activeModePreference: supabaseUser.user_metadata?.role === 'artisan' ? 'artisan' : 'seeker',
        address: { formattedAddress: supabaseUser.user_metadata?.address || 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792 },
        kycStatus: 'unverified',
        createdAt: new Date().toISOString()
      };

      set({ user: fallbackUser, activeMode: fallbackUser.activeModePreference, isAuthInitializing: false });
    },

    logout: () => {
      localStorage.removeItem('hp_session_user_id');
      sessionStorage.removeItem('hp_session_user_id');
      sessionStorage.removeItem('hp_admin_auth');
      supabase.auth.signOut().catch(() => {});
      set({ user: null, activeMode: 'seeker', bookings: [], wallet: null, notifications: [], unreadCount: 0, isAuthInitializing: false });
    },

    switchMode: () => {
      const { user, activeMode } = get();
      if (!user) return;
      const targetMode: 'seeker' | 'artisan' = activeMode === 'seeker' ? 'artisan' : 'seeker';
      
      const updatedUser = { ...user, activeModePreference: targetMode };
      set({ user: updatedUser, activeMode: targetMode });
      supabaseDb.updateProfile(user.id, { active_mode_preference: targetMode } as any).catch(() => {});
      get().refreshBookings();
    },

    refreshUser: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const profile = await supabaseDb.getProfile(user.id);
        if (profile) {
          get().syncSupabaseUserSession({ ...user, ...profile });
        }
      } catch (e) {
        console.error('refreshUser error:', e);
      }
    },

    refreshWallet: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const w = await supabaseDb.getWallet(user.id);
        if (w) set({ wallet: w });
      } catch (e) {
        console.warn('refreshWallet error:', e);
      }
    },

    refreshBookings: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const { data } = await supabase.from('bookings').select('*').or(`seeker_id.eq.${user.id},artisan_id.eq.${user.id}`);
        if (data) set({ bookings: data as any });
      } catch (e) {
        console.warn('refreshBookings error:', e);
      }
    },

    refreshNotifications: async () => {
      const { user } = get();
      if (!user) return;
      try {
        const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) {
          const list = data as Notification[];
          const unread = list.filter(n => !n.read).length;
          set({ notifications: list, unreadCount: unread });
        }
      } catch (e) {
        console.warn('refreshNotifications error:', e);
      }
    },

    updateUserProfile: async (updates: Partial<User>) => {
      const { user } = get();
      if (!user) return;
      const updated = { ...user, ...updates };
      set({ user: updated });
      try {
        await supabaseDb.updateProfile(user.id, updates as any);
      } catch (e) {
        console.warn('updateUserProfile error:', e);
      }
    }
  };
});

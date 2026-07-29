import { create } from 'zustand';
import { mockDb, type User, type Booking, type Wallet, type Notification } from '../services/mockDb';
import { supabase } from '../services/supabase';

interface AppState {
  user: User | null;
  activeMode: 'seeker' | 'artisan';
  bookings: Booking[];
  wallet: Wallet | null;
  notifications: Notification[];
  unreadCount: number;
  isLiveSupabase: boolean;
  
  // Actions
  login: (email: string, role: 'seeker' | 'artisan') => boolean;
  signup: (name: string, email: string, phone: string, address: string, initialRole: 'seeker' | 'artisan') => void;
  logout: () => void;
  switchMode: () => void;
  refreshUser: () => void;
  refreshWallet: () => void;
  refreshBookings: () => void;
  refreshNotifications: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  syncSupabaseUserSession: (supabaseUser: any) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Load session from storage if it exists
  const getSessionUser = (): User | null => {
    const savedId = sessionStorage.getItem('hp_session_user_id');
    if (!savedId) return null;
    const u = mockDb.getUserById(savedId);
    return u || null;
  };

  const initialUser = getSessionUser();
  const initialMode = initialUser ? initialUser.activeModePreference : 'seeker';

  return {
    user: initialUser,
    activeMode: initialMode,
    bookings: [],
    wallet: null,
    notifications: [],
    unreadCount: 0,
    isLiveSupabase: !!import.meta.env.VITE_SUPABASE_URL,

    login: (email: string, role: 'seeker' | 'artisan') => {
      const user = mockDb.login(email, role);
      if (user) {
        sessionStorage.setItem('hp_session_user_id', user.id);
        set({ user, activeMode: user.activeModePreference });
        get().refreshWallet();
        get().refreshBookings();
        get().refreshNotifications();
        return true;
      }
      return false;
    },

    signup: (name: string, email: string, phone: string, address: string, initialRole: 'seeker' | 'artisan') => {
      const newUser = mockDb.signup({
        email,
        fullName: name,
        phone,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
        address: {
          formattedAddress: address,
          latitude: 6.5244, // Default Lagos Coordinates
          longitude: 3.3792
        }
      }, initialRole);

      sessionStorage.setItem('hp_session_user_id', newUser.id);
      set({ user: newUser, activeMode: initialRole });
      get().refreshWallet();
      get().refreshBookings();
      get().refreshNotifications();
    },

    syncSupabaseUserSession: (supabaseUser: any) => {
      if (!supabaseUser) return;
      
      sessionStorage.setItem('hp_session_user_id', supabaseUser.id);
      let existing = mockDb.getUserById(supabaseUser.id);
      
      if (!existing) {
        // Create user profile in mock DB matching Supabase user metadata
        existing = mockDb.signup({
          email: supabaseUser.email || 'user@hustlepay.com',
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'HustlePay User',
          phone: supabaseUser.phone || '08012345678',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${supabaseUser.id}`,
          address: {
            formattedAddress: 'Lagos, Nigeria',
            latitude: 6.5244,
            longitude: 3.3792
          }
        }, 'seeker');
        // Set exact ID to match Supabase Auth UUID
        existing.id = supabaseUser.id;
      }

      set({ user: existing, activeMode: existing.activeModePreference });
      get().refreshWallet();
      get().refreshBookings();
      get().refreshNotifications();
    },

    logout: () => {
      sessionStorage.removeItem('hp_session_user_id');
      supabase.auth.signOut().catch(() => {});
      set({ user: null, activeMode: 'seeker', bookings: [], wallet: null, notifications: [], unreadCount: 0 });
    },

    switchMode: () => {
      const { user, activeMode } = get();
      if (!user) return;
      const targetMode: 'seeker' | 'artisan' = activeMode === 'seeker' ? 'artisan' : 'seeker';
      
      const updatedUser = mockDb.updateUser(user.id, { activeModePreference: targetMode });
      set({ user: updatedUser, activeMode: targetMode });
      get().refreshBookings();
    },

    refreshUser: () => {
      const { user } = get();
      if (!user) return;
      const refreshed = mockDb.getUserById(user.id);
      if (refreshed) {
        set({ user: refreshed });
      }
    },

    refreshWallet: () => {
      const { user } = get();
      if (!user) return;
      const w = mockDb.getWallet(user.id);
      set({ wallet: w });
    },

    refreshBookings: () => {
      const { user, activeMode } = get();
      if (!user) return;
      const list = mockDb.getBookings(user.id, activeMode);
      set({ bookings: list });
    },

    refreshNotifications: () => {
      const { user } = get();
      if (!user) return;
      const list = mockDb.getNotifications(user.id);
      const unread = list.filter(n => !n.read).length;
      set({ notifications: list, unreadCount: unread });
    },

    updateUserProfile: (updates: Partial<User>) => {
      const { user } = get();
      if (!user) return;
      const updated = mockDb.updateUser(user.id, updates);
      set({ user: updated });
    }
  };
});

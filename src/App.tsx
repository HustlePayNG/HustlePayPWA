import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from './store';
import AppSplash from './components/AppSplash';
import { ToastProvider, toast } from '@heroui/react';

// Layout & PWA Prompt
import MobileFrame from './components/MobileFrame';
import AppLayout from './components/AppLayout';
import ReloadPrompt from './components/ReloadPrompt';
import InstallPWA from './components/InstallPWA';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import EmailVerification from './pages/EmailVerification';
import PasswordReset from './pages/PasswordReset';

// Seeker Pages
import SeekerHome from './pages/SeekerHome';
import ArtisanDetail from './pages/ArtisanDetail';
import BookingFlow from './pages/BookingFlow';
import Requests from './pages/Requests';

// Artisan Pages
import ArtisanOnboarding from './pages/ArtisanOnboarding';
import ArtisanDashboard from './pages/ArtisanDashboard';
import Bookings from './pages/Bookings';
import History from './pages/History';

// Shared Pages
import Wallet from './pages/Wallet';
import Disputes from './pages/Disputes';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Help from './pages/Help';
import IntroOnboarding from './pages/IntroOnboarding';
import More from './pages/More';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

// Admin Portal Pages
import AdminLayout from './admin/pages/AdminLayout';
import { AdminOverview } from './admin/pages/AdminOverview';
import { KycQueue } from './admin/pages/KycQueue';
import { AdminDisputes } from './admin/pages/AdminDisputes';
import { FinancialLedger } from './admin/pages/FinancialLedger';
import { UserDirectory } from './admin/pages/UserDirectory';
import { MarketplaceMonitor } from './admin/pages/MarketplaceMonitor';
import { ContentModeration } from './admin/pages/ContentModeration';

import { supabase } from './services/supabase';

// Route Guard
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthInitializing } = useAppStore();
  const introSeen = localStorage.getItem('hp_intro_seen') === 'true';

  if (isAuthInitializing) {
    return <AppSplash />;
  }
  
  if (!user) {
    if (!introSeen) {
      return <Navigate to="/intro" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Auth wrappers that redirect to intro if not yet completed
const LoginRoute = () => {
  const introSeen = localStorage.getItem('hp_intro_seen') === 'true';
  return introSeen ? <Login /> : <Navigate to="/intro" replace />;
};

const SignupRoute = () => {
  const introSeen = localStorage.getItem('hp_intro_seen') === 'true';
  return introSeen ? <Signup /> : <Navigate to="/intro" replace />;
};

// Home Redirect Switchboard (Decides what dashboard to show)
const HomeRedirect = () => {
  const { user, activeMode } = useAppStore();
  if (!user) return <Navigate to="/login" replace />;

  if (activeMode === 'artisan') {
    if (user.kycStatus !== 'approved') {
      return <ArtisanOnboarding />;
    }
    return <ArtisanDashboard />;
  }

  return <SeekerHome />;
};

export const App: React.FC = () => {
  const { syncSupabaseUserSession, setAuthInitializing } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session restoration check & listener
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          syncSupabaseUserSession(session.user);
        } else {
          setAuthInitializing(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setAuthInitializing(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncSupabaseUserSession(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setAuthInitializing(false);
      }
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, [syncSupabaseUserSession, setAuthInitializing]);

  if (loading) {
    return (
      <MobileFrame>
        <AppSplash />
      </MobileFrame>
    );
  }

  return (
    <>
      <ToastProvider placement="top" />
      <BrowserRouter>
        <Routes>
          {/* Admin Secret Portal (Full Desktop Viewport) */}
          <Route path="/backdoor" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="kyc" element={<KycQueue />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="ledger" element={<FinancialLedger />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="marketplace" element={<MarketplaceMonitor />} />
            <Route path="content" element={<ContentModeration />} />
          </Route>

          {/* Mobile PWA Application Routes */}
          <Route
            path="/*"
            element={
              <MobileFrame>
                <Routes>
                  {/* Intro Tour */}
                  <Route path="/intro" element={<IntroOnboarding />} />

                  {/* Non-Layout Auth Pages */}
                  <Route path="/login" element={<LoginRoute />} />
                  <Route path="/signup" element={<SignupRoute />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/password-reset" element={<PasswordReset />} />

                  {/* Authenticated Pages wrapped with Shell Layout */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <HomeRedirect />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/artisan/:id"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <ArtisanDetail />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/booking-flow/:id"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <BookingFlow />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/requests"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Requests />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/bookings"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Bookings />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/history"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <History />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/wallet"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Wallet />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/disputes"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Disputes />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/chat/:bookingId"
                    element={
                      <PrivateRoute>
                        <Chat />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Settings />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/help"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Help />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/more"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <More />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/discover"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Discover />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/messages"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Messages />
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />

                  {/* Fallback to 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MobileFrame>
            }
          />
        </Routes>

        {/* Service Worker Message Listener */}
        <ServiceWorkerListener />
        {/* PWA Update Prompter */}
        <ReloadPrompt />
        {/* PWA Downloader Prompt */}
        <InstallPWA />
      </BrowserRouter>
    </>
  );
};

// Listen for service worker events and handle push-notification clicks/foreground toasts
const ServiceWorkerListener: React.FC = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useAppStore();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'NAVIGATE') {
        navigate(data.url);
      } else if (data.type === 'PUSH_NOTIFICATION') {
        refreshNotifications();
        
        const payload = data.payload;
        if (payload) {
          toast.success(payload.title, {
            description: payload.body,
            timeout: 5000,
            actionProps: {
              children: 'View',
              style: { backgroundColor: '#33658a', color: '#ffffff' },
              className: 'bg-brand-500 hover:bg-brand-650 text-white font-bold text-white-force',
              onPress: () => {
                let targetUrl = '/';
                const notifData = payload.data || {};
                if (notifData.bookingId) {
                  targetUrl = `/booking-flow/${notifData.bookingId}`;
                } else if (notifData.chatId) {
                  targetUrl = `/chat/${notifData.chatId}`;
                } else if (notifData.disputeId) {
                  targetUrl = `/disputes`;
                } else if (payload.tag === 'payment-received' || payload.tag === 'withdrawal-complete') {
                  targetUrl = `/wallet`;
                }
                navigate(targetUrl);
              }
            }
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [navigate, refreshNotifications]);

  return null;
};

export default App;

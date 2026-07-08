import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import AppSplash from './components/AppSplash';
import { ToastProvider } from '@heroui/react';

// Layout & PWA Prompt
import MobileFrame from './components/MobileFrame';
import AppLayout from './components/AppLayout';
import ReloadPrompt from './components/ReloadPrompt';
import InstallPWA from './components/InstallPWA';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
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

// Route Guard
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  const introSeen = localStorage.getItem('hp_intro_seen') === 'true';
  
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
    // If not fully approved, they undergo onboarding (which displays pending screen)
    if (user.kycStatus !== 'approved') {
      return <ArtisanOnboarding />;
    }
    return <ArtisanDashboard />;
  }

  // Seeker Home
  return <SeekerHome />;
};

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

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
        <MobileFrame>
          <Routes>
            {/* Intro Tour */}
            <Route path="/intro" element={<IntroOnboarding />} />

            {/* Non-Layout Auth Pages */}
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignupRoute />} />
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

        {/* PWA Update Prompter */}
        <ReloadPrompt />
        {/* PWA Downloader Prompt */}
        <InstallPWA />
      </BrowserRouter>
    </>
  );
};

export default App;

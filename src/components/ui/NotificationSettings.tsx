import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Card, Switch, Divider, Button } from './';
import { Spinner } from '@heroui/react';
import { NotificationBing, MessageText, Card as CardIcon, Send2, TickCircle, CloseCircle, InfoCircle, Warning2, ShieldTick, ShieldCross, Notepad, More2 } from 'iconsax-react';

export const NotificationSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
    simulateNotification,
    isSupported
  } = usePushNotifications();

  const [showTestOptions, setShowTestOptions] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (permission === 'granted' && !isSubscribed) {
      // Auto-subscribe if permission granted but not subscribed
      // We don't auto-subscribe to respect user choice
    }
  }, [permission, isSubscribed]);

  const handleTogglePush = async () => {
    if (isLoading) return;

    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission === 'default') {
        const perm = await requestPermission();
        if (perm === 'granted') {
          await subscribe();
        }
      } else if (permission === 'granted') {
        await subscribe();
      } else {
        setTestResult('Notifications are blocked. Please enable them in browser settings.');
      }
    }
  };

  const handleTestNotification = async (template: keyof typeof import('../../services/pushNotifications').NotificationTemplates) => {
    try {
      await simulateNotification(template);
      setTestResult(`Test notification sent: ${template}`);
      setTimeout(() => setTestResult(null), 3000);
    } catch (err) {
      setTestResult(`Failed to send test: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-3 text-amber-400">
          <CloseCircle size={20} color="currentColor" />
          <div>
            <p className="font-medium text-white">Push Notifications Unavailable</p>
            <p className="text-sm text-zinc-400">Your browser doesn't support push notifications.</p>
          </div>
        </div>
      </Card>
    );
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-400', icon: <TickCircle size={16} color="currentColor" />, label: 'Enabled' };
      case 'denied':
        return { color: 'text-red-400', icon: <CloseCircle size={16} color="currentColor" />, label: 'Blocked' };
      default:
        return { color: 'text-amber-400', icon: <NotificationBing size={16} color="currentColor" />, label: 'Not Asked' };
    }
  };

  const status = getPermissionStatus();

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      {/* Push Notifications Master Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/15">
              <NotificationBing size={20} color="#33658A" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Push Notifications</h3>
              <p className="text-xs text-zinc-400">Receive real-time alerts for bookings, messages & payments</p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onValueChange={handleTogglePush}
            isDisabled={isLoading}
            className="h-6 w-11"
            thumbIcon={isLoading && <Spinner size="sm" className="animate-spin" />}
          />
        </div>

        {/* Permission Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Browser Permission:</span>
          <span className={`font-medium ${status.color} flex items-center gap-1`}>
            {status.icon}
            {status.label}
          </span>
          {permission === 'denied' && (
            <a
              href="chrome://settings/content/notifications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-400 hover:underline ml-auto"
            >
              Open Settings
            </a>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
          >
            {testResult}
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <Divider className="border-zinc-800" />

      {/* In-App Notification Types */}
      <div>
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <NotificationBing size={16} color="#33658A" />
          In-App Notification Types
        </h4>
        <NotificationTypeToggles />
      </div>

      {/* Divider */}
      <Divider className="border-zinc-800" />

      {/* Test Notifications (Debug) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <span className="p-1.5 rounded bg-zinc-800">🧪</span>
            Test Notifications
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTestOptions(!showTestOptions)}
            className="text-xs"
          >
            {showTestOptions ? 'Hide' : 'Show Tests'}
          </Button>
        </div>

        {showTestOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
          >
            <p className="text-xs text-zinc-500 mb-2">Click to test different notification types:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'bookingRequested', label: 'Booking Request', icon: Notepad },
                { key: 'bookingAccepted', label: 'Booking Accepted', icon: TickCircle },
                { key: 'bookingDeclined', label: 'Booking Declined', icon: CloseCircle },
                { key: 'jobStarted', label: 'Job Started', icon: Send2 },
                { key: 'jobCompleted', label: 'Job Completed', icon: TickCircle },
                { key: 'paymentReceived', label: 'Payment Received', icon: CardIcon },
                { key: 'paymentSent', label: 'Payment Sent', icon: CardIcon },
                { key: 'newMessage', label: 'New Message', icon: MessageText },
                { key: 'disputeFiled', label: 'Dispute Filed', icon: Warning2 },
                { key: 'withdrawalComplete', label: 'Withdrawal Complete', icon: CardIcon },
                { key: 'artisanApproved', label: 'Artisan Approved', icon: ShieldTick },
                { key: 'artisanRejected', label: 'Artisan Rejected', icon: ShieldCross }
              ].map((test) => (
                <Button
                  key={test.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification(test.key as keyof typeof import('../../services/pushNotifications').NotificationTemplates)}
                  isDisabled={isLoading}
                  className="justify-start gap-2 text-xs h-9 px-3"
                >
                  <test.icon size={14} color="currentColor" />
                  {test.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Info about push notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10"
      >
        <div className="flex items-start gap-2">
          <InfoCircle size={16} color="#33658A" className="shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 leading-relaxed">
            <p className="font-medium text-white mb-1">About Push Notifications</p>
            <p>Push notifications work even when the app is closed. You&apos;ll receive alerts for:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>New booking requests (artisans)</li>
              <li>Booking accepted/declined (seekers)</li>
              <li>Job started/completed</li>
              <li>Payment confirmations</li>
              <li>New chat messages</li>
              <li>Dispute notifications</li>
              <li>Wallet withdrawals</li>
            </ul>
            <p className="mt-2">Notifications are sent via the Web Push API using VAPID keys. Your subscription is stored locally and never shared.</p>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

// In-App Notification Type Toggles
const NotificationTypeToggles: React.FC = () => {
  const [types, setTypes] = useState({
    bookingRequests: true,
    bookingUpdates: true,
    jobUpdates: true,
    payments: true,
    messages: true,
    disputes: true,
    wallet: true,
    marketing: false
  });

  useEffect(() => {
    localStorage.setItem('hp_notification_preferences', JSON.stringify(types));
  }, [types]);

  useEffect(() => {
    const stored = localStorage.getItem('hp_notification_preferences');
    if (stored) {
      try {
        setTypes(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const notificationTypes: Array<{
    key: keyof typeof types;
    label: string;
    desc: string;
    icon: React.ComponentType<any>;
  }> = [
    { key: 'bookingRequests', label: 'Booking Requests', desc: 'New booking requests & responses', icon: Notepad },
    { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Accepted, declined, price proposed', icon: TickCircle },
    { key: 'jobUpdates', label: 'Job Progress', desc: 'Job started, in progress, completed', icon: Send2 },
    { key: 'payments', label: 'Payments', desc: 'Received, sent, refunded, commission', icon: CardIcon },
    { key: 'messages', label: 'Messages', desc: 'New chat messages from bookings', icon: MessageText },
    { key: 'disputes', label: 'Disputes', desc: 'Dispute filed, resolved, updates', icon: Warning2 },
    { key: 'wallet', label: 'Wallet', desc: 'Top-ups, withdrawals, balance changes', icon: CardIcon },
    { key: 'marketing', label: 'Marketing', desc: 'Tips, updates, promotions (optional)', icon: More2 }
  ];

  return (
    <div className="space-y-2">
      {notificationTypes.map(({ key, label, desc, icon: Icon }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * notificationTypes.findIndex(t => t.key === key) }}
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Icon size={16} color="#33658A" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">{label}</p>
              <p className="text-xs text-zinc-500">{desc}</p>
            </div>
          </div>
          <Switch
            checked={types[key]}
            onValueChange={() => setTypes((prev) => ({ ...prev, [key]: !prev[key] }))}
            className="h-5 w-9"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationSettings;
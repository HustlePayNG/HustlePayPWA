import { mockDb } from './mockDb';

// VAPID Public Key - In production, this should come from your backend
// Generated with: npx web-push generate-vapid-keys
export const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// Convert base64 string to Uint8Array for push subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  createdAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Initialize the service - call this on app startup
  async initialize(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    this.userId = userId;

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;

      // Get existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      if (this.subscription) {
        console.log('Existing push subscription found');
        await this.saveSubscriptionToStorage();
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Check if user has granted notification permission
  getPermissionState(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  // Request notification permission from user
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.registration) {
      console.error('Push notifications not initialized');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      // Subscribe with VAPID key
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any
      });

      console.log('Push subscription created:', this.subscription);
      await this.saveSubscriptionToStorage();

      // Notify other tabs about new subscription
      this.broadcastSubscriptionChange(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return true;

    try {
      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      this.clearSubscriptionFromStorage();
      this.broadcastSubscriptionChange(null);
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  // Get current subscription
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Check if currently subscribed
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Save subscription to localStorage (in production, send to backend)
  private async saveSubscriptionToStorage(): Promise<void> {
    if (!this.subscription || !this.userId) return;

    const subscriptionData: PushSubscriptionData = {
      endpoint: this.subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')!)))
      },
      userId: this.userId,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('hp_push_subscription', JSON.stringify(subscriptionData));

    // Also save to mockDb for simulation
    mockDb.createNotification(this.userId, 'Push Notifications Enabled', 'You will now receive real-time notifications for bookings, messages, and payments.');
  }

  // Load subscription from localStorage
  private loadSubscriptionFromStorage(): PushSubscriptionData | null {
    try {
      const stored = localStorage.getItem('hp_push_subscription');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load subscription from storage:', error);
    }
    return null;
  }

  // Clear subscription from localStorage
  private clearSubscriptionFromStorage(): void {
    localStorage.removeItem('hp_push_subscription');
  }

  // Broadcast subscription changes to other tabs
  private broadcastSubscriptionChange(subscription: PushSubscription | null): void {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('hp_push_notifications');
      channel.postMessage({
        type: 'SUBSCRIPTION_CHANGE',
        subscription: subscription ? {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          }
        } : null
      });
      channel.close();
    }
  }

  // Send a local notification (for testing or when push isn't available)
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) return;

    const options: any = {
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/pwa-192x192.png',
      image: payload.image,
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction ?? false,
      silent: payload.silent ?? false,
      vibrate: payload.vibrate ?? [200, 100, 200],
      timestamp: payload.timestamp ?? Date.now()
    };

    try {
      await this.registration.showNotification(payload.title, options as NotificationOptions);
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  // Simulate receiving a push notification (for testing)
  async simulatePushNotification(payload: NotificationPayload): Promise<void> {
    // In a real app, this would come from the server via the push service
    // For demo purposes, we show a local notification and store in mockDb
    await this.showLocalNotification(payload);

    if (this.userId) {
      mockDb.createNotification(this.userId, payload.title, payload.body);
    }
  }

  // Get subscription data for sending to backend
  getSubscriptionData(): PushSubscriptionData | null {
    const stored = this.loadSubscriptionFromStorage();
    if (stored) return stored;

    if (this.subscription && this.userId) {
      return {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')!)))
        },
        userId: this.userId,
        createdAt: new Date().toISOString()
      };
    }
    return null;
  }

  // Handle incoming push event (called from service worker via message)
  async handlePushMessage(data: unknown): Promise<void> {
    const payload = data as NotificationPayload;
    await this.showLocalNotification(payload);

    if (this.userId) {
      mockDb.createNotification(this.userId, payload.title, payload.body);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Helper functions for common notification types
export const NotificationTemplates = {
  bookingRequested: (artisanName: string, serviceName: string): NotificationPayload => ({
    title: 'New Booking Request',
    body: `${artisanName} requested you for ${serviceName}`,
    tag: 'booking-request',
    data: { type: 'booking_request' },
    actions: [
      { action: 'view', title: 'View Request' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  }),

  bookingAccepted: (artisanName: string, reference: string): NotificationPayload => ({
    title: 'Booking Accepted!',
    body: `${artisanName} accepted your booking (${reference})`,
    tag: 'booking-accepted',
    data: { type: 'booking_accepted' },
    actions: [
      { action: 'view', title: 'View Details' }
    ],
    vibrate: [100, 50, 100]
  }),

  bookingDeclined: (artisanName: string, reference: string): NotificationPayload => ({
    title: 'Booking Declined',
    body: `${artisanName} declined your booking (${reference}). Call-out fee refunded.`,
    tag: 'booking-declined',
    data: { type: 'booking_declined' },
    actions: [
      { action: 'view', title: 'Find Another' }
    ]
  }),

  jobStarted: (artisanName: string): NotificationPayload => ({
    title: 'Job Started',
    body: `${artisanName} has arrived and started the job`,
    tag: 'job-started',
    data: { type: 'job_started' },
    actions: [
      { action: 'view', title: 'Track Progress' }
    ]
  }),

  jobCompleted: (artisanName: string, reference: string): NotificationPayload => ({
    title: 'Job Completed',
    body: `${artisanName} marked the job completed (${reference}). Please confirm & pay.`,
    tag: 'job-completed',
    data: { type: 'job_completed' },
    actions: [
      { action: 'view', title: 'Confirm & Pay' },
      { action: 'dismiss', title: 'Later' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  }),

  paymentReceived: (amount: number, reference: string): NotificationPayload => ({
    title: 'Payment Received',
    body: `₦${amount.toLocaleString()} received for booking ${reference}`,
    tag: 'payment-received',
    data: { type: 'payment_received' },
    actions: [
      { action: 'view', title: 'View Wallet' }
    ]
  }),

  paymentSent: (amount: number, artisanName: string): NotificationPayload => ({
    title: 'Payment Sent',
    body: `₦${amount.toLocaleString()} paid to ${artisanName}`,
    tag: 'payment-sent',
    data: { type: 'payment_sent' },
    actions: [
      { action: 'view', title: 'View Receipt' }
    ]
  }),

  newMessage: (senderName: string, preview: string): NotificationPayload => ({
    title: `New Message from ${senderName}`,
    body: preview,
    tag: 'new-message',
    data: { type: 'new_message' },
    actions: [
      { action: 'view', title: 'Reply' },
      { action: 'dismiss', title: 'Later' }
    ],
    vibrate: [100, 50, 100]
  }),

  disputeFiled: (reference: string): NotificationPayload => ({
    title: 'Dispute Filed',
    body: `A dispute has been raised for booking ${reference}`,
    tag: 'dispute-filed',
    data: { type: 'dispute_filed' },
    actions: [
      { action: 'view', title: 'View Dispute' }
    ],
    requireInteraction: true,
    vibrate: [300, 100, 300]
  }),

  withdrawalComplete: (amount: number): NotificationPayload => ({
    title: 'Withdrawal Complete',
    body: `₦${amount.toLocaleString()} transferred to your bank account`,
    tag: 'withdrawal-complete',
    data: { type: 'withdrawal_complete' },
    actions: [
      { action: 'view', title: 'View Wallet' }
    ]
  }),

  artisanApproved: (): NotificationPayload => ({
    title: 'Application Approved!',
    body: 'Your artisan profile has been approved. You can now access the Artisan Dashboard.',
    tag: 'artisan-approved',
    data: { type: 'artisan_approved' },
    actions: [
      { action: 'view', title: 'Go to Dashboard' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  }),

  artisanRejected: (reason: string): NotificationPayload => ({
    title: 'Application Rejected',
    body: `Reason: ${reason}. Please revise and resubmit your documents.`,
    tag: 'artisan-rejected',
    data: { type: 'artisan_rejected' },
    actions: [
      { action: 'view', title: 'Resubmit' }
    ],
    requireInteraction: true
  })
};

export default pushNotificationService;
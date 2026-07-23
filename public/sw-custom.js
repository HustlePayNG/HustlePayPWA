// Custom Service Worker for HustlePay PWA Push Notifications
// This handles push events, notification clicks, and background sync

/// <reference types="vite-plugin-pwa/client" />

declare const self: ServiceWorkerGlobalScope;

// Types for push notification data
interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

// Handle push events
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushNotificationData;

  try {
    payload = event.data.json();
  } catch {
    // Fallback for plain text
    payload = {
      title: 'HustlePay',
      body: event.data.text(),
      tag: 'default'
    };
  }

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    tag: payload.tag || 'hustlepay-notification',
    requireInteraction: payload.requireInteraction ?? false,
    data: payload.data,
    actions: payload.actions,
    silent: false,
    vibrate: [200, 100, 200],
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data as Record<string, unknown> | undefined;
  const action = event.action;

  // Determine target URL based on notification data and action
  let targetUrl = '/';

  if (data) {
    const type = data.type as string;
    const bookingRef = data.bookingRef as string;
    const disputeRef = data.disputeRef as string;

    switch (type) {
      case 'booking_requested':
      case 'booking_accepted':
      case 'booking_declined':
      case 'job_started':
      case 'job_completed':
      case 'booking_confirmed':
        targetUrl = `/bookings?ref=${bookingRef}`;
        break;
      case 'dispute_filed':
        targetUrl = `/disputes?ref=${disputeRef}`;
        break;
      case 'payment_received':
      case 'payment_sent':
        targetUrl = '/wallet';
        break;
      case 'withdrawal':
        targetUrl = '/wallet';
        break;
      default:
        targetUrl = '/';
    }
  }

  // Handle action buttons
  if (action === 'view' && data) {
    // Action-specific handling if needed
  } else if (action === 'dismiss') {
    // Just close the notification (already closed above)
    return;
  }

  // Focus or open the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  // Track notification dismissal if needed
  const data = event.notification.data as Record<string, unknown> | undefined;
  if (data?.type) {
    console.log('Notification dismissed:', data.type);
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'send-message') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Sync pending messages when back online
async function syncMessages(): Promise<void> {
  try {
    // Get pending messages from IndexedDB and send them
    console.log('Syncing pending messages...');
    // Implementation would go here
  } catch (error) {
    console.error('Failed to sync messages:', error);
  }
}

// Sync pending bookings when back online
async function syncBookings(): Promise<void> {
  try {
    console.log('Syncing pending bookings...');
    // Implementation would go here
  } catch (error) {
    console.error('Failed to sync bookings:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data?.type === 'subscribePush') {
    // Handle push subscription from main thread
    event.waitUntil(handlePushSubscribe(event.data.payload));
  }
});

async function handlePushSubscribe(payload: { userId: string; subscription: unknown }): Promise<void> {
  try {
    // Store subscription in IndexedDB or send to server
    console.log('Push subscription received for user:', payload.userId);
  } catch (error) {
    console.error('Failed to handle push subscribe:', error);
  }
}

// Handle fetch for offline support
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.open('hustlepay-dynamic').then(async (cache) => {
      try {
        const response = await fetch(event.request);
        // Cache successful responses
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Return cached response if available
        const cached = await cache.match(event.request);
        if (cached) return cached;

        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          const offline = await cache.match('/offline.html');
          if (offline) return offline;
        }
        return new Response('Offline', { status: 503 });
      }
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event: ExtendableEvent & { tag: string }) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkForNewNotifications());
  }
});

async function checkForNewNotifications(): Promise<void> {
  try {
    // In a real app, this would poll the server for new notifications
    console.log('Checking for new notifications...');
  } catch (error) {
    console.error('Failed to check notifications:', error);
  }
}

console.log('HustlePay Service Worker loaded');
import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, type NotificationPayload, NotificationTemplates } from '../services/pushNotifications';
import { useAppStore } from '../store';

export function usePushNotifications() {
  const { user } = useAppStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (!user) {
      setPermission('default');
      setIsSubscribed(false);
      return;
    }

    const initPush = async () => {
      setIsLoading(true);
      try {
        const initialized = await pushNotificationService.initialize(user.id);
        if (initialized) {
          const currentPermission = pushNotificationService.getPermissionState();
          setPermission(currentPermission);
          
          let subscribed = pushNotificationService.isSubscribed();
          // Auto-subscribe by default if permission is already granted but not subscribed
          if (currentPermission === 'granted' && !subscribed) {
            const sub = await pushNotificationService.subscribe();
            subscribed = sub !== null;
          }
          setIsSubscribed(subscribed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize push notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initPush();
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await pushNotificationService.subscribe();
      const success = subscription !== null;
      setIsSubscribed(success);
      setPermission(pushNotificationService.getPermissionState());
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.unsubscribe();
      setIsSubscribed(!success);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show a local notification (for testing)
  const showNotification = useCallback(async (payload: NotificationPayload): Promise<void> => {
    await pushNotificationService.showLocalNotification(payload);
  }, []);

  // Simulate a push notification (for testing)
  const simulateNotification = useCallback(async (template: keyof typeof NotificationTemplates, ...args: unknown[]): Promise<void> => {
    const templateFn = NotificationTemplates[template] as (...args: unknown[]) => NotificationPayload;
    if (templateFn) {
      const payload = templateFn(...args);
      await pushNotificationService.simulatePushNotification(payload);
    }
  }, []);

  // Request permission only
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const perm = await pushNotificationService.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showNotification,
    simulateNotification,
    requestPermission,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window
  };
}
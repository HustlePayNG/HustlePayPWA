import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@heroui/react';

export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW Register Error: ', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App Ready Offline', {
        description: 'HustlePay has been cached for offline use.',
        timeout: 5000,
        onClose: () => setOfflineReady(false),
      });
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info('Update Available', {
        description: 'A new version of HustlePay is ready.',
        timeout: 0, // Persistent toast until clicked or dismissed
        actionProps: {
          children: 'Reload & Update',
          style: { backgroundColor: '#33658a', color: '#ffffff' },
          className: 'bg-brand-500 hover:bg-brand-650 text-white font-bold text-white-force',
          onPress: () => {
            updateServiceWorker(true);
            setNeedRefresh(false);
          },
        },
        onClose: () => setNeedRefresh(false),
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};

export default ReloadPrompt;

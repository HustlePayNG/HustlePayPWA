import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

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

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] glass p-4 rounded-2xl flex flex-col gap-3 max-w-sm mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-5 text-left">
      <div className="flex flex-col text-left">
        <span className="font-bold text-sm text-white">
          {offlineReady ? 'App Ready Offline' : 'Update Available'}
        </span>
        <span className="text-xs text-zinc-400 font-light">
          {offlineReady
            ? 'HustlePay has been cached for offline use.'
            : 'A new version of HustlePay is ready. Reload to update.'}
        </span>
      </div>
      <div className="flex gap-2 justify-end text-xs font-bold">
        {needRefresh && (
          <button 
            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors"
            onClick={() => updateServiceWorker(true)}
          >
            Reload & Update
          </button>
        )}
        <button 
          className="px-3.5 py-2 border border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl transition-colors"
          onClick={close}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ReloadPrompt;

import { useCallback } from 'react';
import { toast } from '@heroui/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const showToast = useCallback((
    type: ToastType,
    message: string,
    options?: ToastOptions
  ) => {
    const baseOptions = {
      title: options?.title,
      description: options?.description ?? message,
      duration: options?.duration ?? 4000,
      action: options?.action,
    };

    switch (type) {
      case 'success':
        toast.success(baseOptions);
        break;
      case 'error':
        toast.error(baseOptions);
        break;
      case 'warning':
        toast.warning(baseOptions);
        break;
      case 'info':
        toast.info(baseOptions);
        break;
      default:
        toast(baseOptions);
    }
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast('success', message, options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast('error', message, options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast('warning', message, options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast('info', message, options);
  }, [showToast]);

  return { toast: showToast, success, error, warning, info };
}

export type UseToastReturn = ReturnType<typeof useToast>;
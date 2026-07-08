import { useCallback } from 'react';
import { toast } from '@heroui/react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info' | 'default';

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
    const toastMessage = options?.title || message;
    const herouiOptions = {
      description: options?.title ? message : options?.description,
      timeout: options?.duration ?? 4000,
      actionProps: options?.action ? {
        children: options.action.label,
        onPress: options.action.onClick
      } : undefined
    };

    switch (type) {
      case 'success':
        toast.success(toastMessage, herouiOptions);
        break;
      case 'danger':
        toast.danger(toastMessage, herouiOptions);
        break;
      case 'warning':
        toast.warning(toastMessage, herouiOptions);
        break;
      case 'info':
        toast.info(toastMessage, herouiOptions);
        break;
      default:
        toast(toastMessage, herouiOptions);
    }
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast('success', message, options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast('danger', message, options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast('warning', message, options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast('info', message, options);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
}

export type UseToastReturn = ReturnType<typeof useToast>;
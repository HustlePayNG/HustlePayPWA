import { useState, useCallback } from 'react';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export function useModal(initialOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setOpen: setIsOpen };
}

export interface UseModalFormReturn<T> extends UseModalReturn {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  reset: (initialData?: T) => void;
  isSubmitting: boolean;
  setSubmitting: (submitting: boolean) => void;
}

export function useModalForm<T extends Record<string, any>>(
  initialData: T,
  initialOpen = false
): UseModalFormReturn<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setData(initialData);
  }, [initialData]);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback((newData?: T) => {
    setData(newData ?? initialData);
  }, [initialData]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen: setIsOpen,
    data,
    setData,
    updateField,
    reset,
    isSubmitting,
    setSubmitting: setIsSubmitting,
  };
}

export interface UseAsyncModalReturn<T> extends UseModalReturn {
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
}

export function useAsyncModal(initialOpen = false): UseAsyncModalReturn<any> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const open = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const execute = useCallback(async (asyncFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isOpen, open, close, toggle, setOpen: setIsOpen, execute, loading, error };
}
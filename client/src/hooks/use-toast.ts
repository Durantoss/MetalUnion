import { useState } from 'react';

interface ToastData {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = (data: ToastData) => {
    setToasts(prev => [...prev, data]);
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  };

  return { toast, toasts };
}
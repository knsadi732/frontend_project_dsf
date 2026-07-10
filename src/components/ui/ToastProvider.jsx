import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { subscribeToast } from '@/utils/toastBus';
import { cn } from '@/utils/cn';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const VARIANTS = {
  success: 'border-success/40 text-success',
  error: 'border-danger/40 text-danger',
  info: 'border-info/40 text-info',
};

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    return subscribeToast((toast) => {
      setToasts((current) => [...current, toast]);
      setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    });
  }, [dismiss]);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant] ?? Info;
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2 rounded-md border bg-surface px-3 py-2 text-sm shadow-lg',
                VARIANTS[toast.variant] ?? VARIANTS.info,
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-text">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-text-muted hover:text-text"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

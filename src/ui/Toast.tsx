import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
type Toast = {
  id: number;
  message: string;
};
const ToastContext = createContext<{
  show: (message: string) => void;
} | null>(null);
export function ToastProvider({
  children
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, {
      id,
      message
    }]);
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 2800);
  }, []);
  return <ToastContext.Provider value={{
    show
  }}>{children}<div className="toast-stack" aria-live="polite">{toasts.map(toast => <div className="toast" role="status" key={toast.id}>{toast.message}</div>)}</div></ToastContext.Provider>;
}
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider.');
  return value;
}

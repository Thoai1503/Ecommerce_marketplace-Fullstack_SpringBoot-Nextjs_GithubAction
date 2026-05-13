
import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastComponent, { Toast, ToastType } from "../components/ui/Toast";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  // Aliases để tương thích với code cũ (useLogin dùng showSuccess/showError)
  showSuccess?: (message: string) => void;
  showError?: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);

  // Aliases cho API cũ
  const showSuccess = success;
  const showError = error;

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning, showSuccess, showError }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastComponent
          key={toast.id}
          toast={toast}       
          onClose={removeToast} 
        />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

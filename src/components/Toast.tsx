"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const TOAST_CONFIG: Record<ToastType, { icon: string; bg: string; border: string; shadow: string }> = {
  success: {
    icon: "✅",
    bg: "bg-green-100",
    border: "border-green-600",
    shadow: "shadow-[4px_4px_0px_#16a34a]",
  },
  error: {
    icon: "❌",
    bg: "bg-red-100",
    border: "border-red-600",
    shadow: "shadow-[4px_4px_0px_#dc2626]",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-[#FDCB6E]",
    border: "border-[#E67E22]",
    shadow: "shadow-[4px_4px_0px_#E67E22]",
  },
  info: {
    icon: "ℹ️",
    bg: "bg-blue-100",
    border: "border-blue-600",
    shadow: "shadow-[4px_4px_0px_#2563eb]",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = TOAST_CONFIG[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`${config.bg} border-4 ${config.border} ${config.shadow} p-4 min-w-[300px] max-w-[400px]`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm uppercase">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm text-gray-700 mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs hover:bg-gray-800 transition-colors"
        >
          ✕
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        className="h-1 bg-black mt-3"
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: "success", title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: "error", title, message, duration: 7000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: "warning", title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: "info", title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Standalone notification component for inline use
interface NotificationProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function Notification({ type, title, message, onClose, className = "" }: NotificationProps) {
  const config = TOAST_CONFIG[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${config.bg} border-4 ${config.border} ${config.shadow} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm uppercase">{title}</h4>
          {message && (
            <p className="text-sm text-gray-700 mt-1">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Alert banner component for page-level notifications
interface AlertBannerProps {
  type: ToastType;
  children: ReactNode;
  className?: string;
}

export function AlertBanner({ type, children, className = "" }: AlertBannerProps) {
  const config = TOAST_CONFIG[type];

  return (
    <div className={`${config.bg} border-4 ${config.border} p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1 text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  type?: "error" | "warning" | "info" | "success";
}

export default function ErrorAlert({
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  type = "error",
}: ErrorAlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: "❌",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: "⚠️",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: "ℹ️",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: "✅",
    },
  };

  const style = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
    >
      <div
        className={`${style.bg} ${style.border} border-4 p-4 shadow-[6px_6px_0px_#000] flex items-start gap-3`}
      >
        <span className="text-2xl shrink-0">{style.icon}</span>
        <div className="flex-1">
          <p className={`${style.text} font-bold text-sm leading-relaxed`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-6 h-6 border-2 border-black bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-sm transition-colors"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// Hook para usar el ErrorAlert fácilmente
export function useErrorAlert() {
  const [error, setError] = useState<{
    message: string;
    type?: "error" | "warning" | "info" | "success";
  } | null>(null);

  const showError = (
    message: string,
    type: "error" | "warning" | "info" | "success" = "error"
  ) => {
    setError({ message, type });
  };

  const clearError = () => {
    setError(null);
  };

  const ErrorAlertComponent = error ? (
    <AnimatePresence>
      <ErrorAlert
        message={error.message}
        type={error.type}
        onClose={clearError}
      />
    </AnimatePresence>
  ) : null;

  return { showError, clearError, ErrorAlertComponent };
}

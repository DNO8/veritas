"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface NotificationToastProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  type?: "success" | "info" | "warning" | "error";
}

export default function NotificationToast({
  message,
  onClose,
  autoClose = true,
  duration = 4000,
  type = "success",
}: NotificationToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: "✅",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: "ℹ️",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: "⚠️",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: "❌",
    },
  };

  const style = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
    >
      <div
        className={`${style.bg} ${style.border} border-4 p-4 shadow-[6px_6px_0px_#000] flex items-start gap-3 bg-white`}
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

export function useNotification() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "success" | "info" | "warning" | "error";
    }>
  >([]);

  const showNotification = (
    message: string,
    type: "success" | "info" | "warning" | "error" = "success"
  ) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const NotificationContainer = (
    <AnimatePresence>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </AnimatePresence>
  );

  return { showNotification, NotificationContainer };
}

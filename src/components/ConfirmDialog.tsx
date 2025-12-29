"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const typeStyles = {
    danger: {
      bg: "bg-red-50",
      border: "border-red-500",
      button: "bg-red-500 hover:bg-red-600",
      icon: "🚨",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      button: "bg-yellow-500 hover:bg-yellow-600",
      icon: "⚠️",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      button: "bg-blue-500 hover:bg-blue-600",
      icon: "ℹ️",
    },
  };

  const style = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <div
                className={`${style.bg} ${style.border} border-4 p-6 shadow-[8px_8px_0px_#000] bg-white`}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl shrink-0">{style.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onCancel}
                    className="flex-1 btn-brutal bg-white py-3 text-sm font-bold"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 ${style.button} border-4 border-black py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showConfirm = (
    title: string,
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: "danger" | "warning" | "info";
      onConfirm?: () => void;
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        type: options?.type,
        onConfirm: () => {
          options?.onConfirm?.();
          resolve(true);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
      });
    });
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      type={dialogState.type}
      onConfirm={dialogState.onConfirm || (() => {})}
      onCancel={handleCancel}
    />
  );

  return { showConfirm, ConfirmDialogComponent };
}

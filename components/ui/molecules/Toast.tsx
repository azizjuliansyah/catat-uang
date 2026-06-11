"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onRetry?: () => void;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => void;
  success: (message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => void;
  error: (message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => void;
  warning: (message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => void;
  info: (message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, options?: Omit<ToastMessage, "id" | "type" | "message">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const isCritical = type === "error" || type === "warning";
      
      const newToast: ToastMessage = {
        id,
        type,
        message,
        onRetry: options?.onRetry,
      };

      setToasts((prev) => {
        const next = [...prev, newToast];
        if (next.length > 3) {
          return next.slice(next.length - 3);
        }
        return next;
      });

      if (!isCritical) {
        const duration = options?.duration || 4000;
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, opt?: Omit<ToastMessage, "id" | "type" | "message">) => toast("success", msg, opt), [toast]);
  const error = useCallback((msg: string, opt?: Omit<ToastMessage, "id" | "type" | "message">) => toast("error", msg, opt), [toast]);
  const warning = useCallback((msg: string, opt?: Omit<ToastMessage, "id" | "type" | "message">) => toast("warning", msg, opt), [toast]);
  const info = useCallback((msg: string, opt?: Omit<ToastMessage, "id" | "type" | "message">) => toast("info", msg, opt), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-3 font-sans"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const isCritical = t.type === "error" || t.type === "warning";

          const typeStyles = {
            success: {
              border: "border-success/30",
              accent: "bg-success",
              icon: CheckCircle,
              iconColor: "text-success",
              label: "Sukses",
            },
            error: {
              border: "border-danger/30",
              accent: "bg-danger",
              icon: AlertCircle,
              iconColor: "text-danger",
              label: "Gagal",
            },
            warning: {
              border: "border-warning/30",
              accent: "bg-warning",
              icon: AlertTriangle,
              iconColor: "text-warning",
              label: "Peringatan",
            },
            info: {
              border: "border-info/30",
              accent: "bg-info",
              icon: Info,
              iconColor: "text-info",
              label: "Informasi",
            },
          };

          const style = typeStyles[t.type];
          const Icon = style.icon;

          return (
            <div
              key={t.id}
              role={isCritical ? "alert" : "status"}
              aria-live={isCritical ? "assertive" : "polite"}
              className={`flex items-start bg-surface-card border ${style.border} rounded-xl shadow-xl overflow-hidden animate-fade-in`}
            >
              <div className={`w-1.5 self-stretch ${style.accent}`} />
              <div className="flex-1 p-3.5 flex gap-3 items-start">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary leading-tight">
                    {style.label}
                  </p>
                  <p className="text-xs text-text-secondary mt-1 leading-normal">
                    {t.message}
                  </p>
                  {t.onRetry && (
                    <button
                      onClick={() => {
                        t.onRetry?.();
                        removeToast(t.id);
                      }}
                      className="mt-2 text-xs font-bold text-primary hover:text-primary-hover hover:underline cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

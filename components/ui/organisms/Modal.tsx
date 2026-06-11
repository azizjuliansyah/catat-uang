import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDestructive?: boolean;
  className?: string;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  isDestructive = false,
  className = "",
  footer,
  onSubmit,
}: ModalProps) {
  const modalRef = useRef<any>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDestructive) {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      firstElement.focus();
      window.addEventListener("keydown", handleTab);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keydown", handleTab);
      };
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDestructive]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDestructive) {
      onClose();
    }
  };

  const Container = onSubmit ? "form" : "div";

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <Container
        ref={modalRef}
        onSubmit={onSubmit}
        className={`bg-surface-card border border-border w-full sm:max-w-md md:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] font-sans ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <h3 id="modal-title" className="text-base font-bold text-text-primary tracking-tight font-display">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-hover cursor-pointer"
            aria-label="Tutup Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm text-text-secondary leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-border/50 bg-surface-card rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </Container>
    </div>
  );
}

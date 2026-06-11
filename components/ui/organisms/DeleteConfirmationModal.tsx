import React from "react";
import { Modal } from "./Modal";
import { Button } from "../atoms/Button";
import { AlertCircle, LucideIcon } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => void;
  isSubmitting: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  title,
  onConfirm,
  isSubmitting,
  icon: Icon = AlertCircle,
  children
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      isDestructive
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Hapus
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mb-2">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-xs text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </Modal>
  );
}

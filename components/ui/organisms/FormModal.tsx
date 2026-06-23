"use client";

import React from "react";
import { Modal } from "./Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";

export type FormModalSize = "sm" | "md" | "lg";
export type FormModalVariant = "primary" | "destructive" | "success";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  variant?: FormModalVariant;
  size?: FormModalSize;
  className?: string;
  footerClassName?: string;
  contentClassName?: string;
  showFooter?: boolean;
}

/**
 * Form modal wrapper for consistent form patterns.
 *
 * @example
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   title="Edit Target"
 *   isSubmitting={isSubmitting}
 *   submitText="Simpan Target"
 * >
 *   <FormField label="Nama" required value={name} onChange={setName} />
 *   <FormField label="Jumlah" type="currency" value={amount} onChange={setAmount} />
 * </FormModal>
 */
function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Simpan",
  cancelText = "Batal",
  isSubmitting = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  footerClassName = "",
  contentClassName = "",
  showFooter = true,
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      className={className}
      footer={
        showFooter ? (
          <ModalFooter
            onCancel={onClose}
            onSubmit={(e) => {
              e?.preventDefault();
              onSubmit(e as React.FormEvent);
            }}
            isSubmitting={isSubmitting}
            submitText={submitText}
            cancelText={cancelText}
            variant={variant}
            className={footerClassName}
            disabled={disabled}
          />
        ) : undefined
      }
    >
      <div className={`space-y-4 ${contentClassName}`}>
        {children}
      </div>
    </Modal>
  );
}

// Optional sub-components for compound pattern
interface FormModalSectionProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormModalSection({
  label,
  required = false,
  children,
  className = "",
}: FormModalSectionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

interface FormModalCompound extends React.FC<FormModalProps> {
  Section: typeof FormModalSection;
}

const FormModalWithSubComponents = FormModal as FormModalCompound;
FormModalWithSubComponents.Section = FormModalSection;

export { FormModalWithSubComponents as FormModal };

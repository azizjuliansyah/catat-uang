import React from "react";
import { Button } from "../atoms/Button";

interface ModalFooterProps {
  onCancel: () => void;
  onSubmit?: (e?: React.MouseEvent | React.FormEvent) => void | Promise<void>;
  cancelText?: string;
  submitText?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  variant?: "primary" | "destructive" | "success";
  alignment?: "left" | "center" | "right" | "space-between";
  cancelVariant?: "ghost" | "secondary";
  submitVariant?: "primary" | "destructive" | "success";
  fullWidth?: boolean;
  className?: string;
}

export function ModalFooter({
  onCancel,
  onSubmit,
  cancelText = "Batal",
  submitText = "Simpan",
  isSubmitting = false,
  disabled = false,
  variant = "primary",
  alignment = "right",
  cancelVariant = "ghost",
  submitVariant,
  fullWidth = true,
  className = "",
}: ModalFooterProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    "space-between": "justify-between",
  };

  const actualSubmitVariant = submitVariant || variant;

  return (
    <div className={`flex items-center gap-3 ${alignmentClasses[alignment]} ${className}`}>
      <Button
        type="button"
        variant={cancelVariant}
        size="sm"
        fullWidth={fullWidth}
        onClick={onCancel}
        disabled={disabled || isSubmitting}
      >
        {cancelText}
      </Button>
      <Button
        type={onSubmit ? "button" : "submit"}
        variant={actualSubmitVariant}
        size="sm"
        isLoading={isSubmitting}
        fullWidth={fullWidth}
        disabled={disabled}
        onClick={onSubmit}
      >
        {submitText}
      </Button>
    </div>
  );
}

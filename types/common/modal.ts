/**
 * Shared modal type definitions
 * Base types that all modal components should extend
 */

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormModalProps extends BaseModalProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export interface DeleteModalProps extends BaseModalProps {
  onConfirm: () => void;
  isSubmitting: boolean;
}

"use client";

import { Modal } from "@/components/ui/organisms/Modal";
import { ModalFooter } from "@/components/ui/molecules/ModalFooter";
import { Sparkles } from "lucide-react";

interface ConfirmApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmApplyTemplateModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmApplyTemplateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terapkan Template Kategori?"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          isSubmitting={isSubmitting}
          cancelText="Batal"
          submitText="Terapkan"
          variant="primary"
        />
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 text-body text-text-secondary leading-relaxed">
          Apakah Anda yakin ingin menerapkan template kategori bawaan?
          <br />
          <br />
          Tindakan ini akan menambahkan kategori-kategori standar (seperti makanan, transportasi, gaji, dll.) yang belum ada di akun Anda. Kategori yang sudah ada tidak akan diubah atau dihapus.
        </div>
      </div>
    </Modal>
  );
}

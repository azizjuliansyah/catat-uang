"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/molecules/Toast";
import { DeleteConfirmationModal } from "@/components/ui/organisms/DeleteConfirmationModal";
import { Trash2 } from "lucide-react";
import { TransactionTemplateItem } from "@/app/providers/AppProvider";

interface DeleteTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToDelete: TransactionTemplateItem | null;
  onDeleteSuccess: () => void;
}

export function DeleteTemplateModal({
  isOpen,
  onClose,
  templateToDelete,
  onDeleteSuccess
}: DeleteTemplateModalProps) {
  const supabase = createClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  async function handleTemplateDelete() {
    if (!templateToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("transaction_templates")
        .delete()
        .eq("id", templateToDelete.id);

      if (error) throw error;

      showSuccessToast(`Template "${templateToDelete.name}" berhasil dihapus.`);
      onDeleteSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error deleting template:", err);
      showErrorToast("Gagal menghapus template: " + getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Template Transaksi?"
      onConfirm={handleTemplateDelete}
      isSubmitting={deleting}
      icon={Trash2}
    >
      Apakah Anda yakin ingin menghapus template transaksi{" "}
      <span className="font-bold text-text-primary">{templateToDelete?.name}</span>?
      <br />
      <br />
      Tindakan ini hanya akan menghapus konfigurasi template dan tidak akan menghapus transaksi yang sudah dibuat dengannya. Tindakan ini tidak dapat dibatalkan.
    </DeleteConfirmationModal>
  );
}
